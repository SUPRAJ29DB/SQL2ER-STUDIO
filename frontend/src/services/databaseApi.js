import { apiClient } from './api';

export const databaseApi = {
  // Connections
  getConnections: () => apiClient.get('/connections'),
  saveConnection: (data) => apiClient.post('/connections', data),
  deleteConnection: (id) => apiClient.delete(`/connections/${id}`),
  testConnection: (data) => apiClient.post('/connections/test', data),

  // Database Introspection
  getDatabaseSchema: (connectionId) => apiClient.get(`/database/${connectionId}/schema`),
  getDatabaseTables: (connectionId) => apiClient.get(`/database/${connectionId}/tables`),
  getTablePreview: (connectionId, tableName) => apiClient.get(`/database/${connectionId}/table/${tableName}/preview`),

  // Query Execution
  executeQuery: (data) => apiClient.post('/sql/execute', data),
  getQueryHistory: () => apiClient.get('/sql/history'),
  validateQuery: (sql) => apiClient.post('/sql/validate', { sql }),
};

