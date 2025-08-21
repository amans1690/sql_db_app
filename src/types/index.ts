export interface QueryHistory {
  id: string;
  query: string;
  result: any[];
  timestamp: string; // ISO string format
}

export interface SavedQuery {
  id: string;
  name: string;
  query: string;
  timestamp: string; // ISO string format
}

export interface QueryResult {
  data: any[];
  columns: string[];
  rowCount: number;
  executionTime: number;
}

export interface CSVData {
  [tableName: string]: any[];
}

export interface FilterOption {
  column: string;
  value: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith';
}

export interface SortOption {
  column: string;
  direction: 'asc' | 'desc';
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalPages: number;
}
