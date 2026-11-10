import sqlite3
import time
from typing import List, Optional
from app.connectors.base import BaseConnector
from app.models.schema_models import (
    SchemaDefinition, TableDefinition, ColumnDefinition,
    ForeignKeyDefinition, IndexDefinition, RelationshipDefinition, CardinalityType
)
from app.models.response_models import QueryResultResponse
from app.utils.exceptions import DatabaseConnectionException

class SQLiteConnector(BaseConnector):
    """Reflects SQLite schemas and executes queries."""

    def __init__(self, db_path: str):
        self.db_path = db_path
        self._conn = None

    def _get_connection(self):
        try:
            return sqlite3.connect(self.db_path, check_same_thread=False)
        except Exception as e:
            raise DatabaseConnectionException(f"Failed to connect to SQLite at {self.db_path}: {str(e)}", db_type="sqlite")

    def test_connection(self) -> bool:
        try:
            conn = self._get_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT 1;")
            result = cursor.fetchone()
            conn.close()
            return result[0] == 1
        except Exception:
            return False

    def get_tables(self) -> List[str]:
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
        tables = [row[0] for row in cursor.fetchall()]
        conn.close()
        return tables

    def extract_schema(self) -> SchemaDefinition:
        conn = self._get_connection()
        cursor = conn.cursor()
        tables = self.get_tables()

        table_definitions: List[TableDefinition] = []
        relationships: List[RelationshipDefinition] = []

        for tbl_name in tables:
            # 1. Columns via PRAGMA table_info
            cursor.execute(f"PRAGMA table_info('{tbl_name}');")
            cols_data = cursor.fetchall()

            columns: List[ColumnDefinition] = []
            primary_keys: List[str] = []

            for col in cols_data:
                # cid, name, type, notnull, dflt_value, pk
                c_name = col[1]
                c_type = col[2] or "TEXT"
                is_not_null = bool(col[3])
                default_val = str(col[4]) if col[4] is not None else None
                is_pk = bool(col[5])

                if is_pk:
                    primary_keys.append(c_name)

                columns.append(ColumnDefinition(
                    name=c_name,
                    data_type=c_type.upper(),
                    is_primary_key=is_pk,
                    is_nullable=not (is_not_null or is_pk),
                    default_value=default_val
                ))

            # 2. Foreign keys via PRAGMA foreign_key_list
            cursor.execute(f"PRAGMA foreign_key_list('{tbl_name}');")
            fk_data = cursor.fetchall()
            foreign_keys: List[ForeignKeyDefinition] = []

            for fk in fk_data:
                # id, seq, table, from, to, on_update, on_delete, match
                ref_table = fk[2]
                from_col = fk[3]
                to_col = fk[4]
                on_update = fk[5]
                on_delete = fk[6]

                foreign_keys.append(ForeignKeyDefinition(
                    name=f"fk_{tbl_name}_{from_col}",
                    constrained_columns=[from_col],
                    referred_table=ref_table,
                    referred_columns=[to_col],
                    on_delete=on_delete,
                    on_update=on_update
                ))

                # Mark column as foreign key
                for c in columns:
                    if c.name.lower() == from_col.lower():
                        c.is_foreign_key = True
                        c.references_table = ref_table
                        c.references_column = to_col

                rel_id = f"rel_{tbl_name}_{from_col}_to_{ref_table}_{to_col}"
                relationships.append(RelationshipDefinition(
                    id=rel_id,
                    source_table=tbl_name,
                    source_column=from_col,
                    target_table=ref_table,
                    target_column=to_col,
                    cardinality=CardinalityType.ONE_TO_MANY,
                    on_delete=on_delete,
                    on_update=on_update
                ))

            # 3. Indexes via PRAGMA index_list
            cursor.execute(f"PRAGMA index_list('{tbl_name}');")
            idx_list = cursor.fetchall()
            indexes: List[IndexDefinition] = []
            for idx in idx_list:
                # seq, name, unique, origin, partial
                idx_name = idx[1]
                is_unique = bool(idx[2])
                cursor.execute(f"PRAGMA index_info('{idx_name}');")
                idx_cols = [c[2] for c in cursor.fetchall()]
                indexes.append(IndexDefinition(
                    name=idx_name,
                    columns=idx_cols,
                    is_unique=is_unique
                ))
                if is_unique and len(idx_cols) == 1:
                    for c in columns:
                        if c.name.lower() == idx_cols[0].lower():
                            c.is_unique = True

            table_definitions.append(TableDefinition(
                name=tbl_name,
                schema_name="main",
                columns=columns,
                primary_keys=primary_keys,
                foreign_keys=foreign_keys,
                indexes=indexes
            ))

        conn.close()

        return SchemaDefinition(
            database_name="sqlite_db",
            dialect="sqlite",
            tables=table_definitions,
            relationships=relationships
        )

    def execute_query(self, query: str, limit: int = 100, offset: int = 0) -> QueryResultResponse:
        conn = self._get_connection()
        cursor = conn.cursor()
        start_time = time.time()
        
        # Apply pagination safely for SELECT
        trimmed_query = query.strip().rstrip(';')
        if trimmed_query.upper().startswith("SELECT") and "LIMIT" not in trimmed_query.upper():
            paginated_query = f"{trimmed_query} LIMIT {limit} OFFSET {offset};"
        else:
            paginated_query = trimmed_query

        cursor.execute(paginated_query)
        rows_data = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description] if cursor.description else []
        execution_time = (time.time() - start_time) * 1000

        conn.close()
        return QueryResultResponse(
            columns=columns,
            rows=[list(r) for r in rows_data],
            row_count=len(rows_data),
            execution_time_ms=round(execution_time, 2),
            query=paginated_query
        )

    def close(self):
        if self._conn:
            self._conn.close()
            self._conn = None

