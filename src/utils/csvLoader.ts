import Papa from 'papaparse';

// CSV file paths - these will be served by our Node.js server
const CSV_ENDPOINTS = {
  customers: '/api/csv/customers',
  employees: '/api/csv/employees',
  orders: '/api/csv/orders',
  order_details: '/api/csv/order_details',
  products: '/api/csv/products',
  categories: '/api/csv/categories',
  suppliers: '/api/csv/suppliers',
  territories: '/api/csv/territories',
  regions: '/api/csv/regions',
  shippers: '/api/csv/shippers',
  employee_territories: '/api/csv/employee_territories'
};

// Cache for loaded CSV data to avoid re-fetching
const csvCache = new Map<string, any[]>();

export const loadCSVData = async (): Promise<Record<string, any[]>> => {
  const data: Record<string, any[]> = {};
  
  try {
    // Load all CSV files in parallel from our Node.js server
    const loadPromises = Object.entries(CSV_ENDPOINTS).map(async ([key, endpoint]) => {
      try {
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
        }
        const csvText = await response.text();
        const parsedData = await parseCSV(csvText);
        data[key] = parsedData;
        csvCache.set(key, parsedData);
        return { key, success: true, count: parsedData.length };
      } catch (error) {
        console.warn(`Failed to load ${key}:`, error);
        // Fallback to sample data if CSV loading fails
        data[key] = getSampleData(key);
        return { key, success: false, count: data[key].length };
      }
    });

    await Promise.all(loadPromises);
    
    console.log('CSV data loaded successfully from Node.js server');
    return data;
  } catch (error) {
    console.error('Error loading CSV data:', error);
    // Fallback to sample data if all loading fails
    return getFallbackData();
  }
};

// Load specific table data (for lazy loading)
export const loadTableData = async (tableName: string): Promise<any[]> => {
  // Check cache first
  if (csvCache.has(tableName)) {
    return csvCache.get(tableName)!;
  }

  try {
    const endpoint = CSV_ENDPOINTS[tableName as keyof typeof CSV_ENDPOINTS];
    if (!endpoint) {
      throw new Error(`Table '${tableName}' not found`);
    }

    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
    }

    const csvText = await response.text();
    const parsedData = await parseCSV(csvText);
    
    // Cache the result
    csvCache.set(tableName, parsedData);
    
    return parsedData;
  } catch (error) {
    console.error(`Error loading table ${tableName}:`, error);
    // Return sample data as fallback
    return getSampleData(tableName);
  }
};

// Get table schema without loading full data
export const getTableSchema = async (tableName: string): Promise<string[]> => {
  try {
    const data = await loadTableData(tableName);
    if (data.length > 0) {
      return Object.keys(data[0]);
    }
    return [];
  } catch (error) {
    console.error(`Error getting schema for ${tableName}:`, error);
    return [];
  }
};

// Get available table names
export const getAvailableTables = (): string[] => {
  return Object.keys(CSV_ENDPOINTS);
};

// Parse CSV text using PapaParse
export const parseCSV = (csvText: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        resolve(results.data);
      },
      error: (error: any) => {
        reject(error);
      }
    });
  });
};

// Sample data fallback for when CSV loading fails
const getSampleData = (tableName: string): any[] => {
  const sampleData: Record<string, any[]> = {
    customers: [
      { customerID: 'ALFKI', companyName: 'Alfreds Futterkiste', contactName: 'Maria Anders', contactTitle: 'Sales Representative', address: 'Obere Str. 57', city: 'Berlin', region: null, postalCode: '12209', country: 'Germany', phone: '030-0074321', fax: '030-0076545' },
      { customerID: 'ANATR', companyName: 'Ana Trujillo Emparedados y helados', contactName: 'Ana Trujillo', contactTitle: 'Owner', address: 'Avda. de la Constitución 2222', city: 'México D.F.', region: null, postalCode: '05021', country: 'Mexico', phone: '(5) 555-4729', fax: '(5) 555-3745' }
    ],
    products: [
      { productID: 1, productName: 'Chai', supplierID: 1, categoryID: 1, quantityPerUnit: '10 boxes x 20 bags', unitPrice: 18.00, unitsInStock: 39, unitsOnOrder: 0, reorderLevel: 10, discontinued: false },
      { productID: 2, productName: 'Chang', supplierID: 1, categoryID: 1, quantityPerUnit: '24 - 12 oz bottles', unitPrice: 19.00, unitsInStock: 17, unitsOnOrder: 40, reorderLevel: 25, discontinued: false }
    ],
    employees: [
      { employeeID: 1, lastName: 'Davolio', firstName: 'Nancy', title: 'Sales Representative', titleOfCourtesy: 'Ms.', birthDate: '1948-12-08', hireDate: '1992-05-01', address: '507 - 20th Ave. E. Apt. 2A', city: 'Seattle', region: 'WA', postalCode: '98122', country: 'USA', homePhone: '(206) 555-9857', extension: '5467' }
    ]
  };
  
  return sampleData[tableName] || [];
};

// Complete fallback data
const getFallbackData = (): Record<string, any[]> => {
  return {
    customers: getSampleData('customers'),
    products: getSampleData('products'),
    employees: getSampleData('employees'),
    orders: [],
    categories: [],
    suppliers: [],
    territories: [],
    regions: [],
    shippers: [],
    order_details: [],
    employee_territories: []
  };
};
