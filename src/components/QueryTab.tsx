import React, { useState, useMemo } from 'react';
import {
  VStack,
  HStack,
  Box,
  Textarea,
  Button,
  Text,
  useToast,
  Flex,
  Grid,
  GridItem,
  IconButton,
  Collapse,
  useDisclosure,
  Divider,
  Badge,
  Stack,
  Wrap,
  WrapItem,
  useBreakpointValue,
  Card,
  CardBody,
  CardHeader,
  Heading,
  SimpleGrid,
} from '@chakra-ui/react';
import { Play, Save, History, Bookmark, ChevronDown, ChevronUp, Download, BarChart3, TrendingUp } from 'lucide-react';
import { QueryHistory, SavedQuery } from '../types';
import { SimpleSQLEngine } from '../utils/sqlEngine';
import { getAvailableTables } from '../utils/csvLoader';
import QueryResults from './QueryResults';
import QueryHistoryPanel from './QueryHistoryPanel';
import SavedQueriesPanel from './SavedQueriesPanel';

interface QueryTabProps {
  query: string;
  onQueryChange: (query: string) => void;
  onQueryExecute: (query: string, result: any[]) => void;
  queryHistory: QueryHistory[];
  savedQueries: SavedQuery[];
  onSaveQuery: (name: string, query: string) => void;
  onLoadSavedQuery: (query: string) => void;
}

