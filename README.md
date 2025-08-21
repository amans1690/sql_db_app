# SQL Query Application

A modern, responsive React-based web application for running SQL-like queries on CSV data with advanced features including data visualization, filtering, sorting, and export capabilities. The application runs on a unified Node.js server that serves both the React frontend and CSV API endpoints.

## 🚀 Features

### **Core Functionality**
- **SQL-like Query Engine**: Execute SQL queries on CSV data with support for SELECT, WHERE, GROUP BY, ORDER BY, and LIMIT clauses
- **CSV Data Source**: Load and query data from CSV files stored in the `example_csv` folder
- **Real-time Execution**: Instant query execution with live results
- **Multiple Tabs**: Run different queries simultaneously in separate tabs

### **Advanced Query Features**
- **Aggregation Functions**: Support for COUNT(*), SUM, AVG, MIN, MAX with GROUP BY
- **Complex Queries**: Handle WHERE conditions, ORDER BY sorting, and LIMIT clauses
- **Smart Parsing**: Intelligent SQL parsing for various query types
- **Error Handling**: Comprehensive error messages and validation

### **Data Management**
- **Query History**: Track last 10 executed queries with timestamps
- **Saved Queries**: Save and manage frequently used queries
- **Export Options**: Download results as CSV or JSON files
- **Data Caching**: Efficient client-side caching for better performance

### **Data Visualization**
- **Interactive Charts**: Bar charts and line charts for data analysis
- **Dynamic Visualization**: Choose X and Y axes for custom charts
- **Responsive Charts**: Charts adapt to different screen sizes
- **Real-time Updates**: Charts update automatically with query results

### **User Interface**
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern UI**: Built with Chakra UI for a professional appearance
- **Collapsible Panels**: Organize interface elements efficiently
- **Touch-Friendly**: Optimized for both mouse and touch interactions

### **Data Analysis Tools**
- **Advanced Filtering**: Multi-column filtering with custom operators
- **Column Selection**: Choose which columns to display
- **Sorting**: Multi-column sorting with ascending/descending options
- **Pagination**: Navigate through large result sets efficiently
- **Search**: Global search across all data columns

## 🛠️ Technology Stack

### **Frontend**
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development with full type coverage
- **Chakra UI**: Professional component library with responsive design
- **Recharts**: Interactive data visualization library
- **Lucide React**: Beautiful, customizable icons

### **Backend**
- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Fast, unopinionated web framework
- **CORS**: Cross-origin resource sharing support
- **File System**: Efficient CSV file serving and processing

### **Data Processing**
- **PapaParse**: Fast CSV parsing library
- **Custom SQL Engine**: Lightweight SQL-like query processor
- **Memory Management**: Efficient data caching and processing

## 📋 Prerequisites

- **Node.js**: Version 16 or higher
- **npm**: Package manager (comes with Node.js)
- **Modern Browser**: Chrome, Firefox, Safari, or Edge with ES6+ support

## 🚀 Installation

### **1. Clone or Download the Project**
```bash
# If you have git installed
git clone <repository-url>
cd sql_query_db_app

# Or download and extract the ZIP file
# Then navigate to the project directory
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Build the React Application**
```bash
npm run build
```

### **4. Start the Application**
```bash
npm start
```

### **5. Open Your Browser**
Navigate to `http://localhost:3000` to view the application

## 🔧 Development Commands

### **Development Mode (Auto-reload)**
```bash
npm run dev
```
This will start the server with nodemon, automatically restarting when you make changes.

### **Production Build and Run**
```bash
npm run build:prod
```
This command builds the React app and then starts the server in one step.

### **Build Only**
```bash
npm run build
```
Builds the React application without starting the server.

## 📊 Available CSV Tables

The application comes with sample CSV files representing a Northwind database:

- **customers.csv**: Customer information and contact details
- **employees.csv**: Employee records and personal information
- **orders.csv**: Order transactions and shipping details
- **order_details.csv**: Individual order line items
- **products.csv**: Product catalog with pricing and inventory
- **categories.csv**: Product categorization
- **suppliers.csv**: Supplier information and contacts
- **territories.csv**: Sales territory definitions
- **regions.csv**: Geographic region information
- **shippers.csv**: Shipping company details
- **employee_territories.csv**: Employee-territory assignments

## 💡 Query Examples

### **Basic Queries**
```sql
-- View all products
SELECT * FROM products

-- View specific columns
SELECT productName, unitPrice FROM products

-- Simple filtering
SELECT * FROM products WHERE unitPrice > 20
```

