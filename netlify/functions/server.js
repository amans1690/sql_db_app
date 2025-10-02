const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const path = require('path');

// Import our main server app
const app = require('../server');

// Configure app for serverless environment
const serverlessApp = serverless(app, {
  // Enable binary support for CSV files
  binary: true
});

// Export handler for Netlify Functions
exports.handler = async (event, context) => {
  // Set up context for serverless environment
  context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    const result = await serverlessApp(event, context);
    return result;
  } catch (error) {
    console.error('Serverless function error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: 'Function execution failed'
      })
    };
  }
};
