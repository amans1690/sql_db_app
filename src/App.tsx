import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useToast,
  Flex,
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from '@chakra-ui/react';
import { Plus, Menu as MenuIcon, ChevronDown } from 'lucide-react';
import { QueryHistory, SavedQuery } from './types';
import QueryTab from './components/QueryTab';

interface Tab {
  id: string;
  title: string;
  query: string;
}

const App: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', title: 'Query 1', query: '' }
  ]);
  const [activeTab, setActiveTab] = useState<string>('1');
  const [queryHistory, setQueryHistory] = useState<QueryHistory[]>([]);
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const addTab = () => {
    const newTab: Tab = {
      id: Date.now().toString(),
      title: `Query ${tabs.length + 1}`,
      query: ''
    };
    setTabs([...tabs, newTab]);
    setActiveTab(newTab.id);
  };

  const removeTab = (tabId: string) => {
    if (tabs.length === 1) {
      toast({
        title: 'Cannot remove last tab',
        description: 'At least one tab must remain open.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    
    if (activeTab === tabId) {
      setActiveTab(newTabs[0].id);
    }
  };

  const updateTabQuery = (tabId: string, query: string) => {
    setTabs(tabs.map(tab => 
      tab.id === tabId ? { ...tab, query } : tab
    ));
  };

  const addToHistory = (query: string, result: any[]) => {
    const newHistory: QueryHistory = {
      id: Date.now().toString(),
      query,
      result,
      timestamp: new Date().toISOString(),
    };

    setQueryHistory(prev => {
      const updated = [newHistory, ...prev.slice(0, 9)];
      return updated;
    });
  };

  const saveQuery = (name: string, query: string) => {
    const newSavedQuery: SavedQuery = {
      id: Date.now().toString(),
      name,
      query,
      timestamp: new Date().toISOString(),
    };

    setSavedQueries(prev => [newSavedQuery, ...prev]);
    toast({
      title: 'Query saved',
      description: `"${name}" has been saved successfully.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const loadSavedQuery = (query: string) => {
    const activeTabObj = tabs.find(tab => tab.id === activeTab);
    if (activeTabObj) {
      updateTabQuery(activeTab, query);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box bg="blue.600" color="white" py={{ base: 4, md: 6 }} px={{ base: 4, md: 6 }}>
        <Container maxW="full">
          <Flex 
            direction={{ base: 'column', md: 'row' }} 
            align={{ base: 'flex-start', md: 'center' }}
            justify="space-between"
            gap={{ base: 4, md: 0 }}
          >
            <Box>
              <Heading 
                size={{ base: 'lg', md: 'xl' }}
                fontWeight="bold"
                color="white"
              >
                SQL Query Application
              </Heading>
              <Text 
                fontSize={{ base: 'sm', md: 'md' }}
                color="blue.100"
                mt={1}
              >
                Run SQL queries on CSV data with advanced features
              </Text>
            </Box>
            
            {/* Mobile Menu Button */}
            <IconButton
              aria-label="Open menu"
              icon={<MenuIcon />}
              variant="ghost"
              color="white"
              _hover={{ bg: 'blue.700' }}
              display={{ base: 'block', md: 'none' }}
              onClick={onOpen}
            />
          </Flex>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="full" py={{ base: 4, md: 6 }} px={{ base: 4, md: 6 }}>
        {/* Desktop Tabs */}
        <Box display={{ base: 'none', md: 'block' }}>
          <Tabs 
            index={tabs.findIndex(tab => tab.id === activeTab)} 
            onChange={(index) => setActiveTab(tabs[index]?.id || '1')} 
            variant="enclosed"
            colorScheme="blue"
          >
            <TabList 
              bg="gray.100" 
              borderRadius="md"
              overflowX="auto"
              css={{
                '&::-webkit-scrollbar': {
                  height: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#c1c1c1',
                  borderRadius: '4px',
                },
              }}
            >
              {tabs.map(tab => (
                <Tab
                  key={tab.id}
                  value={tab.id}
                  _selected={{ bg: 'white', borderBottomColor: 'white' }}
                  minW="max-content"
                  px={{ base: 3, lg: 4 }}
                  py={{ base: 2, lg: 3 }}
                >
                  <Text fontSize={{ base: 'sm', lg: 'md' }}>{tab.title}</Text>
                  {tabs.length > 1 && (
                    <Button
                      size="xs"
                      ml={2}
                      colorScheme="red"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTab(tab.id);
                      }}
                    >
                      ×
                    </Button>
                  )}
                </Tab>
              ))}
              <Button
                leftIcon={<Plus size={16} />}
                variant="ghost"
                size={{ base: 'sm', lg: 'md' }}
                onClick={addTab}
                ml={2}
                colorScheme="blue"
              >
                New Tab
              </Button>
            </TabList>
            
            <TabPanels>
              {tabs.map(tab => (
                <TabPanel key={tab.id} p={{ base: 4, md: 6 }}>
                  <QueryTab
                    query={tab.query}
                    onQueryChange={(query) => updateTabQuery(tab.id, query)}
                    onQueryExecute={(query, result) => addToHistory(query, result)}
                    queryHistory={queryHistory}
                    savedQueries={savedQueries}
                    onSaveQuery={saveQuery}
                    onLoadSavedQuery={loadSavedQuery}
                  />
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </Box>

        {/* Mobile Tabs */}
        <Box display={{ base: 'block', md: 'none' }}>
          <VStack spacing={4} align="stretch">
            {/* Tab Selector */}
            <Box bg="white" p={4} borderRadius="md" shadow="sm">
              <Menu>
                <MenuButton 
                  as={Button} 
                  rightIcon={<ChevronDown />}
                  variant="outline"
                  w="full"
                  justifyContent="space-between"
                  size="lg"
                >
                  {tabs.find(tab => tab.id === activeTab)?.title || 'Select Tab'}
                </MenuButton>
                <MenuList>
                  {tabs.map(tab => (
                    <MenuItem 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      bg={activeTab === tab.id ? 'blue.50' : 'transparent'}
                    >
                      <Flex justify="space-between" align="center" w="full">
                        <Text>{tab.title}</Text>
                        {tabs.length > 1 && (
                          <Button
                            size="xs"
                            colorScheme="red"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeTab(tab.id);
                            }}
                          >
                            ×
                          </Button>
                        )}
                      </Flex>
                    </MenuItem>
                  ))}
                  <MenuItem onClick={addTab} color="blue.600">
                    <Plus size={16} />
                    <Text ml={2}>New Tab</Text>
                  </MenuItem>
                </MenuList>
              </Menu>
            </Box>

            {/* Active Tab Content */}
            <Box bg="white" p={4} borderRadius="md" shadow="sm">
              <QueryTab
                query={tabs.find(tab => tab.id === activeTab)?.query || ''}
                onQueryChange={(query) => updateTabQuery(activeTab, query)}
                onQueryExecute={(query, result) => addToHistory(query, result)}
                queryHistory={queryHistory}
                savedQueries={savedQueries}
                onSaveQuery={saveQuery}
                onLoadSavedQuery={loadSavedQuery}
              />
            </Box>
          </VStack>
        </Box>
      </Container>

      {/* Mobile Drawer for History/Saved Queries */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="full">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <Text fontSize="lg" fontWeight="semibold">Menu</Text>
          </DrawerHeader>
          <DrawerBody>
            <VStack spacing={6} align="stretch" pt={4}>
              <Box>
                <Text fontWeight="semibold" mb={3} color="blue.600">
                  Query History ({queryHistory.length})
                </Text>
                <VStack spacing={2} align="stretch">
                  {queryHistory.slice(0, 5).map((history) => (
                    <Box 
                      key={history.id} 
                      p={3} 
                      bg="gray.50" 
                      borderRadius="md"
                      border="1px solid"
                      borderColor="gray.200"
                    >
                      <Text fontSize="sm" fontWeight="medium" mb={1}>
                        {history.query.substring(0, 50)}...
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        {new Date(history.timestamp).toLocaleString()}
                      </Text>
                    </Box>
                  ))}
                </VStack>
              </Box>

              <Box>
                <Text fontWeight="semibold" mb={3} color="green.600">
                  Saved Queries ({savedQueries.length})
                </Text>
                <VStack spacing={2} align="stretch">
                  {savedQueries.slice(0, 5).map((saved) => (
                    <Box 
                      key={saved.id} 
                      p={3} 
                      bg="green.50" 
                      borderRadius="md"
                      border="1px solid"
                      borderColor="green.200"
                    >
                      <Text fontSize="sm" fontWeight="medium" mb={1}>
                        {saved.name}
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        {saved.query.substring(0, 50)}...
                      </Text>
                    </Box>
                  ))}
                </VStack>
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default App;
