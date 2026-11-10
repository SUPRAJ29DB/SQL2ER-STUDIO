# SQL2ER STUDIO 🚀

**SQL2ER STUDIO** is an intelligent, cross-platform Desktop & Web application for database reverse-engineering, interactive Entity-Relationship (ER) diagramming, SQL schema analytics, and AI-powered database design assistance.

---

## 🌟 Key Features

- **Bidirectional SQL ↔ ER Mapping**:
  - Parse any SQL DDL script (`CREATE TABLE`, `ALTER TABLE`, foreign keys, constraints, composite keys, checks, indexes) into an interactive ER diagram.
  - Export custom or modified ER diagrams back to clean, standardized SQL DDL for PostgreSQL, MySQL, and SQLite.
- **Live Database Connectors**:
  - Connect seamlessly to SQLite, PostgreSQL, and MySQL.
  - Inspect schemas, table structures, column definitions, constraints, foreign key mappings, and table data previews.
- **Interactive Visual Canvas**:
  - Interactive table nodes with column icons (Primary Key, Foreign Key, Nullable, Data Types).
  - Smart relationship connectors with cardinality indicators ($1:1$, $1:N$, $N:M$) and referential action tooltips (`ON DELETE`, `ON UPDATE`).
  - Auto-layout engine with hierarchical grouping and physics-based collision avoidance.
  - Export diagrams as high-resolution PNG, SVG, or JSON schemas.
- **SQL Code Editor & Execution**:
  - Multi-tab query editor with query execution, pagination, results table, and query history logging.
- **AI-Powered Schema Intelligence**:
  - Automated relationship explanation in human-readable terms.
  - Schema quality audits (detecting missing indexes on foreign keys, redundant columns, missing primary keys, denormalization red flags).
  - Support for local heuristic rules, Ollama, OpenAI, Anthropic Claude, and Google Gemini models.
- **Cross-Platform Desktop & Web**:
  - Runs as an Electron desktop app with embedded backend lifecycle management, or as a standalone Web application with FastAPI and Vite.

---

## 🏗️ Architecture Overview

```
SQL2ER/
├── desktop/           # Electron desktop wrapper with backend process manager
├── frontend/          # React 18 + Vite + Tailwind CSS + React Flow studio
├── backend/           # FastAPI + SQL Parser + Schema Engine + AI engines
├── database/          # Initial SQL seeds & schema migrations
├── training/          # Synthetic schema datasets & model fine-tuning experiments
├── docs/              # In-depth architectural & API specifications
├── exports/           # SQL and diagram export outputs
└── scripts/           # PowerShell automation scripts for setup and execution
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python**: 3.10+ (tested with Python 3.11 - 3.13)
- **Node.js**: v18+ (tested with Node 20 / 22)
- **Git** (optional)

### 1. Automated Setup (Windows PowerShell)
Run the automated setup script to configure the backend virtual environment, install requirements, and install frontend dependencies:
```powershell
.\scripts\setup.ps1
```

### 2. Run the Backend API Server
```powershell
.\scripts\run_backend.ps1
```
The FastAPI documentation will be available at: [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Run the Frontend (Vite Web App)
```powershell
cd frontend
npm run dev
```
Open your browser at [http://localhost:5173](http://localhost:5173).

### 4. Run the Desktop Application (Electron)
```powershell
.\scripts\run_desktop.ps1
```

---

## 📚 Documentation
- [Architecture Guide](docs/architecture.md)
- [API Documentation](docs/api_documentation.md)
- [Database Design Reference](docs/database_design.md)
- [Roadmap & Enhancements](docs/roadmap.md)

---

## 📄 License
MIT License. Built for modern database architects, developers, and engineers.

