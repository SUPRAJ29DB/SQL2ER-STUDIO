import { useState, useEffect, createContext, useContext } from 'react';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // Navigation & Page State
  const [currentPage, setCurrentPage] = useState('workspace'); // home, workspace, er-designer, settings

  // Database Connection State
  const [connections, setConnections] = useState([]);
  const [activeConnection, setActiveConnection] = useState(null);

  // Diagram & Schema State
  const [schemaDefinition, setSchemaDefinition] = useState({
    database_name: 'demo_db',
    dialect: 'postgresql',
    tables: [],
    relationships: [],
  });
  const [diagramLayout, setDiagramLayout] = useState({
    nodes: [],
    edges: [],
  });
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedRelationship, setSelectedRelationship] = useState(null);

  // Query & Editor State
  const [queryTabs, setQueryTabs] = useState([
    {
      id: 'tab-1',
      title: 'Query 1',
      sql: `-- SQL2ER STUDIO Editor\n-- Write your SQL DDL or SELECT query here\nSELECT * FROM users LIMIT 10;`,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');
  const [queryResult, setQueryResult] = useState(null);
  const [isExecutingQuery, setIsExecutingQuery] = useState(false);

  // AI & Sidebars State
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Ready');
  const [backendHealthy, setBackendHealthy] = useState(true);

  // Health check on start
  useEffect(() => {
    fetch('http://127.0.0.1:8000/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'healthy') {
          setBackendHealthy(true);
          setStatusMessage('Connected to FastAPI backend');
        }
      })
      .catch(() => {
        setBackendHealthy(false);
        setStatusMessage('Backend offline (Run scripts/run_backend.ps1)');
      });
  }, []);

  const value = {
    currentPage,
    setCurrentPage,
    connections,
    setConnections,
    activeConnection,
    setActiveConnection,
    schemaDefinition,
    setSchemaDefinition,
    diagramLayout,
    setDiagramLayout,
    selectedTable,
    setSelectedTable,
    selectedRelationship,
    setSelectedRelationship,
    queryTabs,
    setQueryTabs,
    activeTabId,
    setActiveTabId,
    queryResult,
    setQueryResult,
    isExecutingQuery,
    setIsExecutingQuery,
    isAIAssistantOpen,
    setIsAIAssistantOpen,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    statusMessage,
    setStatusMessage,
    backendHealthy,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
};

