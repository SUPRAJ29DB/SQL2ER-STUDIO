# SQL2ER STUDIO - REST API Specification

The FastAPI backend exposes interactive OpenAPI docs at `http://localhost:8000/docs`.

### 1. SQL Endpoints (`/api/sql`)
- `POST /api/sql/parse`
  - Request: `{"sql": "CREATE TABLE ...", "dialect": "standard"}`
  - Response: `ApiResponse<DiagramLayout>`
- `POST /api/sql/generate`
  - Request: `{"schema_definition": {...}, "dialect": "postgresql" | "mysql" | "sqlite"}`
  - Response: `ApiResponse<string>`
- `POST /api/sql/validate`
  - Request: `{"sql": "..."}`
  - Response: `ApiResponse<{is_valid: bool, errors: string[]}>`
- `POST /api/sql/execute`
  - Request: `{"connection_id": "...", "query": "SELECT * FROM ...", "limit": 100, "offset": 0}`
  - Response: `ApiResponse<QueryResultResponse>`
- `GET /api/sql/history`
  - Response: `ApiResponse<QueryHistoryItem[]>`

### 2. Upload Endpoints (`/api/upload`)
- `POST /api/upload/sql-file`: Multipart file upload for `.sql` / `.ddl`.
- `POST /api/upload/sqlite-db`: Multipart file upload for `.sqlite` / `.db`.

### 3. Database Connection Endpoints (`/api/connections`)
- `GET /api/connections`: Lists active connection profiles.
- `POST /api/connections`: Save new connection profile.
- `POST /api/connections/test`: Test connectivity.
- `DELETE /api/connections/{id}`: Remove connection profile.

### 4. Database Introspection (`/api/database`)
- `GET /api/database/{id}/schema`: Full schema reflection into visual diagram layout.
- `GET /api/database/{id}/tables`: Table names list.
- `GET /api/database/{id}/table/{name}/preview`: Table data rows.

### 5. AI Assistance Endpoints (`/api/ai`)
- `POST /api/ai/explain-relationship`: Business & technical explanation of a relationship.
- `POST /api/ai/suggestions`: Schema health score & improvement recommendations.
- `POST /api/ai/chat`: Free-form natural language query and data modeling conversation.

