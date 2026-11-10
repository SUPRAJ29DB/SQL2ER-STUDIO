import time
from typing import List, Optional
from app.connectors.base import BaseConnector
from app.models.connection_models import DatabaseConnectionConfig
from app.models.schema_models import (
    SchemaDefinition, TableDefinition, ColumnDefinition,
    ForeignKeyDefinition, IndexDefinition, RelationshipDefinition, CardinalityType
)
from app.models.response_models import QueryResultResponse
from app.utils.exceptions import DatabaseConnectionException

class PostgreSQLConnector(BaseConnector):
    """PostgreSQL Schema Extractor and Query Runner using information_schema."""

    def __init__(self, config: DatabaseConnectionConfig):
        self.config = config

    def _get_connection(self):
        try:
            import psycopg2
            return psycopg2.connect(
                host=self.config.host or "localhost",
                port=self.config.port or 5432,
                dbname=self.config.database,
                user=self.config.username,
                password=self.config.password,
                connect_timeout=5
            )
        except Exception as e:
            raise DatabaseConnectionException(f"Failed to connect to PostgreSQL: {str(e)}", db_type="postgresql")

    def test_connection(self) -> bool:
        try:
            conn = self._get_connection()
            cur = conn.cursor()
            cur.execute("SELECT 1;")
            res = cur.fetchone()
            conn.close()
            return res[0] == 1
        except Exception:
            return False

    def get_tables(self) -> List[str]:
        conn = self._get_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        """)
        tables = [r[0] for r in cur.fetchall()]
        conn.close()
        return tables

    def extract_schema(self) -> SchemaDefinition:
        conn = self._get_connection()
        cur = conn.cursor()
        tables = self.get_tables()

        table_definitions: List[TableDefinition] = []
        relationships: List[RelationshipDefinition] = []

        for tbl in tables:
            # 1. Fetch columns
            cur.execute("""
                SELECT column_name, data_type, is_nullable, column_default, character_maximum_length
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = %s
                ORDER BY ordinal_position;
            """, (tbl,))
            cols_res = cur.fetchall()

            # 2. Fetch PKs
            cur.execute("""
                SELECT kcu.column_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu
                  ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
                WHERE tc.constraint_type = 'PRIMARY KEY' 
                  AND tc.table_schema = 'public' 
                  AND tc.table_name = %s;
            """, (tbl,))
            pks = [r[0] for r in cur.fetchall()]

            columns: List[ColumnDefinition] = []
            for col in cols_res:
                c_name, d_type, is_null, dflt, max_len = col
                type_str = f"{d_type}({max_len})" if max_len else d_type
                is_pk = c_name in pks
                columns.append(ColumnDefinition(
                    name=c_name,
                    data_type=type_str.upper(),
                    is_primary_key=is_pk,
                    is_nullable=(is_null == 'YES' and not is_pk),
                    default_value=str(dflt) if dflt else None
                ))

            # 3. Fetch Foreign Keys
            cur.execute("""
                SELECT
                    tc.constraint_name,
                    kcu.column_name,
                    ccu.table_name AS foreign_table_name,
                    ccu.column_name AS foreign_column_name,
                    rc.update_rule,
                    rc.delete_rule
                FROM information_schema.table_constraints AS tc
                JOIN information_schema.key_column_usage AS kcu
                    ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                    ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
                JOIN information_schema.referential_constraints AS rc
                    ON rc.constraint_name = tc.constraint_name
                WHERE tc.constraint_type = 'FOREIGN KEY'
                  AND tc.table_schema = 'public'
                  AND tc.table_name = %s;
            """, (tbl,))
            fks_res = cur.fetchall()

            foreign_keys: List[ForeignKeyDefinition] = []
            for fk in fks_res:
                fk_name, col_name, ref_tbl, ref_col, update_rule, delete_rule = fk
                foreign_keys.append(ForeignKeyDefinition(
                    name=fk_name,
                    constrained_columns=[col_name],
                    referred_table=ref_tbl,
                    referred_columns=[ref_col],
                    on_delete=delete_rule,
                    on_update=update_rule
                ))
                for c in columns:
                    if c.name == col_name:
                        c.is_foreign_key = True
                        c.references_table = ref_tbl
                        c.references_column = ref_col

                rel_id = f"rel_{tbl}_{col_name}_to_{ref_tbl}_{ref_col}"
                relationships.append(RelationshipDefinition(
                    id=rel_id,
                    source_table=tbl,
                    source_column=col_name,
                    target_table=ref_tbl,
                    target_column=ref_col,
                    cardinality=CardinalityType.ONE_TO_MANY,
                    on_delete=delete_rule,
                    on_update=update_rule
                ))

            table_definitions.append(TableDefinition(
                name=tbl,
                schema_name="public",
                columns=columns,
                primary_keys=pks,
                foreign_keys=foreign_keys
            ))

        conn.close()

        return SchemaDefinition(
            database_name=self.config.database,
            dialect="postgresql",
            tables=table_definitions,
            relationships=relationships
        )

    def execute_query(self, query: str, limit: int = 100, offset: int = 0) -> QueryResultResponse:
        conn = self._get_connection()
        cur = conn.cursor()
        start = time.time()
        
        trimmed_query = query.strip().rstrip(';')
        if trimmed_query.upper().startswith("SELECT") and "LIMIT" not in trimmed_query.upper():
            paginated_query = f"{trimmed_query} LIMIT {limit} OFFSET {offset};"
        else:
            paginated_query = trimmed_query

        cur.execute(paginated_query)
        rows = cur.fetchall()
        cols = [desc[0] for desc in cur.description] if cur.description else []
        execution_time = (time.time() - start) * 1000
        conn.close()

        return QueryResultResponse(
            columns=cols,
            rows=[list(r) for r in rows],
            row_count=len(rows),
            execution_time_ms=round(execution_time, 2),
            query=paginated_query
        )

    def close(self):
        pass

