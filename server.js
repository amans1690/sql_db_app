const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000; // Changed to 3000 to match React default

// Detect if running in serverless environment
const isServerless = process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME;

// Middleware
app.use(cors());
app.use(express.json());

// CSV API endpoints (serve these before static files)
app.get('/api/csv/:table', async (req, res) => {
  try {
    const { table } = req.params;
    const csvPath = path.join(__dirname, 'example_csv', `${table}.csv`);
    
    // Check if file exists
    try {
      await fs.access(csvPath);
    } catch (error) {
      return res.status(404).json({ 
        error: `Table '${table}' not found`,
        message: `CSV file ${table}.csv does not exist`
      });
    }

    // Read and serve CSV file
    const csvContent = await fs.readFile(csvPath, 'utf8');
    
    // Set proper headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${table}.csv"`);
    res.setHeader('Cache-Control', 'no-cache');

    console.log('csvContent', csvContent);
    
    res.send(csvContent);
    
  } catch (error) {
    console.error(`Error serving CSV for table ${req.params.table}:`, error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to read CSV file'
    });
  }
});

// Get list of available tables
app.get('/api/tables', async (req, res) => {
  try {
    const csvDir = path.join(__dirname, 'example_csv');
    const files = await fs.readdir(csvDir);
    const csvFiles = files.filter(file => file.endsWith('.csv'));
    const tableNames = csvFiles.map(file => file.replace('.csv', ''));
    
    res.json({
      tables: tableNames,
      count: tableNames.length
    });
  } catch (error) {
    console.error('Error reading tables directory:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to read tables directory'
    });
  }
});

// Get table schema (first few rows to determine structure)
app.get('/api/schema/:table', async (req, res) => {
  try {
    const { table } = req.params;
    const csvPath = path.join(__dirname, 'example_csv', `${table}.csv`);
    
    // Check if file exists
    try {
      await fs.access(csvPath);
    } catch (error) {
      return res.status(404).json({ 
        error: `Table '${table}' not found`,
        message: `CSV file ${table}.csv does not exist`
      });
    }

    // Read CSV file
    const csvContent = await fs.readFile(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      return res.json({ columns: [], sampleData: [] });
    }

    // Parse headers (first line)
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    // Parse first few rows for sample data
    const sampleData = [];
    const maxSampleRows = Math.min(3, lines.length - 1);
    
    for (let i = 1; i <= maxSampleRows; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || null;
        });
        sampleData.push(row);
      }
    }
    
    res.json({
      table,
      columns: headers,
      sampleData,
      totalRows: lines.length - 1
    });
    
  } catch (error) {
    console.error(`Error getting schema for table ${req.params.table}:`, error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to read table schema'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'CSV Query API Server'
  });
});

// Serve static files from the React app build folder
app.use(express.static(path.join(__dirname, 'build')));

// Serve React app for all other routes (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: 'Something went wrong'
  });
});

// Start server only if not in serverless environment
if (!isServerless) {
  app.listen(PORT, () => {
    console.log(`🚀 CSV Query Application Server running on port ${PORT}`);
    console.log(`📁 Serving CSV files from: ${path.join(__dirname, 'example_csv')}`);
    console.log(`🌐 Application available at: http://localhost:${PORT}`);
    console.log(`📊 API endpoints available at: http://localhost:${PORT}/api/`);
    console.log(`📊 Available endpoints:`);
    console.log(`   GET /api/tables - List all available tables`);
    console.log(`   GET /api/schema/:table - Get table structure and sample data`);
    console.log(`   GET /api/csv/:table - Download CSV file for specific table`);
    console.log(`   GET /api/health - Server health check`);
    console.log(`🎯 React app served from: ${path.join(__dirname, 'build')}`);
  });
}

module.exports = app;
