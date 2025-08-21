import React, { useState, useRef } from 'react';
import {
  VStack,
  HStack,
  Box,
  Text,
  Button,
  Input,
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
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { 
  Bookmark, 
  Play, 
  Edit, 
  Trash2, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Eye,
  Clock,
  Search,
  Filter
} from 'lucide-react';
import { SavedQuery } from '../types';

interface SavedQueriesPanelProps {
  savedQueries: SavedQuery[];
  onLoadQuery: (query: string) => void;
  onDeleteQuery: (id: string) => void;
  onUpdateQuery?: (id: string, name: string, query: string) => void;
  isMobile?: boolean;
}

const SavedQueriesPanel: React.FC<SavedQueriesPanelProps> = ({ 
  savedQueries, 
  onLoadQuery, 
  onDeleteQuery,
  onUpdateQuery,
  isMobile = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editQuery, setEditQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'recent' | 'favorites'>('all');
  
  const { isOpen: isExpanded, onToggle: onToggleExpanded } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  
  const toast = useToast();
  const cancelRef = useRef<HTMLButtonElement>(null);
  
  const isSmallScreen = useBreakpointValue({ base: true, md: false });
  const isMediumScreen = useBreakpointValue({ base: false, md: true, lg: false });

  // Filter and search queries
  const filteredQueries = savedQueries.filter(query => {
    const matchesSearch = query.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         query.query.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (filterType) {
      case 'recent':
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return new Date(query.timestamp) > oneWeekAgo;
      case 'favorites':
        return query.name.toLowerCase().includes('favorite') || 
               query.name.toLowerCase().includes('important');
      default:
        return true;
    }
  });

  const startEditing = (query: SavedQuery) => {
    setEditingId(query.id);
    setEditName(query.name);
    setEditQuery(query.query);
    onEditOpen();
  };

  const saveEdit = () => {
    if (!editingId || !editName.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter a name for the query.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (onUpdateQuery) {
      onUpdateQuery(editingId, editName.trim(), editQuery);
      toast({
        title: 'Query Updated',
        description: 'Saved query has been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }

    setEditingId(null);
    setEditName('');
    setEditQuery('');
    onEditClose();
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    onDeleteOpen();
  };

  const handleDelete = () => {
    if (deleteId) {
      onDeleteQuery(deleteId);
      setDeleteId(null);
      onDeleteClose();
      toast({
        title: 'Query Deleted',
        description: 'Saved query has been removed.',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    }
  };

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

  if (savedQueries.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Bookmark size={48} color="gray.300" style={{ margin: '0 auto 16px' }} />
        <Text color="gray.500" fontSize={{ base: 'sm', md: 'md' }}>
          No saved queries yet
        </Text>
        <Text color="gray.400" fontSize={{ base: 'xs', md: 'sm' }} mt={2}>
          Save your favorite queries to access them quickly
        </Text>
      </Box>
    );
  }

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
            <Heading size={{ base: 'sm', md: 'md' }} color="green.600">
              Saved Queries
            </Heading>
            <HStack spacing={2}>
              <Badge colorScheme="green" variant="subtle">
                {savedQueries.length} saved
              </Badge>
              <IconButton
                aria-label="Toggle expanded view"
                icon={isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                variant="ghost"
                size="sm"
                onClick={onToggleExpanded}
                colorScheme="green"
              />
            </HStack>
          </Flex>
        </CardHeader>
        <CardBody pt={0}>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Stat>
              <StatLabel fontSize={{ base: 'xs', md: 'sm' }}>Total Saved</StatLabel>
              <StatNumber fontSize={{ base: 'lg', md: 'xl' }}>{savedQueries.length}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel fontSize={{ base: 'xs', md: 'sm' }}>This Week</StatLabel>
              <StatNumber fontSize={{ base: 'lg', md: 'xl' }}>
                {savedQueries.filter(q => {
                  const oneWeekAgo = new Date();
                  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                  return new Date(q.timestamp) > oneWeekAgo;
                }).length}
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel fontSize={{ base: 'xs', md: 'sm' }}>Types</StatLabel>
              <StatNumber fontSize={{ base: 'lg', md: 'xl' }}>
                {new Set(savedQueries.map(q => getQueryType(q.query))).size}
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel fontSize={{ base: 'xs', md: 'sm' }}>Last Saved</StatLabel>
              <StatNumber fontSize={{ base: 'lg', md: 'xl' }}>
                {formatTimestamp(savedQueries[0]?.timestamp || '').split(' ')[0]}
              </StatNumber>
            </Stat>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Search and Filter Controls */}
      <Card>
        <CardHeader pb={2}>
          <Heading size={{ base: 'sm', md: 'md' }} color="blue.600">
            Search & Filter
          </Heading>
        </CardHeader>
        <CardBody pt={0}>
          <VStack spacing={4} align="stretch">
            {/* Search */}
            <Box>
              <Text mb={2} fontSize={{ base: 'sm', md: 'md' }} fontWeight="medium">
                Search Queries
              </Text>
                              <Input
                  placeholder="Search by name or query content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size={{ base: 'sm', md: 'md' }}
                />
            </Box>

            {/* Filter Type */}
            <Box>
              <Text mb={2} fontSize={{ base: 'sm', md: 'md' }} fontWeight="medium">
                Filter By
              </Text>
              <HStack spacing={2} flexWrap="wrap">
                <Button
                  size={{ base: 'sm', md: 'md' }}
                  variant={filterType === 'all' ? 'solid' : 'outline'}
                  colorScheme="blue"
                  onClick={() => setFilterType('all')}
                >
                  All ({savedQueries.length})
                </Button>
                <Button
                  size={{ base: 'sm', md: 'md' }}
                  variant={filterType === 'recent' ? 'solid' : 'outline'}
                  colorScheme="green"
                  onClick={() => setFilterType('recent')}
                >
                  Recent
                </Button>
                <Button
                  size={{ base: 'sm', md: 'md' }}
                  variant={filterType === 'favorites' ? 'solid' : 'outline'}
                  colorScheme="purple"
                  onClick={() => setFilterType('favorites')}
                >
                  Favorites
                </Button>
              </HStack>
            </Box>
          </VStack>
        </CardBody>
      </Card>

      {/* Compact View (Default) */}
      <Box display={isExpanded ? 'none' : 'block'}>
        <VStack spacing={3} align="stretch">
          {filteredQueries.slice(0, isSmallScreen ? 3 : 5).map((query) => (
            <Card key={query.id} size="sm">
              <CardBody p={3}>
                <VStack spacing={3} align="stretch">
                  {/* Query Header */}
                  <Flex 
                    direction={{ base: 'column', sm: 'row' }}
                    justify="space-between"
                    align={{ base: 'flex-start', sm: 'center' }}
                    gap={2}
                  >
                    <VStack align={{ base: 'flex-start', sm: 'flex-start' }} spacing={1}>
                      <HStack spacing={2} flexWrap="wrap">
                        <Badge 
                          colorScheme={getQueryTypeColor(getQueryType(query.query))} 
                          variant="subtle"
                          fontSize={{ base: 'xs', md: 'sm' }}
                        >
                          {getQueryType(query.query)}
                        </Badge>
                        <Badge 
                          colorScheme="green" 
                          variant="subtle"
                          fontSize={{ base: 'xs', md: 'sm' }}
                        >
                          Saved
                        </Badge>
                      </HStack>
                      <Text 
                        fontSize={{ base: 'sm', md: 'md' }} 
                        fontWeight="medium"
                        color="gray.700"
                      >
                        {query.name}
                      </Text>
                    </VStack>
                    <Text 
                      fontSize={{ base: 'xs', md: 'sm' }} 
                      color="gray.500"
                      textAlign={{ base: 'left', sm: 'right' }}
                    >
                      {formatTimestamp(query.timestamp)}
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
                      {truncateQuery(query.query, isSmallScreen ? 40 : 60)}
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
                        onClick={() => onLoadQuery(query.query)}
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
                    
                    <HStack spacing={1}>
                      <IconButton
                        aria-label="Edit saved query"
                        icon={<Edit size={14} />}
                        size={{ base: 'xs', md: 'sm' }}
                        variant="ghost"
                        colorScheme="yellow"
                        onClick={() => startEditing(query)}
                      />
                      <IconButton
                        aria-label="Delete saved query"
                        icon={<Trash2 size={14} />}
                        size={{ base: 'xs', md: 'sm' }}
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => confirmDelete(query.id)}
                      />
                    </HStack>
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
          {filteredQueries.map((query, index) => (
            <Card key={query.id}>
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
                        colorScheme={getQueryTypeColor(getQueryType(query.query))} 
                        variant="subtle"
                        fontSize={{ base: 'sm', md: 'md' }}
                      >
                        {getQueryType(query.query)}
                      </Badge>
                      <Badge 
                        colorScheme="green" 
                        variant="subtle"
                        fontSize={{ base: 'sm', md: 'md' }}
                      >
                        Saved Query
                      </Badge>
                      <Badge 
                        colorScheme="blue" 
                        variant="subtle"
                        fontSize={{ base: 'sm', md: 'md' }}
                      >
                        #{index + 1}
                      </Badge>
                    </HStack>
                    <Text 
                      fontSize={{ base: 'lg', md: 'xl' }} 
                      fontWeight="bold"
                      color="gray.700"
                    >
                      {query.name}
                    </Text>
                    <Text 
                      fontSize={{ base: 'xs', md: 'sm' }} 
                      color="gray.500"
                    >
                      Saved {formatTimestamp(query.timestamp)}
                    </Text>
                  </VStack>
                  
                  <HStack spacing={2}>
                    <Button
                      size={{ base: 'sm', md: 'md' }}
                      leftIcon={<Play size={16} />}
                      colorScheme="blue"
                      onClick={() => onLoadQuery(query.query)}
                    >
                      Load Query
                    </Button>
                    <IconButton
                      aria-label="Edit saved query"
                      icon={<Edit size={16} />}
                      size={{ base: 'sm', md: 'md' }}
                      variant="outline"
                      colorScheme="yellow"
                      onClick={() => startEditing(query)}
                    />
                    <IconButton
                      aria-label="Delete saved query"
                      icon={<Trash2 size={16} />}
                      size={{ base: 'sm', md: 'md' }}
                      variant="outline"
                      colorScheme="red"
                      onClick={() => confirmDelete(query.id)}
                    />
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
                        {query.query}
                      </Text>
                    </Box>
                  </Box>

                  {/* Query Analysis */}
                  <Box>
                    <Text 
                      mb={2} 
                      fontSize={{ base: 'sm', md: 'md' }} 
                      fontWeight="medium"
                      color="gray.700"
                    >
                      Query Analysis
                    </Text>
                    <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3}>
                      <Stat size="sm">
                        <StatLabel fontSize="xs">Query Length</StatLabel>
                        <StatNumber fontSize="sm">{query.query.length} chars</StatNumber>
                      </Stat>
                      <Stat size="sm">
                        <StatLabel fontSize="xs">Complexity</StatLabel>
                        <StatNumber fontSize="sm">
                          {query.query.includes('WHERE') ? 'Medium' : 'Simple'}
                        </StatNumber>
                      </Stat>
                      <Stat size="sm">
                        <StatLabel fontSize="xs">Type</StatLabel>
                        <StatNumber fontSize="sm">{getQueryType(query.query)}</StatNumber>
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
      {filteredQueries.length > (isSmallScreen ? 3 : 5) && (
        <Box textAlign="center">
          <Button
            variant="ghost"
            colorScheme="green"
            onClick={onToggleExpanded}
            size={{ base: 'sm', md: 'md' }}
          >
            {isExpanded ? 'Show Less' : `Show All ${filteredQueries.length} Queries`}
          </Button>
        </Box>
      )}

      {/* Edit Modal */}
      <AlertDialog isOpen={isEditOpen} onClose={onEditClose} leastDestructiveRef={cancelRef}>
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader>Edit Saved Query</AlertDialogHeader>
          <AlertDialogBody>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text mb={2} fontWeight="medium">Query Name</Text>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter query name"
                />
              </Box>
              <Box>
                <Text mb={2} fontWeight="medium">SQL Query</Text>
                <Input
                  as="textarea"
                  value={editQuery}
                  onChange={(e) => setEditQuery(e.target.value)}
                  placeholder="Enter SQL query"
                  minH="120px"
                  fontFamily="mono"
                />
              </Box>
            </VStack>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button variant="ghost" onClick={onEditClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={saveEdit}>
              Save Changes
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog isOpen={isDeleteOpen} onClose={onDeleteClose} leastDestructiveRef={cancelRef}>
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader>Delete Saved Query</AlertDialogHeader>
          <AlertDialogBody>
            Are you sure you want to delete this saved query? This action cannot be undone.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button variant="ghost" onClick={onDeleteClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDelete}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </VStack>
  );
};

export default SavedQueriesPanel;
