import { useState } from 'react';
import { databaseApi } from '../services/databaseApi';
import { useAppStore } from '../store/appStore';

export const useQuery = () => {
  const {
    activeConnection,
    queryTabs,
    setQueryTabs,
    activeTabId,
    setActiveTabId,
    queryResult,
    setQueryResult,
    isExecutingQuery,
    setIsExecutingQuery,
    setStatusMessage,
  } = useAppStore();

  const [history, setHistory] = useState([]);

  const activeTab = queryTabs.find((t) => t.id === activeTabId) || queryTabs[0];

  const updateTabSql = (sql) => {
    setQueryTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, sql } : t))
    );
  };

  const addTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTab = {
      id: newId,
      title: `Query ${queryTabs.length + 1}`,
      sql: `-- New Query Tab\nSELECT 1;`,
    };
    setQueryTabs([...queryTabs, newTab]);
    setActiveTabId(newId);
  };

  const closeTab = (id) => {
    if (queryTabs.length <= 1) return;
    const remaining = queryTabs.filter((t) => t.id !== id);
    setQueryTabs(remaining);
    if (activeTabId === id) {
      setActiveTabId(remaining[0].id);
    }
  };

  const executeCurrentQuery = async () => {
    if (!activeTab || !activeTab.sql.trim()) return;

    setIsExecutingQuery(true);
    setStatusMessage('Executing query...');
    try {
      const res = await databaseApi.executeQuery({
        connection_id: activeConnection?.id,
        query: activeTab.sql,
        limit: 100,
        offset: 0,
      });

      if (res.success && res.data) {
        setQueryResult(res.data);
        setStatusMessage(`Query completed in ${res.data.execution_time_ms} ms (${res.data.row_count} rows).`);
      } else {
        setStatusMessage(res.message || 'Query failed');
      }
    } catch (err) {
      setQueryResult({
        columns: ['Error'],
        rows: [[err.message]],
        row_count: 0,
        execution_time_ms: 0,
        query: activeTab.sql,
      });
      setStatusMessage(`Query execution error: ${err.message}`);
    } finally {
      setIsExecutingQuery(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await databaseApi.getQueryHistory();
      if (res.success && res.data) {
        setHistory(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return {
    activeTab,
    queryTabs,
    activeTabId,
    setActiveTabId,
    updateTabSql,
    addTab,
    closeTab,
    executeCurrentQuery,
    queryResult,
    isExecutingQuery,
    history,
    fetchHistory,
  };
};

