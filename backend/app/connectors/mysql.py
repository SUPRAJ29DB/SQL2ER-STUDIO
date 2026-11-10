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

class MySQLConnector(BaseConnector):
    """MySQL Schema Extractor and Query Runner using information_schema."""

    def __init__(self, config: DatabaseConnectionConfig):
        self.config = config

    def _get_connection(self):
        try:
            import pymysql
            return pymysql.connect(
                host=self.config.host or "localhost",
                port=self.config.port or 3306,
                database=self.config.database,
                user=self.config.username or "root",
                password=self.config.password or "",
                connect_timeout=5,
                charset='utf8mb4'
            )
        except Exception as e:
            raise DatabaseConnectionException(f"Failed to connect to MySQL: {str(e)}", db_type="mysql")

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
            WHERE table_schema = %s AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        """, (self.config.database,))
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
                SELECT column_name, column_type, is_nullable, column_default, column_key, extra
                FROM information_schema.columns
                WHERE table_schema = %s AND table_name = %s
                ORDER BY ordinal_position;
            """, (self.config.database, tbl))
            cols_res = cur.fetchall()

            columns: List[ColumnDefinition] = []
            primary_keys: List[str] = []

            for col in cols_res:
                c_name, c_type, is_null, dflt, c_key, extra = col
                is_pk = (c_key == 'PRI')
                is_unique = (c_key == 'UNI')
                is_auto = ('auto_increment' in str(extra).lower())

                if is_pk:
                    primary_keys.append(c_name)

                columns.append(ColumnDefinition(
                    name=c_name,
                    data_type=c_type.upper(),
                    is_primary_key=is_pk,
                    is_unique=is_unique,
                    is_auto_increment=is_auto,
                    is_nullable=(is_null == 'YES' and not is_pk),
                    default_value=str(dflt) if dflt else None
                ))

            # 2. Fetch Foreign Keys
            cur.execute("""
                SELECT 
                    kcu.constraint_name,
                    kcu.column_name,
                    kcu.referenced_table_name,
                    kcu.referenced_column_name,
                    rc.update_rule,
                    rc.delete_rule
                FROM information_schema.key_column_usage kcu
                JOIN information_schema.referential_constraints rc 
                  ON kcu.constraint_name = rc.constraint_name 
                  AND kcu.table_schema = rc.constraint_schema
                WHERE kcu.table_schema = %s 
                  AND kcu.table_name = %s 
                  AND kcu.referenced_table_name IS NOT NULL;
            """, (self.config.database, tbl))
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
                schema_name=self.config.database,
                columns=columns,
                primary_keys=primary_keys,
                foreign_keys=foreign_keys
            ))

        conn.close()

        return SchemaDefinition(
            database_name=self.config.database,
            dialect="mysql",
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