const QueryTab: React.FC<QueryTabProps> = ({
  query,
  onQueryChange,
  onQueryExecute,
  queryHistory,
  savedQueries,
  onSaveQuery,
  onLoadSavedQuery,
}) => {
  const [queryResult, setQueryResult] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [availableTables, setAvailableTables] = useState<string[]>([]);
  const [queryName, setQueryName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  
  const toast = useToast();
  const { isOpen: isHistoryOpen, onToggle: onHistoryToggle } = useDisclosure();
  const { isOpen: isSavedOpen, onToggle: onSavedToggle } = useDisclosure();
  
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false });

  const sqlEngine = useMemo(() => new SimpleSQLEngine(), []);

  // Load available tables on component mount
  React.useEffect(() => {
    const loadTables = async () => {
      try {
        const tables = getAvailableTables();
        setAvailableTables(tables);
      } catch (error) {
        console.error('Error loading available tables:', error);
        setAvailableTables([]);
      }
    };
    loadTables();
  }, []);

  const executeQuery = async () => {
    if (!query.trim()) {
      toast({
        title: 'Query Required',
        description: 'Please enter a SQL query to execute.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setQueryResult([]);

    try {
      const result = await sqlEngine.executeQuery(query);
      setQueryResult(result);
      onQueryExecute(query, result);
      toast({
        title: 'Query executed',
        description: `${result.length} rows returned.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
      toast({
        title: 'Query Error',
        description: err.message || 'Failed to execute query.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveQuery = () => {
    if (!queryName.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter a name for your query.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    onSaveQuery(queryName, query);
    setQueryName('');
    setShowSaveForm(false);
  };

  const handleLoadQuery = (queryText: string) => {
    onLoadSavedQuery(queryText);
    toast({
      title: 'Query Loaded',
      description: 'Query has been loaded into the editor.',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <VStack spacing={{ base: 4, md: 6 }} align="stretch">
      {/* Query Input Section */}
      <Card>
        <CardHeader pb={2}>
          <Heading size={{ base: 'sm', md: 'md' }} color="blue.600">
            SQL Query Editor
          </Heading>
        </CardHeader>
        <CardBody pt={0}>
          <VStack spacing={4} align="stretch">
            <Textarea
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Enter your SQL query here... (e.g., SELECT * FROM products)"
              size={{ base: 'sm', md: 'md' }}
              minH={{ base: '120px', md: '150px' }}
              fontFamily="mono"
              fontSize={{ base: 'sm', md: 'md' }}
              resize="vertical"
            />
            
            {/* Action Buttons */}
            <Flex 
              direction={{ base: 'column', sm: 'row' }}
              gap={3}
              justify="space-between"
              align={{ base: 'stretch', sm: 'center' }}
            >
              <HStack spacing={3} flexWrap="wrap">
                <Button
                  leftIcon={<Play size={16} />}
                  colorScheme="blue"
                  onClick={executeQuery}
                  isLoading={isLoading}
                  loadingText="Executing..."
                  size={{ base: 'md', md: 'lg' }}
                  w={{ base: 'full', sm: 'auto' }}
                >
                  Execute Query
                </Button>
                
                <Button
                  leftIcon={<Save size={16} />}
                  variant="outline"
                  onClick={() => setShowSaveForm(!showSaveForm)}
                  size={{ base: 'md', md: 'lg' }}
                  w={{ base: 'full', sm: 'auto' }}
                >
                  Save Query
                </Button>
              </HStack>
              
              <HStack spacing={2}>
                <IconButton
                  aria-label="Show History"
                  icon={<History size={16} />}
                  variant="ghost"
                  onClick={onHistoryToggle}
                  size={{ base: 'sm', md: 'md' }}
                  colorScheme="blue"
                />
                <IconButton
                  aria-label="Show Saved Queries"
                  icon={<Bookmark size={16} />}
                  variant="ghost"
                  onClick={onSavedToggle}
                  size={{ base: 'sm', md: 'md' }}
                  colorScheme="green"
                />
              </HStack>
            </Flex>

            {/* Save Query Form */}
            <Collapse in={showSaveForm}>
              <Box p={4} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                <VStack spacing={3} align="stretch">
                  <Text fontWeight="medium" color="blue.700">
                    Save Query
                  </Text>
                  <HStack spacing={3}>
                    <Textarea
                      value={queryName}
                      onChange={(e) => setQueryName(e.target.value)}
                      placeholder="Enter a name for this query"
                      size="sm"
                      minH="60px"
                      resize="none"
                    />
                    <VStack spacing={2}>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        onClick={handleSaveQuery}
                        isDisabled={!queryName.trim()}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowSaveForm(false)}
                      >
                        Cancel
                      </Button>
                    </VStack>
                  </HStack>
                </VStack>
              </Box>
            </Collapse>
          </VStack>
        </CardBody>
      </Card>

      {/* Available Tables Section */}
      <Card>
        <CardHeader pb={2}>
          <Heading size={{ base: 'sm', md: 'md' }} color="blue.600">
            Available Tables
          </Heading>
          <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600" mt={1}>
            💡 Click on a table to load it, or use in your queries
          </Text>
        </CardHeader>
        <CardBody pt={0}>
          <Wrap spacing={3}>
            {availableTables.map((table) => (
              <WrapItem key={table}>
                <Box
                  px={{ base: 3, md: 4 }}
                  py={{ base: 2, md: 3 }}
                  borderRadius="md"
                  bg="blue.100"
                  cursor="pointer"
                  onClick={() => onQueryChange(table)}
                  _hover={{ bg: 'blue.200' }}
                  transition="all 0.2s"
                  border="1px solid"
                  borderColor="blue.200"
                >
                  <Text 
                    fontSize={{ base: 'xs', md: 'sm' }} 
                    color="blue.800"
                    fontWeight="medium"
                  >
                    {table}
                  </Text>
                </Box>
              </WrapItem>
            ))}
          </Wrap>
        </CardBody>
      </Card>

      {/* Error Display */}
      {error && (
        <Box p={4} bg="red.50" borderRadius="md" border="1px solid" borderColor="red.200">
          <Text color="red.700" fontWeight="medium">
            Error: {error}
          </Text>
        </Box>
      )}

      {/* Query Results */}
      {queryResult.length > 0 && (
        <Card>
          <CardHeader pb={2}>
            <Flex 
              direction={{ base: 'column', sm: 'row' }}
              justify="space-between"
              align={{ base: 'flex-start', sm: 'center' }}
              gap={3}
            >
              <Heading size={{ base: 'sm', md: 'md' }} color="green.600">
                Query Results
              </Heading>
              <HStack spacing={2}>
                <Badge colorScheme="green" variant="subtle" fontSize={{ base: 'xs', md: 'sm' }}>
                  {queryResult.length} rows
                </Badge>
              </HStack>
            </Flex>
          </CardHeader>
          <CardBody pt={0}>
            <QueryResults 
              data={queryResult} 
              isMobile={isMobile}
              isTablet={isTablet}
            />
          </CardBody>
        </Card>
      )}

      {/* Collapsible Panels */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Query History Panel */}
        <Card>
          <CardHeader 
            pb={2} 
            cursor="pointer" 
            onClick={onHistoryToggle}
            _hover={{ bg: 'gray.50' }}
            transition="all 0.2s"
          >
            <Flex justify="space-between" align="center">
              <Heading size={{ base: 'sm', md: 'md' }} color="blue.600">
                Query History
              </Heading>
              <IconButton
                aria-label="Toggle History"
                icon={isHistoryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                variant="ghost"
                size="sm"
                colorScheme="blue"
              />
            </Flex>
          </CardHeader>
          <Collapse in={isHistoryOpen}>
            <CardBody pt={0}>
              <QueryHistoryPanel
                history={queryHistory}
                onLoadQuery={handleLoadQuery}
                isMobile={isMobile}
              />
            </CardBody>
          </Collapse>
        </Card>

        {/* Saved Queries Panel */}
        <Card>
          <CardHeader 
            pb={2} 
            cursor="pointer" 
            onClick={onSavedToggle}
            _hover={{ bg: 'gray.50' }}
            transition="all 0.2s"
          >
            <Flex justify="space-between" align="center">
              <Heading size={{ base: 'sm', md: 'md' }} color="green.600">
                Saved Queries
              </Heading>
              <IconButton
                aria-label="Toggle Saved Queries"
                icon={isSavedOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                variant="ghost"
                size="sm"
                colorScheme="green"
              />
            </Flex>
          </CardHeader>
          <Collapse in={isSavedOpen}>
            <CardBody pt={0}>
              <SavedQueriesPanel
                savedQueries={savedQueries}
                onLoadQuery={handleLoadQuery}
                onDeleteQuery={(id) => {
                  // Handle delete logic here
                  toast({
                    title: 'Query Deleted',
                    description: 'Saved query has been removed.',
                    status: 'info',
                    duration: 2000,
                    isClosable: true,
                  });
                }}
                isMobile={isMobile}
              />
            </CardBody>
          </Collapse>
        </Card>
      </SimpleGrid>
    </VStack>
  );
};

export default QueryTab;
