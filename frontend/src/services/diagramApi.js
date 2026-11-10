import { apiClient } from './api';

export const diagramApi = {
  parseSQL: (sql, dialect = 'standard') => apiClient.post('/sql/parse', { sql, dialect }),
  generateSQL: (schemaDefinition, dialect = 'postgresql') => apiClient.post('/sql/generate', { schema_definition: schemaDefinition, dialect }),
  computeLayout: (schemaDefinition) => apiClient.post('/diagram/layout', schemaDefinition),
  validateSchema: (schemaDefinition) => apiClient.post('/diagram/validate', schemaDefinition),
  exportJSON: (diagramLayout) => apiClient.post('/diagram/export/json', diagramLayout),

  // AI Assistance
  explainRelationship: (relationship, schemaDefinition) =>
    apiClient.post('/ai/explain-relationship', { relationship, schema_definition: schemaDefinition }),
  getSchemaSuggestions: (schemaDefinition) => apiClient.post('/ai/suggestions', schemaDefinition),
  sendAIChat: (message, schemaContext) => apiClient.post('/ai/chat', { message, schema_context: schemaContext }),

  // File Uploads
  uploadSQLFile: (formData) => apiClient.post('/upload/sql-file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadSQLiteDB: (formData) => apiClient.post('/upload/sqlite-db', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

