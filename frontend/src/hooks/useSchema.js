import { useState } from 'react';
import { diagramApi } from '../services/diagramApi';
import { useAppStore } from '../store/appStore';

export const useSchema = () => {
  const {
    schemaDefinition,
    setSchemaDefinition,
    diagramLayout,
    setDiagramLayout,
    setStatusMessage,
  } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const parseSqlScript = async (sql, dialect = 'standard') => {
    setLoading(true);
    setError(null);
    try {
      const res = await diagramApi.parseSQL(sql, dialect);
      if (res.success && res.data) {
        setDiagramLayout({
          nodes: res.data.nodes || [],
          edges: res.data.edges || [],
        });
        setSchemaDefinition(res.data.schema_definition);
        setStatusMessage(`Parsed ${res.data.nodes?.length || 0} tables successfully.`);
        return res.data;
      }
    } catch (err) {
      setError(err.message);
      setStatusMessage(`Parse error: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const generateSql = async (dialect = 'postgresql') => {
    setLoading(true);
    try {
      const res = await diagramApi.generateSQL(schemaDefinition, dialect);
      if (res.success) {
        return res.data;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loadSchemaFromLiveDatabase = async (connectionId) => {
    setLoading(true);
    try {
      const res = await diagramApi.getDatabaseSchema(connectionId);
      if (res.success && res.data) {
        setDiagramLayout({
          nodes: res.data.nodes || [],
          edges: res.data.edges || [],
        });
        setSchemaDefinition(res.data.schema_definition);
        setStatusMessage(`Introspected live database successfully.`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    schemaDefinition,
    diagramLayout,
    setDiagramLayout,
    loading,
    error,
    parseSqlScript,
    generateSql,
    loadSchemaFromLiveDatabase,
  };
};

