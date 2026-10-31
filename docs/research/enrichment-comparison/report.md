# Thirty-Question enrichment comparison

Study: 2026-10-30-v1. Agent-drafted expectations; not human-approved ground truth.

Status: **pending (0/90 successful calls)**.

Both paths use the same original Question bodies. Haiku generates Title + Topics in one path; the other uses full Clef for Topics and Haiku separately for Title. No production metadata is written.

Reference labels were drafted before API calls and are omitted from every request. They are provisional expectations, not independently established ground truth. The sample deliberately includes historical repairs and misleading keywords; it is not a random estimate of archive-wide accuracy.

## Side-by-side review

| Question | Split | Expected Topics | Haiku combined | Clef + Haiku Title | Review note |
| --- | --- | --- | --- | --- | --- |
| [2017-04-01](../../../src/content/questions/2017-04-01.md) | calibration | numbers, strings | Pending | Pending | Oldest question; Roman numeral conversion. |
| [2017-09-05](../../../src/content/questions/2017-09-05.md) | evaluation | strings, parsing | Pending | Pending | Explicitly forbids regular expressions and splitting. |
| [2017-10-01](../../../src/content/questions/2017-10-01.md) | calibration | geometry, math | Pending | Pending | Hand-maintained inverse kinematics question. |
| [2017-10-09](../../../src/content/questions/2017-10-09.md) | calibration | stacks-queues, data-structures | Pending | Pending | Hand-maintained queue implementation. |
| [2017-10-16](../../../src/content/questions/2017-10-16.md) | evaluation | arrays, searching | Pending | Pending | Hand-maintained majority in sorted input; sorting is not requested. |
| [2017-10-23](../../../src/content/questions/2017-10-23.md) | calibration | arrays, math | Pending | Pending | Hand-maintained modular differences; avoid confusing with ordinary two-sum. |
| [2017-12-18](../../../src/content/questions/2017-12-18.md) | evaluation | strings | Pending | Pending | Pine-tree printing; previous week's stack solution contaminates the extracted body. |
| [2018-01-22](../../../src/content/questions/2018-01-22.md) | calibration | arrays | Pending | Pending | Hand-maintained rope cutting is minimum/subtraction, not the classic optimization question. |
| [2018-02-06](../../../src/content/questions/2018-02-06.md) | calibration | stacks-queues, recursion | Pending | Pending | Explicit recursive stack reversal. |
| [2018-07-16](../../../src/content/questions/2018-07-16.md) | evaluation | geometry, math | Pending | Pending | Hand-maintained rectangle tiling. |
| [2019-01-29](../../../src/content/questions/2019-01-29.md) | calibration | matrices, searching, games | Pending | Pending | Boggle; function name validate must not trigger date classification. |
| [2019-07-10](../../../src/content/questions/2019-07-10.md) | evaluation | strings, regex, parsing | Pending | Pending | Implementing a restricted regex matcher. |
| [2020-06-08](../../../src/content/questions/2020-06-08.md) | calibration | bit-manipulation, numbers | Pending | Pending | Count set bits in an integer. |
| [2020-08-17](../../../src/content/questions/2020-08-17.md) | calibration | arrays, two-pointers | Pending | Pending | Move zeros; random integers do not make this a probability question. |
| [2020-11-23](../../../src/content/questions/2020-11-23.md) | evaluation | numbers, math, searching | Pending | Pending | Perfect square with an explicit binary-search hint. |
| [2021-07-12](../../../src/content/questions/2021-07-12.md) | calibration | bit-manipulation, parsing | Pending | Pending | CIDR containment; GraphQL sponsor text is not part of the question. |
| [2021-11-15](../../../src/content/questions/2021-11-15.md) | calibration | regex, strings | Pending | Pending | Explicit regex to locate tokens in source files. |
| [2022-03-07](../../../src/content/questions/2022-03-07.md) | evaluation | hash-maps, data-structures | Pending | Pending | Hashmap implementation with detailed method requirements. |
| [2022-03-14](../../../src/content/questions/2022-03-14.md) | calibration | matrices, games | Pending | Pending | Rotate a Tetris piece represented as a grid. |
| [2022-04-25](../../../src/content/questions/2022-04-25.md) | calibration | arrays, intervals, sorting | Pending | Pending | Merge overlapping intervals. |
| [2022-07-11](../../../src/content/questions/2022-07-11.md) | evaluation | linked-lists | Pending | Pending | Deep-copy a linked list with arbitrary random pointers. |
| [2022-12-05](../../../src/content/questions/2022-12-05.md) | calibration | games, probability, simulation | Pending | Pending | Randomized Catan board with adjacency constraints. |
| [2024-01-22](../../../src/content/questions/2024-01-22.md) | calibration | trees, data-structures | Pending | Pending | Explicit binary-tree data structure and printing. |
| [2024-03-25](../../../src/content/questions/2024-03-25.md) | evaluation | matrices, graphs, searching | Pending | Pending | Grid connectivity; variable called map is not a hash map. |
| [2025-03-03](../../../src/content/questions/2025-03-03.md) | calibration | dates-times, math | Pending | Pending | Weekly compounded discount by calendar dates. |
| [2025-11-24](../../../src/content/questions/2025-11-24.md) | calibration | intervals, sorting, arrays | Pending | Pending | Non-overlapping task scheduling; greedy is absent from the draft vocabulary. |
| [2026-02-16](../../../src/content/questions/2026-02-16.md) | calibration | matrices, arrays | Pending | Pending | Longer code examples; expanding cells into blocks. |
| [2026-10-12](../../../src/content/questions/2026-10-12.md) | calibration | arrays, dynamic-programming | Pending | Pending | Recent non-adjacent reward optimization; Halloween story is incidental. |
| [2026-10-19](../../../src/content/questions/2026-10-19.md) | evaluation | strings, stacks-queues, simulation | Pending | Pending | Recent text editing by delete/duplicate commands. |
| [2026-10-26](../../../src/content/questions/2026-10-26.md) | calibration | arrays, graphs, sorting | Pending | Pending | Recent permutation swaps; shuffled input is deterministic, party story incidental. |

## Usage and latency

Raw provider responses, usage, validation errors, and per-call wall times are recorded in trials.json. Invalid metadata is retained and counted as schema failures. Totals cover recorded responses; provider-billed failed attempts may add cost. No estimated token price is presented as an actual bill.

| Stage | Recorded calls | Schema failures | Input tokens | Output tokens | Total seconds |
| --- | ---: | ---: | ---: | ---: | ---: |
| haiku-combined | 0 | 0 | 0 | 0 | 0.00 |
| clef-topics | 0 | 0 | 0 | 0 | 0.00 |
| haiku-title | 0 | 0 | 0 | 0 | 0.00 |

## Decision

Pending API results and manual review. A provider winner and vocabulary approval must not be inferred from an incomplete comparison.
