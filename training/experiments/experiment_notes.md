# Schema Intelligence Experiment Logs

## Experiment 1: Heuristic vs. Small LLM Cardinality Disambiguation
- **Objective**: Test accuracy in distinguishing 1:1 vs 1:N when UNIQUE constraint is declared at the table index level vs column level.
- **Result**: Heuristic AST parser achieved 99.4% accuracy with sub-millisecond execution time, outperforming LLM zero-shot inference latency.

## Experiment 2: Missing Foreign Key Detection via Naming Patterns
- **Objective**: Identify undeclared foreign key relations when developers omit constraints but follow column naming patterns (`<entity>_id`).
- **Result**: Hybrid analyzer achieved 94% recall across standard open-source datasets (Sakila, Northwind, Chinook).

