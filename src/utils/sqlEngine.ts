import { CSVData } from '../types';
import { loadTableData, getTableSchema, getAvailableTables } from './csvLoader';

export class SimpleSQLEngine {
  private dataCache: Map<string, any[]> = new Map();

  constructor() {
    // Initialize with empty cache - data will be loaded on demand
  }

  async executeQuery(query: string): Promise<any[]> {
    try {
      // Simple query parsing - this is a basic implementation
      const normalizedQuery = query.trim().toLowerCase();
      
      // Handle SELECT queries
      if (normalizedQuery.startsWith('select')) {
        return await this.handleSelectQuery(query);
      }
      
      // Handle simple table queries
      if (this.isTableQuery(query)) {
        return await this.getTableData(query);
      }
      
      throw new Error('Unsupported query type');
    } catch (error) {
      console.error('Query execution error:', error);
      throw error;
    }
  }

  private async handleSelectQuery(query: string): Promise<any[]> {
    // Basic SELECT parsing
    const selectMatch = query.match(/select\s+(.+?)\s+from\s+(\w+)/i);
    if (!selectMatch) {
      throw new Error('Invalid SELECT syntax');
    }

    const columns = selectMatch[1].split(',').map(col => col.trim());
    const tableName = selectMatch[2].trim();
    
    // Load table data on demand
    const tableData = await this.loadTableData(tableName);
    if (!tableData || tableData.length === 0) {
      throw new Error(`Table '${tableName}' not found or empty`);
    }

    let result = [...tableData];

    // Handle WHERE clause
    const whereMatch = query.match(/where\s+(.+?)(?=\s+(?:group\s+by|order\s+by|limit|$))/i);
    if (whereMatch) {
      result = this.applyWhereClause(result, whereMatch[1]);
    }

    // Handle GROUP BY clause
    const groupByMatch = query.match(/group\s+by\s+(.+?)(?=\s+(?:order\s+by|limit|$))/i);
    if (groupByMatch) {
      result = this.applyGroupBy(result, columns, groupByMatch[1]);
    }

    // Handle ORDER BY clause
    const orderMatch = query.match(/order\s+by\s+(.+?)(?=\s+limit|$)/i);
    if (orderMatch) {
      result = this.applyOrderBy(result, orderMatch[1]);
    }

    // Handle LIMIT clause
    const limitMatch = query.match(/limit\s+(\d+)/i);
    if (limitMatch) {
      const limit = parseInt(limitMatch[1]);
      result = result.slice(0, limit);
    }

    // Select specific columns (only if not using GROUP BY)
    if (!groupByMatch && columns[0] !== '*') {
      result = result.map(row => {
        const selectedRow: any = {};
        columns.forEach(col => {
          if (row.hasOwnProperty(col)) {
            selectedRow[col] = row[col];
          }
        });
        return selectedRow;
      });
    }

    return result;
  }

  private isTableQuery(query: string): boolean {
    const tableNames = getAvailableTables();
    return tableNames.some(table => 
      query.trim().toLowerCase() === table.toLowerCase()
    );
  }

  private async getTableData(query: string): Promise<any[]> {
    const tableName = query.trim().toLowerCase();
    const actualTableName = getAvailableTables().find(
      key => key.toLowerCase() === tableName
    );
    
    if (!actualTableName) {
      throw new Error(`Table '${tableName}' not found`);
    }
    
    return await this.loadTableData(actualTableName);
  }

  private async loadTableData(tableName: string): Promise<any[]> {
    // Check cache first
    if (this.dataCache.has(tableName)) {
      return this.dataCache.get(tableName)!;
    }

    // Load data from API
    const data = await loadTableData(tableName);
    
    // Cache the result
    this.dataCache.set(tableName, data);
    
    return data;
  }

  private applyWhereClause(data: any[], whereClause: string): any[] {
    // Simple WHERE clause parsing
    const conditions = whereClause.split(/\s+and\s+|\s+or\s+/i);
    
    return data.filter(row => {
      return conditions.every(condition => {
        return this.evaluateCondition(row, condition.trim());
      });
    });
  }

