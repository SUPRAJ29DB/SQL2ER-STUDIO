import { useState, useEffect } from 'react';
import { databaseApi } from '../services/databaseApi';
import { useAppStore } from '../store/appStore';

export const useDatabase = () => {
  const { connections, setConnections, activeConnection, setActiveConnection, setStatusMessage } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const res = await databaseApi.getConnections();
      if (res.success && res.data) {
        setConnections(res.data);
        if (!activeConnection && res.data.length > 0) {
          setActiveConnection(res.data[0]);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createConnection = async (config) => {
    setLoading(true);
    try {
      const res = await databaseApi.saveConnection(config);
      if (res.success && res.data) {
        setConnections((prev) => [...prev, res.data]);
        setActiveConnection(res.data);
        setStatusMessage(`Connected to ${res.data.name}`);
        return res.data;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async (config) => {
    try {
      const res = await databaseApi.testConnection(config);
      return res.success && res.data;
    } catch (err) {
      return false;
    }
  };

  const removeConnection = async (id) => {
    try {
      await databaseApi.deleteConnection(id);
      setConnections((prev) => prev.filter((c) => c.id !== id));
      if (activeConnection?.id === id) {
        setActiveConnection(null);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return {
    connections,
    activeConnection,
    setActiveConnection,
    loading,
    error,
    fetchConnections,
    createConnection,
    testConnection,
    removeConnection,
  };
};