### **Aggregation Queries**
```sql
-- Count products by category
SELECT categoryID, COUNT(*) FROM products GROUP BY categoryID

-- Average price by supplier
SELECT supplierID, AVG(unitPrice) FROM products GROUP BY supplierID

-- Total stock by category
SELECT categoryID, SUM(unitsInStock) FROM products GROUP BY categoryID
```

### **Complex Queries**
```sql
-- Filtered and sorted results
SELECT productName, unitPrice, unitsInStock 
FROM products 
WHERE unitPrice > 15 AND unitsInStock > 0
ORDER BY unitPrice DESC
LIMIT 10

-- Multi-table style queries (using JOIN logic)
SELECT p.productName, c.categoryName, s.companyName
FROM products p, categories c, suppliers s
WHERE p.categoryID = c.categoryID AND p.supplierID = s.supplierID
```

## 🏗️ Project Structure

```
sql_query_db_app/
├── example_csv/           # CSV data files
│   ├── customers.csv
│   ├── products.csv
│   ├── orders.csv
│   └── ... (other CSV files)
├── public/                # Static assets
│   └── index.html
├── src/                   # React source code
│   ├── components/        # React components
│   │   ├── App.tsx       # Main application component
│   │   ├── QueryTab.tsx  # Individual query tab
│   │   ├── QueryResults.tsx # Results display and visualization
│   │   ├── QueryHistoryPanel.tsx # Query history management
│   │   └── SavedQueriesPanel.tsx # Saved queries management
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/            # Utility functions
│   │   ├── csvLoader.ts  # CSV loading and parsing
│   │   └── sqlEngine.ts  # SQL query processing engine
│   ├── App.tsx           # Main application
│   └── index.tsx         # Application entry point
├── server.js             # Node.js Express server
├── package.json          # Project dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md             # This file
```

## 🌐 API Endpoints

The Node.js server provides the following API endpoints:

- **GET /api/csv/:table**: Download CSV file for specific table
- **GET /api/tables**: List all available tables
- **GET /api/schema/:table**: Get table structure and sample data
- **GET /api/health**: Server health check

## 📱 Responsive Design

The application is fully responsive and optimized for:

- **Mobile Phones** (320px+): Touch-optimized interface with collapsible panels
- **Tablets** (768px+): Balanced layouts with enhanced spacing
- **Desktop** (1024px+): Full-featured interface with maximum information density
- **Large Screens** (1280px+): Enterprise-grade layouts with advanced features

## 🎨 UI Components

### **Cards and Panels**
- **Query Editor**: SQL input with syntax highlighting
- **Results Display**: Tabular data with sorting and filtering
- **Visualization**: Interactive charts and graphs
- **History Panel**: Query execution history
- **Saved Queries**: Query management and organization

### **Interactive Elements**
- **Responsive Tables**: Horizontal scroll on mobile, full view on desktop
- **Collapsible Sections**: Efficient use of screen space
- **Touch-Friendly Buttons**: Optimized for mobile devices
- **Smart Navigation**: Adaptive navigation based on screen size

## 🔒 Security Features

- **Input Validation**: SQL injection prevention
- **Error Handling**: Secure error messages without information leakage
- **CORS Configuration**: Proper cross-origin request handling
- **File Access Control**: Restricted access to CSV files only

## 🚀 Performance Features

- **Client-Side Caching**: Efficient data caching for repeated queries
- **Lazy Loading**: Data loaded on-demand when queries are executed
- **Optimized Rendering**: React performance optimizations
- **Memory Management**: Efficient handling of large datasets

## 🧪 Testing

The application includes comprehensive error handling and validation:

- **Query Validation**: Syntax checking and error reporting
- **Data Validation**: CSV format validation and error handling
- **UI Testing**: Responsive design testing across devices
- **Performance Testing**: Query execution time monitoring

## 🤝 Contributing

To contribute to this project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the console for error messages
2. Verify that all dependencies are installed
3. Ensure Node.js version is 16 or higher
4. Check that CSV files are properly formatted

## 🔮 Future Enhancements

Planned features for future versions:

- **Database Support**: Direct database connections (MySQL, PostgreSQL)
- **Advanced Visualizations**: More chart types and customization options
- **Query Templates**: Pre-built query templates for common use cases
- **User Authentication**: Multi-user support with query sharing
- **Real-time Collaboration**: Collaborative query editing and sharing
- **Advanced Analytics**: Statistical analysis and data insights
- **API Integration**: Connect to external data sources
- **Mobile App**: Native mobile applications

## 📞 Contact

For questions, suggestions, or support, please open an issue in the project repository.

---

**Built with ❤️ using React, Node.js, and modern web technologies**
