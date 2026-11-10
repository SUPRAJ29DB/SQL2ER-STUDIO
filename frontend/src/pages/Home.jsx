import React from 'react';
import { Database, LayoutGrid, Code, FileUp, Sparkles, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useSchema } from '../hooks/useSchema';

export const Home = ({ onOpenNewConnection, onOpenImportSql }) => {
  const { setCurrentPage, schemaDefinition } = useAppStore();
  const { parseSqlScript } = useSchema();

  const handleLoadDemo = async () => {
    const demoSql = `
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    full_name VARCHAR(100),
    bio TEXT,
    CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    parent_id INT,
    CONSTRAINT fk_cat_parent FOREIGN KEY (parent_id) REFERENCES categories(id)
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_prod_cat FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING',
    CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    PRIMARY KEY (order_id, product_id),
    CONSTRAINT fk_item_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_item_product FOREIGN KEY (product_id) REFERENCES products(id)
);
`;
    await parseSqlScript(demoSql, 'postgresql');
    setCurrentPage('er-designer');
  };

  const tables = schemaDefinition?.tables || [];
  const relationships = schemaDefinition?.relationships || [];

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 max-w-6xl mx-auto">
      {/* Hero Banner */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/20 relative overflow-hidden">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Relational Studio</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Turn Any SQL Schema into Interactive ER Diagrams in Seconds
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Reverse-engineer PostgreSQL, MySQL, and SQLite databases, design relational models, inspect foreign key cardinalities ($1:1$, $1:N$, $N:M$), and audit schema quality.
          </p>
          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={() => setCurrentPage('workspace')}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 transition-all"
            >
              <span>Open SQL Editor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleLoadDemo}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-colors"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
              <span>Load E-Commerce Demo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={onOpenImportSql}
          className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <FileUp className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-200 text-sm mb-1">Import SQL / DDL</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Upload an existing `.sql` or SQLite file to generate interactive ER nodes automatically.
          </p>
        </div>

        <div
          onClick={onOpenNewConnection}
          className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-200 text-sm mb-1">Connect Live Database</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Connect to PostgreSQL, MySQL, or SQLite to introspect tables and live data.
          </p>
        </div>

        <div
          onClick={() => setCurrentPage('er-designer')}
          className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-200 text-sm mb-1">ER Diagram Canvas</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Drag, organize, and export high-resolution diagrams and DDL code.
          </p>
        </div>
      </div>

      {/* Active Schema Summary Metrics */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Active Workspace Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
            <div className="text-slate-400 text-xs mb-1">Entities (Tables)</div>
            <div className="text-2xl font-bold text-slate-100 font-mono">{tables.length}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
            <div className="text-slate-400 text-xs mb-1">Foreign Key Links</div>
            <div className="text-2xl font-bold text-indigo-400 font-mono">{relationships.length}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
            <div className="text-slate-400 text-xs mb-1">Total Columns</div>
            <div className="text-2xl font-bold text-emerald-400 font-mono">
              {tables.reduce((acc, t) => acc + (t.columns?.length || 0), 0)}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
            <div className="text-slate-400 text-xs mb-1">Selected Dialect</div>
            <div className="text-xl font-bold text-purple-400 font-mono uppercase">
              {schemaDefinition?.dialect || 'PostgreSQL'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

