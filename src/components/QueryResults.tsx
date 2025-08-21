import React, { useState, useMemo } from 'react';
import {
  VStack,
  HStack,
  Box,
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Flex,
  IconButton,
  useDisclosure,
  Collapse,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Wrap,
  WrapItem,
  useBreakpointValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tooltip as ChakraTooltip,
  useToast,
} from '@chakra-ui/react';
import { 
  ChevronDown, 
  ChevronUp, 
  Download, 
  BarChart3, 
  TrendingUp, 
  Filter,
  SortAsc,
  SortDesc,
  Search,
  Eye,
  EyeOff
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface QueryResultsProps {
  data: any[];
  isMobile?: boolean;
  isTablet?: boolean;
}

interface FilterOption {
  column: string;
  value: string;
}

interface SortOption {
  column: string;
  direction: 'asc' | 'desc';
}

interface PaginationState {
  currentPage: number;
  pageSize: number;
}

const QueryResults: React.FC<QueryResultsProps> = ({ data, isMobile = false, isTablet = false }) => {
  const [filters, setFilters] = useState<FilterOption[]>([]);
  const [sorting, setSorting] = useState<SortOption[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({ currentPage: 1, pageSize: 10 });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [chartColumns, setChartColumns] = useState<{ x: string; y: string }>({ x: '', y: '' });
  
  const { isOpen: isFiltersOpen, onToggle: onFiltersToggle } = useDisclosure();
  const { isOpen: isColumnsOpen, onToggle: onColumnsToggle } = useToggle();
  const { isOpen: isVisualizationOpen, onToggle: onVisualizationToggle } = useDisclosure();
  
  const toast = useToast();

  // Initialize selected columns on first render
  React.useEffect(() => {
    if (data.length > 0 && selectedColumns.length === 0) {
      const columns = Object.keys(data[0]);
      setSelectedColumns(columns); // Show fewer columns on mobile
    }
  }, [data, selectedColumns.length]);

  // Get available columns for charts
  const numericColumns = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]).filter(col => {
      const sampleValue = data[0][col];
      return typeof sampleValue === 'number' || !isNaN(Number(sampleValue));
    });
  }, [data]);

  const stringColumns = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]).filter(col => {
      const sampleValue = data[0][col];
      return typeof sampleValue === 'string';
    });
  }, [data]);

  // Apply filters, sorting, and search
  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchTerm) {
      result = result.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply filters
    filters.forEach(filter => {
      result = result.filter(row =>
        String(row[filter.column]).toLowerCase().includes(filter.value.toLowerCase())
      );
    });

    // Apply sorting
    if (sorting.length > 0) {
      result.sort((a, b) => {
        for (const sort of sorting) {
          const aVal = a[sort.column];
          const bVal = b[sort.column];
          
          if (aVal === bVal) continue;
          
          let comparison = 0;
          if (typeof aVal === 'string') {
            comparison = aVal.localeCompare(bVal);
          } else {
            comparison = aVal < bVal ? -1 : 1;
          }
          
          if (sort.direction === 'desc') {
            comparison = -comparison;
          }
          
          if (comparison !== 0) return comparison;
        }
        return 0;
      });
    }

    return result;
  }, [data, filters, sorting, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / pagination.pageSize);
  const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;
  const paginatedData = filteredAndSortedData.slice(startIndex, endIndex);

  // Add filter
  const addFilter = () => {
    if (filters.length < 3) { // Limit to 3 filters for mobile
      setFilters([...filters, { column: Object.keys(data[0])[0] || '', value: '' }]);
    }
  };

  // Remove filter
  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  // Update filter
  const updateFilter = (index: number, field: 'column' | 'value', value: string) => {
    const newFilters = [...filters];
    newFilters[index][field] = value;
    setFilters(newFilters);
  };

  // Toggle column selection
  const toggleColumn = (column: string) => {
    setSelectedColumns(prev =>
      prev.includes(column)
        ? prev.filter(col => col !== column)
        : [...prev, column]
    );
  };

  // Toggle sorting
  const toggleSorting = (column: string) => {
    setSorting(prev => {
      const existing = prev.find(sort => sort.column === column);
      if (existing) {
        if (existing.direction === 'asc') {
          return prev.map(sort =>
            sort.column === column ? { ...sort, direction: 'desc' } : sort
          );
        } else {
          return prev.filter(sort => sort.column !== column);
        }
      } else {
        return [...prev, { column, direction: 'asc' }];
      }
    });
  };

  // Export functions
  const exportToCSV = () => {
    if (filteredAndSortedData.length === 0) return;
    
    const headers = selectedColumns.join(',');
    const rows = filteredAndSortedData.map(row =>
      selectedColumns.map(col => `"${row[col] || ''}"`).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'query_results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: 'Export Successful',
      description: 'Data exported to CSV file.',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const exportToJSON = () => {
    if (filteredAndSortedData.length === 0) return;
    
    const jsonData = filteredAndSortedData.map(row => {
      const filteredRow: any = {};
      selectedColumns.forEach(col => {
        filteredRow[col] = row[col];
      });
      return filteredRow;
    });
    
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'query_results.json';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: 'Export Successful',
      description: 'Data exported to JSON file.',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  // Chart data preparation
  const chartData = useMemo(() => {
    if (!chartColumns.x || !chartColumns.y || filteredAndSortedData.length === 0) return [];
    
    const grouped = filteredAndSortedData.reduce((acc, row) => {
      const xValue = String(row[chartColumns.x] || 'Unknown');
      const yValue = Number(row[chartColumns.y]) || 0;
      
      if (acc[xValue]) {
        acc[xValue] += yValue;
      } else {
        acc[xValue] = yValue;
      }
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [filteredAndSortedData, chartColumns]);

  if (data.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="gray.500">No data to display</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Search and Filters */}
      <Card>
        <CardHeader pb={2}>
          <Flex 
            direction={{ base: 'column', sm: 'row' }}
            justify="space-between"
            align={{ base: 'flex-start', sm: 'center' }}
            gap={3}
          >
            <Heading size={{ base: 'sm', md: 'md' }} color="blue.600">
              Search & Filters
            </Heading>
            <HStack spacing={2}>
              <ChakraTooltip label="Toggle filters" aria-label="Toggle filters">
                <IconButton
                  aria-label="Toggle filters"
                  icon={isFiltersOpen ? <EyeOff size={16} /> : <Eye size={16} />}
                  variant="ghost"
                  size="sm"
                  onClick={onFiltersToggle}
                  colorScheme="blue"
                />
              </ChakraTooltip>
              <ChakraTooltip label="Toggle columns" aria-label="Toggle columns">
                <IconButton
                  aria-label="Toggle columns"
                  icon={isColumnsOpen ? <EyeOff size={16} /> : <Eye size={16} />}
                  variant="ghost"
                  size="sm"
                  onClick={onColumnsToggle}
                  colorScheme="green"
                />
              </ChakraTooltip>
            </HStack>
          </Flex>
        </CardHeader>
        <CardBody pt={0}>
          <VStack spacing={4} align="stretch">
            {/* Search */}
            <Box>
              <Text mb={2} fontSize={{ base: 'sm', md: 'md' }} fontWeight="medium">
                Search
              </Text>
              <InputGroup>
                <InputLeftElement>
                  <Search size={16} />
                </InputLeftElement>
                <Input
                  placeholder="Search across all columns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size={{ base: 'sm', md: 'md' }}
                />
              </InputGroup>
            </Box>

            {/* Filters */}
            <Collapse in={isFiltersOpen}>
              <Box>
                <Flex justify="space-between" align="center" mb={3}>
                  <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="medium">
                    Filters
                  </Text>
                  <Button
                    size="sm"
                    onClick={addFilter}
                    isDisabled={filters.length >= 3}
                    colorScheme="blue"
                    variant="outline"
                  >
                    Add Filter
                  </Button>
                </Flex>
                
                <VStack spacing={3} align="stretch">
                  {filters.map((filter, index) => (
                    <HStack key={index} spacing={3}>
                      <Select
                        value={filter.column}
                        onChange={(e) => updateFilter(index, 'column', e.target.value)}
                        size="sm"
                        minW="150px"
                      >
                        {Object.keys(data[0]).map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </Select>
                      <Input
                        placeholder="Filter value..."
                        value={filter.value}
                        onChange={(e) => updateFilter(index, 'value', e.target.value)}
                        size="sm"
                        flex={1}
                      />
                      <IconButton
                        aria-label="Remove filter"
                        icon={<Text>×</Text>}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => removeFilter(index)}
                      />
                    </HStack>
                  ))}
                </VStack>
              </Box>
            </Collapse>

            {/* Column Selection */}
            <Collapse in={isColumnsOpen}>
              <Box>
                <Text mb={3} fontSize={{ base: 'sm', md: 'md' }} fontWeight="medium">
                  Visible Columns
                </Text>
                <Wrap spacing={2}>
                  {Object.keys(data[0]).map(column => (
                    <WrapItem key={column}>
                      <Button
                        size="sm"
                        variant={selectedColumns.includes(column) ? "solid" : "outline"}
                        colorScheme={selectedColumns.includes(column) ? "blue" : "gray"}
                        onClick={() => toggleColumn(column)}
                      >
                        {column}
                      </Button>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>
            </Collapse>
          </VStack>
        </CardBody>
      </Card>

      {/* Data Visualization */}
      <Card>
        <CardHeader pb={2}>
          <Flex 
            direction={{ base: 'column', sm: 'row' }}
            justify="space-between"
            align={{ base: 'flex-start', sm: 'center' }}
            gap={3}
          >
            <Heading size={{ base: 'sm', md: 'md' }} color="purple.600">
              Data Visualization
            </Heading>
            <ChakraTooltip label="Toggle visualization" aria-label="Toggle visualization">
              <IconButton
                aria-label="Toggle visualization"
                icon={isVisualizationOpen ? <EyeOff size={16} /> : <Eye size={16} />}
                variant="ghost"
                size="sm"
                onClick={onVisualizationToggle}
                colorScheme="purple"
              />
            </ChakraTooltip>
          </Flex>
        </CardHeader>
        <CardBody pt={0}>
          <Collapse in={isVisualizationOpen}>
            <VStack spacing={4} align="stretch">
              {/* Chart Controls */}
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <Box>
                  <Text mb={2} fontSize="sm" fontWeight="medium">Chart Type</Text>
                  <Select
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value as 'bar' | 'line')}
                    size="sm"
                  >
                    <option value="bar">Bar Chart</option>
                    <option value="line">Line Chart</option>
                  </Select>
                </Box>
                
                <Box>
                  <Text mb={2} fontSize="sm" fontWeight="medium">X Axis</Text>
                  <Select
                    value={chartColumns.x}
                    onChange={(e) => setChartColumns(prev => ({ ...prev, x: e.target.value }))}
                    size="sm"
                  >
                    <option value="">Select column</option>
                    {stringColumns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </Select>
                </Box>
                
                <Box>
                  <Text mb={2} fontSize="sm" fontWeight="medium">Y Axis</Text>
                  <Select
                    value={chartColumns.y}
                    onChange={(e) => setChartColumns(prev => ({ ...prev, y: e.target.value }))}
                    size="sm"
                  >
                    <option value="">Select column</option>
                    {numericColumns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </Select>
                </Box>
              </SimpleGrid>

              {/* Chart */}
              {chartColumns.x && chartColumns.y && chartData.length > 0 && (
                <Box h={{ base: '300px', md: '400px' }} w="full">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'bar' ? (
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3182CE" />
                      </BarChart>
                    ) : (
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#3182CE" strokeWidth={2} />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </Box>
              )}
            </VStack>
          </Collapse>
        </CardBody>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader pb={2}>
          <Flex 
            direction={{ base: 'column', sm: 'row' }}
            justify="space-between"
            align={{ base: 'flex-start', sm: 'center' }}
            gap={3}
          >
            <Heading size={{ base: 'sm', md: 'md' }} color="gray.700">
              Data Table
            </Heading>
            <HStack spacing={2}>
              <Button
                leftIcon={<Download size={16} />}
                size={{ base: 'sm', md: 'md' }}
                variant="outline"
                colorScheme="green"
                onClick={exportToCSV}
              >
                CSV
              </Button>
              <Button
                leftIcon={<Download size={16} />}
                size={{ base: 'sm', md: 'md' }}
                variant="outline"
                colorScheme="blue"
                onClick={exportToJSON}
              >
                JSON
              </Button>
            </HStack>
          </Flex>
        </CardHeader>
        <CardBody pt={0}>
          {/* Pagination Controls */}
          <Flex 
            direction={{ base: 'column', sm: 'row' }}
            justify="space-between"
            align={{ base: 'stretch', sm: 'center' }}
            gap={3}
            mb={4}
          >
            <HStack spacing={3}>
              <Text fontSize={{ base: 'sm', md: 'md' }}>
                Page {pagination.currentPage} of {totalPages}
              </Text>
              <Select
                value={pagination.pageSize}
                onChange={(e) => setPagination(prev => ({ ...prev, pageSize: Number(e.target.value), currentPage: 1 }))}
                size="sm"
                w="auto"
              >
                <option value={5}>5 rows</option>
                <option value={10}>10 rows</option>
                <option value={20}>20 rows</option>
                <option value={50}>50 rows</option>
              </Select>
            </HStack>
            
            <HStack spacing={2}>
              <Button
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
                isDisabled={pagination.currentPage === 1}
                variant="outline"
              >
                Previous
              </Button>
              <Button
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.min(totalPages, prev.currentPage + 1) }))}
                isDisabled={pagination.currentPage === totalPages}
                variant="outline"
              >
                Next
              </Button>
            </HStack>
          </Flex>

          {/* Table */}
          <Box overflowX="auto">
            <Table size={{ base: 'sm', md: 'md' }} variant="simple">
              <Thead>
                <Tr>
                  {selectedColumns.map(column => (
                    <Th 
                      key={column}
                      cursor="pointer"
                      onClick={() => toggleSorting(column)}
                      _hover={{ bg: 'gray.50' }}
                      position="relative"
                    >
                      <Flex align="center" gap={2}>
                        <Text>{column}</Text>
                        {sorting.find(s => s.column === column) && (
                          <Box>
                            {sorting.find(s => s.column === column)?.direction === 'asc' ? (
                              <SortAsc size={12} />
                            ) : (
                              <SortDesc size={12} />
                            )}
                          </Box>
                        )}
                      </Flex>
                    </Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {paginatedData.map((row, rowIndex) => (
                  <Tr key={rowIndex}>
                    {selectedColumns.map(column => (
                      <Td key={column} maxW="200px">
                        <Text 
                          fontSize={{ base: 'xs', md: 'sm' }}
                          noOfLines={2}
                          title={String(row[column])}
                        >
                          {String(row[column] || '')}
                        </Text>
                      </Td>
                    ))}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </CardBody>
      </Card>
    </VStack>
  );
};

// Custom hook for toggle functionality
function useToggle(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  const onToggle = () => setIsOpen(!isOpen);
  return { isOpen, onToggle };
}

export default QueryResults;