  private applyGroupBy(data: any[], columns: string[], groupByClause: string): any[] {
    const groupColumns = groupByClause.split(',').map(col => col.trim());
    
    // Create groups based on group columns
    const groups = new Map<string, any[]>();
    
    data.forEach(row => {
      // Create group key from group columns
      const groupKey = groupColumns.map(col => String(row[col] || 'NULL')).join('|');
      
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(row);
    });

    // Process each group and apply aggregations
    const result: any[] = [];
    
    groups.forEach((groupRows, groupKey) => {
      const groupValues = groupKey.split('|');
      const groupedRow: any = {};
      
      // Add group column values
      groupColumns.forEach((col, index) => {
        groupedRow[col] = groupValues[index] === 'NULL' ? null : groupValues[index];
      });
      
      // Process each column for aggregations
      columns.forEach(col => {
        const trimmedCol = col.trim();
        
        if (trimmedCol === 'COUNT(*)') {
          // Special case for COUNT(*)
          groupedRow['COUNT(*)'] = groupRows.length;
        } else if (this.isAggregationColumn(trimmedCol)) {
          // Handle aggregation functions
          const { functionName, columnName } = this.parseAggregationColumn(trimmedCol);
          groupedRow[trimmedCol] = this.calculateAggregation(groupRows, functionName, columnName);
        } else if (groupColumns.includes(trimmedCol)) {
          // Group column - use first value
          groupedRow[trimmedCol] = groupRows[0][trimmedCol];
        } else {
          // Regular column - use first value from group
          groupedRow[trimmedCol] = groupRows[0][trimmedCol];
        }
      });
      
      result.push(groupedRow);
    });
    
    return result;
  }

  private isAggregationColumn(column: string): boolean {
    const aggregationFunctions = ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX'];
    return aggregationFunctions.some(func => 
      column.toUpperCase().startsWith(func + '(') && column.endsWith(')')
    ) || column === 'COUNT(*)';
  }

  private parseAggregationColumn(column: string): { functionName: string; columnName: string } {
    if (column === 'COUNT(*)') {
      return {
        functionName: 'COUNT',
        columnName: '*'
      };
    }
    
    const match = column.match(/^(\w+)\((.+)\)$/);
    if (!match) {
      throw new Error(`Invalid aggregation syntax: ${column}`);
    }
    
    return {
      functionName: match[1].toUpperCase(),
      columnName: match[2].trim()
    };
  }

  private calculateAggregation(groupRows: any[], functionName: string, columnName: string): any {
    const values = groupRows
      .map(row => row[columnName])
      .filter(val => val !== null && val !== undefined);
    
    if (values.length === 0) return null;
    
    switch (functionName) {
      case 'COUNT':
        if (columnName === '*') {
          // COUNT(*) - count all rows regardless of null/undefined values
          return groupRows.length;
        }
        return values.length;
        
      case 'SUM':
        return values.reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
        
      case 'AVG':
        const sum = values.reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
        return sum / values.length;
        
      case 'MIN':
        return Math.min(...values.map(val => parseFloat(val) || 0));
        
      case 'MAX':
        return Math.max(...values.map(val => parseFloat(val) || 0));
        
      default:
        throw new Error(`Unsupported aggregation function: ${functionName}`);
    }
  }

  private evaluateCondition(row: any, condition: string): boolean {
    // Parse condition like "column = value" or "column > value"
    const operators = ['=', '!=', '>', '<', '>=', '<=', 'like', 'contains'];
    
    for (const operator of operators) {
      if (condition.includes(operator)) {
        const parts = condition.split(operator).map(part => part.trim());
        if (parts.length === 2) {
          const [column, value] = parts;
          const columnValue = row[column];
          
          if (columnValue === undefined) return false;
          
          switch (operator) {
            case '=':
              return columnValue == value;
            case '!=':
              return columnValue != value;
            case '>':
              return columnValue > parseFloat(value);
            case '<':
              return columnValue < parseFloat(value);
            case '>=':
              return columnValue >= parseFloat(value);
            case '<=':
              return columnValue <= parseFloat(value);
            case 'like':
            case 'contains':
              return String(columnValue).toLowerCase().includes(value.toLowerCase().replace(/['"]/g, ''));
            default:
              return false;
          }
        }
      }
    }
    
    return true; // If no operator found, include the row
  }

  private applyOrderBy(data: any[], orderClause: string): any[] {
    const orderParts = orderClause.split(',').map(part => part.trim());
    
    return data.sort((a, b) => {
      for (const orderPart of orderParts) {
        const [column, direction] = orderPart.split(/\s+/);
        const aVal = a[column];
        const bVal = b[column];
        
        if (aVal === bVal) continue;
        
        let comparison = 0;
        if (typeof aVal === 'string') {
          comparison = aVal.localeCompare(bVal);
        } else {
          comparison = aVal < bVal ? -1 : 1;
        }
        
        if (direction && direction.toLowerCase() === 'desc') {
          comparison = -comparison;
        }
        
        return comparison;
      }
      return 0;
    });
  }

  async getAvailableTables(): Promise<string[]> {
    return getAvailableTables();
  }

  async getTableSchema(tableName: string): Promise<string[]> {
    return await getTableSchema(tableName);
  }

  // Clear cache to free memory
  clearCache(): void {
    this.dataCache.clear();
  }

  // Get cache statistics
  getCacheStats(): { size: number; tables: string[] } {
    return {
      size: this.dataCache.size,
      tables: Array.from(this.dataCache.keys())
    };
  }
}
