# SQL2ER STUDIO - Relational Data Modeling Guide

## Cardinality Notation & Rules

| Notation | Type | Description |
| :--- | :--- | :--- |
| `1:1` | One-to-One | The referencing table's FK is declared with a `UNIQUE` constraint or is also the `PRIMARY KEY`. |
| `1:N` | One-to-Many | A standard Foreign Key reference where multiple child records link to one parent record. |
| `N:M` | Many-to-Many | Two tables connected via an associative junction table with a composite primary key. |

## Referential Action Guidelines

1. **`CASCADE`**: Use on dependent child entities that have no lifecycle independent of the parent (e.g. `order_items` cascading on `orders`).
2. **`RESTRICT` / `NO ACTION`**: Protect master catalog entities from accidental deletion if transactions reference them (e.g. deleting a `product` while referenced in historic `order_items`).
3. **`SET NULL`**: Use for optional relationships (e.g. self-referencing parent categories or optional assigned managers).

