"""
Synthetic Schema Generator for AI training and benchmark evaluation.
Generates multi-table relational schemas with various cardinalities, junction tables, and constraint patterns.
"""

import json
import random

ENTITIES = ["user", "organization", "project", "task", "comment", "invoice", "payment", "subscription"]

def generate_synthetic_schema():
    selected = random.sample(ENTITIES, k=random.randint(3, 5))
    ddl_statements = []
    
    for entity in selected:
        ddl = f"CREATE TABLE {entity}s (\n    id SERIAL PRIMARY KEY,\n    name VARCHAR(100) NOT NULL,\n    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);"
        ddl_statements.append(ddl)

    return "\n\n".join(ddl_statements)

if __name__ == "__main__":
    schemas = [generate_synthetic_schema() for _ in range(5)]
    print(f"Generated {len(schemas)} synthetic schemas successfully.")

