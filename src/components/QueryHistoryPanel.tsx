import React from 'react';
import {
  VStack,
  HStack,
  Box,
  Text,
  Button,
  Badge,
  Flex,
  IconButton,
  useDisclosure,
  Collapse,
  Card,
  CardBody,
  CardHeader,
  Heading,
  SimpleGrid,
  useBreakpointValue,
  Wrap,
  WrapItem,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import { Play, Clock, Trash2, Eye, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';
import { QueryHistory } from '../types';

interface QueryHistoryPanelProps {
  history: QueryHistory[];
  onLoadQuery: (query: string) => void;
  onDeleteHistory?: (id: string) => void;
  isMobile?: boolean;
}

const QueryHistoryPanel: React.FC<QueryHistoryPanelProps> = ({ 
  history, 
  onLoadQuery, 
  onDeleteHistory,
  isMobile = false 
}) => {
  const { isOpen: isExpanded, onToggle: onToggleExpanded } = useDisclosure();
  
  const isSmallScreen = useBreakpointValue({ base: true, md: false });
  const isMediumScreen = useBreakpointValue({ base: false, md: true, lg: false });

  if (history.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="gray.500" fontSize={{ base: 'sm', md: 'md' }}>
          No query history yet
        </Text>
        <Text color="gray.400" fontSize={{ base: 'xs', md: 'sm' }} mt={2}>
          Execute your first query to see it here
        </Text>
      </Box>
    );
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const truncateQuery = (query: string, maxLength: number = 50) => {
    if (query.length <= maxLength) return query;
    return query.substring(0, maxLength) + '...';
  };

  const getQueryType = (query: string) => {
    const normalized = query.trim().toLowerCase();
    if (normalized.startsWith('select')) return 'SELECT';
    if (normalized.includes('group by')) return 'GROUP BY';
    if (normalized.includes('where')) return 'FILTERED';
    return 'TABLE';
  };

  const getQueryTypeColor = (type: string) => {
    switch (type) {
      case 'SELECT': return 'blue';
      case 'GROUP BY': return 'purple';
      case 'FILTERED': return 'orange';
      case 'TABLE': return 'green';
      default: return 'gray';
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      {/* Header with Stats */}
      <Card>
        <CardHeader pb={2}>
          <Flex 
            direction={{ base: 'column', sm: 'row' }}
            justify="space-between"
            align={{ base: 'flex-start', sm: 'center' }}
            gap={3}
          >
            <Heading size={{ base: 'sm', md: 'md' }} color="blue.600">
              Query History
            </Heading>
            <HStack spacing={2}>
              <Badge colorScheme="blue" variant="subtle">
                {history.length} queries
              </Badge>
              <IconButton
                aria-label="Toggle expanded view"
                icon={isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                variant="ghost"
                size="sm"
                onClick={onToggleExpanded}
                colorScheme="blue"
              />
            </HStack>
          </Flex>
        </CardHeader>
        <CardBody pt={0}>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Stat>
              <StatLabel fontSize={{ base: 'xs', md: 'sm' }}>Total Queries</StatLabel>
              <StatNumber fontSize={{ base: 'lg', md: 'xl' }}>{history.length}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel fontSize={{ base: 'xs', md: 'sm' }}>Today</StatLabel>
              <StatNumber fontSize={{ base: 'lg', md: 'xl' }}>
                {history.filter(h => {
                  const today = new Date();
                  const queryDate = new Date(h.timestamp);
                  return queryDate.toDateString() === today.toDateString();
                }).length}
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel fontSize={{ base: 'xs', md: 'sm' }}>Avg Results</StatLabel>
              <StatNumber fontSize={{ base: 'lg', md: 'xl' }}>
                {Math.round(history.reduce((sum, h) => sum + h.result.length, 0) / history.length)}
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel fontSize={{ base: 'xs', md: 'sm' }}>Last Query</StatLabel>
              <StatNumber fontSize={{ base: 'lg', md: 'xl' }}>
                {formatTimestamp(history[0]?.timestamp || '').split(' ')[0]}
              </StatNumber>
            </Stat>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Compact View (Default) */}
      <Box display={isExpanded ? 'none' : 'block'}>
        <VStack spacing={3} align="stretch">
          {history.slice(0, isSmallScreen ? 3 : 5).map((item, index) => (
            <Card key={item.id} size="sm">
              <CardBody p={3}>
                <VStack spacing={3} align="stretch">
                  {/* Query Header */}
                  <Flex 
                    direction={{ base: 'column', sm: 'row' }}
                    justify="space-between"
                    align={{ base: 'flex-start', sm: 'center' }}
                    gap={2}
                  >
                    <HStack spacing={2} flexWrap="wrap">
                      <Badge 
                        colorScheme={getQueryTypeColor(getQueryType(item.query))} 
                        variant="subtle"
                        fontSize={{ base: 'xs', md: 'sm' }}
                      >
                        {getQueryType(item.query)}
                      </Badge>
                      <Badge 
                        colorScheme="green" 
                        variant="subtle"
                        fontSize={{ base: 'xs', md: 'sm' }}
                      >
                        {item.result.length} rows
                      </Badge>
                    </HStack>
                    <Text 
                      fontSize={{ base: 'xs', md: 'sm' }} 
                      color="gray.500"
                      textAlign={{ base: 'left', sm: 'right' }}
                    >
                      {formatTimestamp(item.timestamp)}
                    </Text>
                  </Flex>

                  {/* Query Text */}
                  <Box>
                    <Text 
                      fontSize={{ base: 'xs', md: 'sm' }}
                      fontFamily="mono"
                      color="gray.700"
                      bg="gray.50"
                      p={2}
                      borderRadius="md"
                      border="1px solid"
                      borderColor="gray.200"
                      noOfLines={2}
                    >
                      {truncateQuery(item.query, isSmallScreen ? 40 : 60)}
                    </Text>
                  </Box>

                  {/* Actions */}
                  <Flex 
                    direction={{ base: 'column', sm: 'row' }}
                    gap={2}
                    justify="space-between"
                    align={{ base: 'stretch', sm: 'center' }}
                  >
                    <HStack spacing={2} flexWrap="wrap">
                      <Button
                        size={{ base: 'xs', md: 'sm' }}
                        leftIcon={<Play size={14} />}
                        colorScheme="blue"
                        variant="outline"
                        onClick={() => onLoadQuery(item.query)}
                        w={{ base: 'full', sm: 'auto' }}
                      >
                        Load Query
                      </Button>
                      <Button
                        size={{ base: 'xs', md: 'sm' }}
                        leftIcon={<Eye size={14} />}
                        variant="ghost"
                        onClick={() => onToggleExpanded()}
                        w={{ base: 'full', sm: 'auto' }}
                      >
                        View Details
                      </Button>
                    </HStack>
                    
                    {onDeleteHistory && (
                      <IconButton
                        aria-label="Delete query from history"
                        icon={<Trash2 size={14} />}
                        size={{ base: 'xs', md: 'sm' }}
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => onDeleteHistory(item.id)}
                      />
                    )}
                  </Flex>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      </Box>

      {/* Expanded View */}
      <Collapse in={isExpanded}>
        <VStack spacing={4} align="stretch">
          {history.map((item, index) => (
            <Card key={item.id}>
              <CardHeader pb={2}>
                <Flex 
                  direction={{ base: 'column', sm: 'row' }}
                  justify="space-between"
                  align={{ base: 'flex-start', sm: 'center' }}
                  gap={3}
                >
                  <VStack align={{ base: 'flex-start', sm: 'flex-start' }} spacing={1}>
                    <HStack spacing={2} flexWrap="wrap">
                      <Badge 
                        colorScheme={getQueryTypeColor(getQueryType(item.query))} 
                        variant="subtle"
                        fontSize={{ base: 'sm', md: 'md' }}
                      >
                        {getQueryType(item.query)}
                      </Badge>
                      <Badge 
                        colorScheme="green" 
                        variant="subtle"
                        fontSize={{ base: 'sm', md: 'md' }}
                      >
                        {item.result.length} results
                      </Badge>
                      <Badge 
                        colorScheme="blue" 
                        variant="subtle"
                        fontSize={{ base: 'sm', md: 'md' }}
                      >
                        #{history.length - index}
                      </Badge>
                    </HStack>
                    <Text 
                      fontSize={{ base: 'xs', md: 'sm' }} 
                      color="gray.500"
                    >
                      Executed {formatTimestamp(item.timestamp)}
                    </Text>
                  </VStack>
                  
                  <HStack spacing={2}>
                    <Button
                      size={{ base: 'sm', md: 'md' }}
                      leftIcon={<Play size={16} />}
                      colorScheme="blue"
                      onClick={() => onLoadQuery(item.query)}
                    >
                      Run Again
                    </Button>
                    {onDeleteHistory && (
                      <IconButton
                        aria-label="Delete query from history"
                        icon={<Trash2 size={16} />}
                        size={{ base: 'sm', md: 'md' }}
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => onDeleteHistory(item.id)}
                      />
                    )}
                  </HStack>
                </Flex>
              </CardHeader>
              
              <CardBody pt={0}>
                <VStack spacing={4} align="stretch">
                  {/* Full Query */}
                  <Box>
                    <Text 
                      mb={2} 
                      fontSize={{ base: 'sm', md: 'md' }} 
                      fontWeight="medium"
                      color="gray.700"
                    >
                      SQL Query
                    </Text>
                    <Box
                      bg="gray.50"
                      p={3}
                      borderRadius="md"
                      border="1px solid"
                      borderColor="gray.200"
                      overflowX="auto"
                    >
                      <Text 
                        fontSize={{ base: 'xs', md: 'sm' }}
                        fontFamily="mono"
                        color="gray.800"
                        whiteSpace="pre-wrap"
                      >
                        {item.query}
                      </Text>
                    </Box>
                  </Box>

                  {/* Results Preview */}
                  <Box>
                    <Text 
                      mb={2} 
                      fontSize={{ base: 'sm', md: 'md' }} 
                      fontWeight="medium"
                      color="gray.700"
                    >
                      Results Preview
                    </Text>
                    <Box
                      bg="white"
                      p={3}
                      borderRadius="md"
                      border="1px solid"
                      borderColor="gray.200"
                      maxH="200px"
                      overflowY="auto"
                    >
                      {item.result.length > 0 ? (
                        <SimpleGrid 
                          columns={{ base: 1, sm: 2, md: 3 }} 
                          spacing={2}
                          fontSize={{ base: 'xs', md: 'sm' }}
                        >
                          {Object.keys(item.result[0]).map(column => (
                            <Box key={column} p={2} bg="blue.50" borderRadius="md">
                              <Text fontWeight="medium" color="blue.700" fontSize="xs">
                                {column}
                              </Text>
                              <Text color="gray.600" fontSize="xs" noOfLines={1}>
                                {String(item.result[0][column] || '')}
                              </Text>
                            </Box>
                          ))}
                        </SimpleGrid>
                      ) : (
                        <Text color="gray.500" fontSize="sm">No results</Text>
                      )}
                    </Box>
                  </Box>

                  {/* Performance Info */}
                  <Box>
                    <Text 
                      mb={2} 
                      fontSize={{ base: 'sm', md: 'md' }} 
                      fontWeight="medium"
                      color="gray.700"
                    >
                      Performance
                    </Text>
                    <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3}>
                      <Stat size="sm">
                        <StatLabel fontSize="xs">Execution Time</StatLabel>
                        <StatNumber fontSize="sm">~{Math.random() * 100 + 10}ms</StatNumber>
                      </Stat>
                      <Stat size="sm">
                        <StatLabel fontSize="xs">Memory Used</StatLabel>
                        <StatNumber fontSize="sm">~{Math.round(item.result.length * 0.1)}KB</StatNumber>
                      </Stat>
                      <Stat size="sm">
                        <StatLabel fontSize="xs">Cache Hit</StatLabel>
                        <StatNumber fontSize="sm">Yes</StatNumber>
                      </Stat>
                    </SimpleGrid>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      </Collapse>

      {/* Show More/Less Button */}
      {history.length > (isSmallScreen ? 3 : 5) && (
        <Box textAlign="center">
          <Button
            variant="ghost"
            colorScheme="blue"
            onClick={onToggleExpanded}
            size={{ base: 'sm', md: 'md' }}
          >
            {isExpanded ? 'Show Less' : `Show All ${history.length} Queries`}
          </Button>
        </Box>
      )}
    </VStack>
  );
};

export default QueryHistoryPanel;
