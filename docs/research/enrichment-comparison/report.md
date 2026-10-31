# Thirty-Question enrichment comparison

Study: 2026-10-30-v1. Agent-drafted expectations; not human-approved ground truth.

Status: **API calls complete; agent review available; maintainer approval pending**.

Both paths use the same original Question bodies. Haiku generates Title + Topics in one path; the other uses full Clef for Topics and Haiku separately for Title. No production metadata is written.

Reference labels were drafted before API calls and are omitted from every request. They are provisional expectations, not independently established ground truth. The sample deliberately includes historical repairs and misleading keywords; it is not a random estimate of archive-wide accuracy.

Clef threshold: **0.6**, chosen using only the 20 calibration cases; at most three Topics and no forced fallback.

## Held-out Topic metrics

| Path | Precision | Recall | Micro F1 | Forbidden selections |
| --- | ---: | ---: | ---: | ---: |
| haiku-combined | 0.783 | 0.818 | 0.800 | 0 |
| clef-topics | 0.900 | 0.818 | 0.857 | 0 |

Numbers measure agreement with draft reference labels. Review alternative valid labels and all Titles before choosing a pipeline.

## Side-by-side review

| Question | Split | Expected Topics | Haiku combined | Clef + Haiku Title | Review note |
| --- | --- | --- | --- | --- | --- |
| [2017-04-01](../../../src/content/questions/2017-04-01.md) | calibration | numbers, strings | Convert Integers from 1 to 1000 to Roman Numerals — numbers, strings | Convert Integer 1-1000 to Roman Numerals — numbers, strings | Oldest question; Roman numeral conversion. |
| [2017-09-05](../../../src/content/questions/2017-09-05.md) | evaluation | strings, parsing | Word Counter Without Regex or Split Functions — strings, parsing | Word Counter App Without Regex or Split Functions — strings | Explicitly forbids regular expressions and splitting. |
| [2017-10-01](../../../src/content/questions/2017-10-01.md) | calibration | geometry, math | Arm reachability check with joint position — geometry, math | Inverse Kinematics: Can an Arm Reach a Target Point — geometry, math | Hand-maintained inverse kinematics question. |
| [2017-10-09](../../../src/content/questions/2017-10-09.md) | calibration | stacks-queues, data-structures | Implement a queue with push, pop, and peek — stacks-queues, data-structures | Implement a Queue with push, pop, and peek — stacks-queues, data-structures | Hand-maintained queue implementation. |
| [2017-10-16](../../../src/content/questions/2017-10-16.md) | evaluation | arrays, searching | Find Majority Element in Sorted Large Array — arrays, searching | Find Majority Element in Sorted List Efficiently — arrays, searching | Hand-maintained majority in sorted input; sorting is not requested. |
| [2017-10-23](../../../src/content/questions/2017-10-23.md) | calibration | arrays, math | Find x Numbers With Pairwise Differences Divisible by y — arrays, math | Pick x numbers whose pairwise differences divide by y — arrays | Hand-maintained modular differences; avoid confusing with ordinary two-sum. |
| [2017-12-18](../../../src/content/questions/2017-12-18.md) | evaluation | strings | Print a Christmas pine tree with N rows — strings, simulation | Print a Christmas tree of N rows (interview question) — REVIEW: no Topics above threshold | Pine-tree printing; previous week's stack solution contaminates the extracted body. |
| [2018-01-22](../../../src/content/questions/2018-01-22.md) | calibration | arrays | Cut Ropes to the Shortest Length — arrays, math | Rope Cuts: Equalize Rope Lengths to the Shortest — arrays | Hand-maintained rope cutting is minimum/subtraction, not the classic optimization question. |
| [2018-02-06](../../../src/content/questions/2018-02-06.md) | calibration | stacks-queues, recursion | Reverse a Stack Using Recursion — recursion, stacks-queues | Reverse a Stack Using Recursion (isEmpty, push, pop) — recursion, stacks-queues | Explicit recursive stack reversal. |
| [2018-07-16](../../../src/content/questions/2018-07-16.md) | evaluation | geometry, math | Count identical squares fitting in an n by m rectangle — math, geometry | Count Identical Squares Fitting in an n×m Rectangle — math, geometry | Hand-maintained rectangle tiling. |
| [2019-01-29](../../../src/content/questions/2019-01-29.md) | calibration | matrices, searching, games | Validate Word Existence in Letter Grid (Boggle) — matrices, searching, graphs | Word Search in 2D Letter Grid (Boggle-style) — matrices, searching, arrays | Boggle; function name validate must not trigger date classification. |
| [2019-07-10](../../../src/content/questions/2019-07-10.md) | evaluation | strings, regex, parsing | Wildcard and star pattern matching on strings — strings, recursion, dynamic-programming | Regex-Lite Matcher: '.' and '*' Pattern Matching — strings, regex, parsing | Implementing a restricted regex matcher. |
| [2020-06-08](../../../src/content/questions/2020-06-08.md) | calibration | bit-manipulation, numbers | Count the number of 1s in a number's binary form — bit-manipulation, numbers | Count the 1 bits in a number's binary form — bit-manipulation, numbers | Count set bits in an integer. |
| [2020-08-17](../../../src/content/questions/2020-08-17.md) | calibration | arrays, two-pointers | Move all zeros to the end of an array in O(n) — arrays, two-pointers | Move Zeros to End of Array in O(n) Time — arrays, two-pointers | Move zeros; random integers do not make this a probability question. |
| [2020-11-23](../../../src/content/questions/2020-11-23.md) | evaluation | numbers, math, searching | Perfect Square Check Without Built-in sqrt — numbers, math, searching | Check If a Positive Integer Is a Perfect Square — searching, numbers, math | Perfect square with an explicit binary-search hint. |
| [2021-07-12](../../../src/content/questions/2021-07-12.md) | calibration | bit-manipulation, parsing | IPv4 Address Within CIDR Netmask Range Check — parsing, numbers, bit-manipulation | Check if IPv4 Address Is in CIDR Range — parsing | CIDR containment; GraphQL sponsor text is not part of the question. |
| [2021-11-15](../../../src/content/questions/2021-11-15.md) | calibration | regex, strings | Regex search for private keys and tokens in JS files — regex, strings, parsing | Regex Search for Private Keys and Tokens in JS Files — regex, searching, strings | Explicit regex to locate tokens in source files. |
| [2022-03-07](../../../src/content/questions/2022-03-07.md) | evaluation | hash-maps, data-structures | Implement a hashmap from scratch without libraries — hash-maps, data-structures | Implement a Hashmap from Scratch — hash-maps, data-structures | Hashmap implementation with detailed method requirements. |
| [2022-03-14](../../../src/content/questions/2022-03-14.md) | calibration | matrices, games | Rotate a Tetromino Block in a Matrix — matrices, simulation | Rotate a Tetris Block in a Matrix — matrices | Rotate a Tetris piece represented as a grid. |
| [2022-04-25](../../../src/content/questions/2022-04-25.md) | calibration | arrays, intervals, sorting | Merge Overlapping Intervals — intervals, arrays, sorting | Merge Overlapping Intervals in an Array — intervals, arrays | Merge overlapping intervals. |
| [2022-07-11](../../../src/content/questions/2022-07-11.md) | evaluation | linked-lists | Deep Copy of Linked List with Random Pointers — linked-lists, hash-maps | Deep Copy of Linked List with Random Pointers — linked-lists | Deep-copy a linked list with arbitrary random pointers. |
| [2022-12-05](../../../src/content/questions/2022-12-05.md) | calibration | games, probability, simulation | Randomized Catan board with 6s and 8s not adjacent — matrices, probability, games | Randomized Catan Board with No Adjacent 6s and 8s — probability, graphs, games | Randomized Catan board with adjacency constraints. |
| [2024-01-22](../../../src/content/questions/2024-01-22.md) | calibration | trees, data-structures | Binary tree data structure and tree printing function — trees, data-structures, strings | Binary Tree Data Structure and Tree Printing Function — trees, data-structures | Explicit binary-tree data structure and printing. |
| [2024-03-25](../../../src/content/questions/2024-03-25.md) | evaluation | matrices, graphs, searching | Largest Island in a 2D Grid of 0s and 1s — matrices, graphs | Largest Island Size in a 2D Grid of 0s and 1s — matrices, arrays, graphs | Grid connectivity; variable called map is not a hash map. |
| [2025-03-03](../../../src/content/questions/2025-03-03.md) | calibration | dates-times, math | Calculate product price after weekly 10% discounts — dates-times, math | Store Closing Sale: Weekly 10% Discount Price Calculation — dates-times, math | Weekly compounded discount by calendar dates. |
| [2025-11-24](../../../src/content/questions/2025-11-24.md) | calibration | intervals, sorting, arrays | Maximum Non-Overlapping Meal Prep Tasks — intervals, sorting | Max Non-Overlapping Thanksgiving Meal Prep Tasks — intervals, arrays | Non-overlapping task scheduling; greedy is absent from the draft vocabulary. |
| [2026-02-16](../../../src/content/questions/2026-02-16.md) | calibration | matrices, arrays | Zoom a 2D grid by an integer factor k — arrays, matrices | Zoom a 2D Grid by Integer Factor k — matrices, arrays | Longer code examples; expanding cells into blocks. |
| [2026-10-12](../../../src/content/questions/2026-10-12.md) | calibration | arrays, dynamic-programming | Maximum candy from non-adjacent houses — arrays, dynamic-programming | Maximum Candy from Non-Adjacent Houses — dynamic-programming, arrays | Recent non-adjacent reward optimization; Halloween story is incidental. |
| [2026-10-19](../../../src/content/questions/2026-10-19.md) | evaluation | strings, stacks-queues, simulation | Ghostwriter: Apply # and ~ Edits to a String — strings, parsing, simulation | Ghostwriter: Apply # Delete and ~ Duplicate to a String — strings, parsing, simulation | Recent text editing by delete/duplicate commands. |
| [2026-10-26](../../../src/content/questions/2026-10-26.md) | calibration | arrays, graphs, sorting | Halloween Costume Swap: Minimum Swaps to Fix Permutation — arrays, graphs | Minimum Swaps to Restore Halloween Costume Ownership — arrays, graphs | Recent permutation swaps; shuffled input is deterministic, party story incidental. |

## Usage and latency

Raw provider responses, usage, validation errors, and per-call wall times are recorded in trials.json. Invalid metadata is retained and counted as schema failures. Totals cover recorded responses; provider-billed failed attempts may add cost. No estimated token price is presented as an actual bill.

| Stage | Recorded calls | Schema failures | Input tokens | Output tokens | Total seconds |
| --- | ---: | ---: | ---: | ---: | ---: |
| haiku-combined | 30 | 0 | 52978 | 1200 | 34.59 |
| clef-topics | 30 | 0 | 99072 | 0 | 16.93 |
| haiku-title | 30 | 0 | 15058 | 856 | 30.49 |

## Decision

Read [the review](review.md) for the provisional recommendation, concrete disagreements, Title assessment, and limitations. The vocabulary and production integration still need a maintainer decision.
