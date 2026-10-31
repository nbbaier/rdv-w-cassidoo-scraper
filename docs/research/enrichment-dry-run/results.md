# Full-corpus enrichment dry run

Completed: 2026-10-31T18:38:54.398Z. Vocabulary: `2026-10-31-centrality-v1`. Threshold: **0.6 (provisional)**. Dry run: **true**.

Processed 480; proposed metadata additions 480; skipped 0; review 150; failed 0; written 0. Review and failure counts overlap with proposed additions: a valid Title may still be proposed when Topics abstain or fail.

The centrality policy is approved: subjects and data structures central to the Question, plus techniques explicitly requested or central rather than merely possible. At most three Topics; no forced fallback. The 26 definitions in src/topics.ts and operating threshold remain subject to the backfill review. Historical evaluation inputs and labels remain unchanged. These scores are model outputs, not calibrated probabilities of correctness or measured archive-wide accuracy.

The companion JSON retains every Question ID, source/body hashes, proposed Title, all 26 scores, selected Topics, field cache keys, timestamps, usage, retries, and review/failure reasons. Raw successful responses remain in the ignored local response cache. Re-running uses that cache; changing the threshold does not repeat inference.

## Topic distribution

| Topic | Questions |
| --- | ---: |
| arrays | 186 |
| bit-manipulation | 6 |
| data-structures | 25 |
| dates-times | 14 |
| dynamic-programming | 8 |
| games | 20 |
| geometry | 17 |
| graphs | 12 |
| hash-maps | 3 |
| intervals | 9 |
| linked-lists | 5 |
| math | 83 |
| matrices | 35 |
| numbers | 47 |
| parsing | 31 |
| probability | 4 |
| recursion | 3 |
| regex | 3 |
| searching | 22 |
| simulation | 22 |
| sliding-window | 7 |
| sorting | 26 |
| stacks-queues | 20 |
| strings | 134 |
| trees | 3 |
| two-pointers | 0 |

## Threshold sensitivity

Computed from the same stored scores, without new requests. More-than-three counts are before capping; ambiguous means the third/fourth qualifying scores differ by at most 0.05. Near-threshold means any score is within 0.05 of the threshold. These flags expose review candidates rather than asserting bad assignments.

| Threshold | Zero Topics | >3 qualifying | Near threshold | Ambiguous third | Total selected Topics |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 0.5 | 28 | 22 | 134 | 6 | 856 |
| 0.6 | 44 | 11 | 109 | 4 | 745 |
| 0.7 | 70 | 3 | 129 | 3 | 605 |
| 0.8 | 127 | 0 | 131 | 0 | 452 |
| 0.9 | 225 | 0 | 229 | 0 | 283 |

## Review cases

| Question | Proposed Title | Selected Topics | Reason |
| --- | --- | --- | --- |
| [2017-04-21](../../../src/content/questions/2017-04-21.md) | Go board data structure and piece placement | data-structures, games, matrices | more-than-three-qualify, near-threshold |
| [2017-05-07](../../../src/content/questions/2017-05-07.md) | Sort a stack: smallest vs largest on top | stacks-queues, sorting | near-threshold |
| [2017-05-20](../../../src/content/questions/2017-05-20.md) | Rotate an array by n places | arrays | near-threshold |
| [2017-05-29](../../../src/content/questions/2017-05-29.md) | Menu item combinations within a wallet budget | absent | zero-topics |
| [2017-06-17](../../../src/content/questions/2017-06-17.md) | Print n rows of Pascal's Triangle | math | near-threshold |
| [2017-07-01](../../../src/content/questions/2017-07-01.md) | Design a weather app: endpoints, UI, polling, and tech | absent | zero-topics |
| [2017-07-10](../../../src/content/questions/2017-07-10.md) | Fraction of positive, negative, and zero integers | arrays, math | near-threshold |
| [2017-07-24](../../../src/content/questions/2017-07-24.md) | Hangman game functions and data structures | games, strings, data-structures | more-than-three-qualify, near-threshold |
| [2017-07-31](../../../src/content/questions/2017-07-31.md) | Median of multiple sorted integer arrays | arrays, searching | near-threshold |
| [2017-08-11](../../../src/content/questions/2017-08-11.md) | Menu combinations within a budget | absent | zero-topics |
| [2017-08-19](../../../src/content/questions/2017-08-19.md) | Print asterisk exactly 20 times with one character change | absent | zero-topics |
| [2017-09-18](../../../src/content/questions/2017-09-18.md) | Minimum people bothered leaving a movie theater seat | matrices, math | near-threshold |
| [2017-10-01](../../../src/content/questions/2017-10-01.md) | Inverse kinematics: reachable arm target | geometry | near-threshold |
| [2017-10-23](../../../src/content/questions/2017-10-23.md) | Pick x numbers with pairwise differences divisible by y | arrays, math | near-threshold |
| [2017-10-30](../../../src/content/questions/2017-10-30.md) | Curried multiply function in JavaScript | absent | zero-topics |
| [2017-11-06](../../../src/content/questions/2017-11-06.md) | Addg: sum until empty invocation | absent | zero-topics |
| [2017-11-20](../../../src/content/questions/2017-11-20.md) | Split text file into sentences and words 2D array | arrays, strings, parsing | more-than-three-qualify, near-threshold |
| [2017-11-27](../../../src/content/questions/2017-11-27.md) | Find the unique number in a list of duplicates | arrays | near-threshold |
| [2017-12-11](../../../src/content/questions/2017-12-11.md) | Sort a stack of integers using another stack | stacks-queues, sorting | near-threshold |
| [2017-12-18](../../../src/content/questions/2017-12-18.md) | Print a christmas tree with N rows | absent | zero-topics |
| [2018-01-15](../../../src/content/questions/2018-01-15.md) | Rectangle from four given side lengths | absent | zero-topics |
| [2018-01-30](../../../src/content/questions/2018-01-30.md) | Print a Fibonacci triangle | math | near-threshold |
| [2018-02-06](../../../src/content/questions/2018-02-06.md) | Reverse a stack using recursion | stacks-queues, recursion | near-threshold |
| [2018-02-12](../../../src/content/questions/2018-02-12.md) | Max of first array times min of second | arrays, searching | near-threshold |
| [2018-03-06](../../../src/content/questions/2018-03-06.md) | Visualize the ISS's current location | absent | zero-topics |
| [2018-03-12](../../../src/content/questions/2018-03-12.md) | Rectangle overlap area | geometry | near-threshold |
| [2018-03-26](../../../src/content/questions/2018-03-26.md) | Reverse the diagonals of a square matrix | matrices, arrays | near-threshold |
| [2018-07-05](../../../src/content/questions/2018-07-05.md) | Longest number in a string | strings, parsing | near-threshold |
| [2018-07-10](../../../src/content/questions/2018-07-10.md) | Print all subsets of a set | absent | zero-topics |
| [2018-08-27](../../../src/content/questions/2018-08-27.md) | Find a path through a 2D maze with backtracking | matrices, searching, graphs | near-threshold |
| [2018-09-06](../../../src/content/questions/2018-09-06.md) | Contributing to open source despite misused projects | absent | zero-topics |
| [2018-10-22](../../../src/content/questions/2018-10-22.md) | Numbers below n that are products of distinct primes | math, numbers, arrays | near-threshold |
| [2018-10-29](../../../src/content/questions/2018-10-29.md) | Find all pairs summing to a target | absent | zero-topics |
| [2018-11-07](../../../src/content/questions/2018-11-07.md) | Balanced digit frequency in a number | numbers, math | near-threshold |
| [2018-12-03](../../../src/content/questions/2018-12-03.md) | CSS centering and edge-positioning utility classes | absent | zero-topics |
| [2019-01-07](../../../src/content/questions/2019-01-07.md) | Pointers with inherited and abstract classes | absent | zero-topics |
| [2019-01-29](../../../src/content/questions/2019-01-29.md) | Boggle word search in a letter grid | matrices, arrays, searching | more-than-three-qualify, ambiguous-third-topic |
| [2019-02-05](../../../src/content/questions/2019-02-05.md) | Explaining functional vs object-oriented programming | absent | zero-topics |
| [2019-02-13](../../../src/content/questions/2019-02-13.md) | Minimum insertions to make a string a palindrome | strings | near-threshold |
| [2019-02-20](../../../src/content/questions/2019-02-20.md) | First index to remove for an odd sum | arrays | near-threshold |
| [2019-05-01](../../../src/content/questions/2019-05-01.md) | Click outside detector | absent | zero-topics |
| [2019-06-12](../../../src/content/questions/2019-06-12.md) | Convert hex color codes to RGB | absent | zero-topics, near-threshold |
| [2019-06-25](../../../src/content/questions/2019-06-25.md) | High-level vs low-level programming languages | absent | zero-topics |
| [2019-08-08](../../../src/content/questions/2019-08-08.md) | Validate triangle side lengths | math | near-threshold |
| [2019-11-11](../../../src/content/questions/2019-11-11.md) | Implement basic logic gates in a program | absent | zero-topics |
| [2019-11-25](../../../src/content/questions/2019-11-25.md) | Implement rock, paper, scissors | games, simulation | near-threshold |
| [2019-12-02](../../../src/content/questions/2019-12-02.md) | Day of week with offset | absent | zero-topics, near-threshold |
| [2019-12-16](../../../src/content/questions/2019-12-16.md) | Generate binary numbers 1 to N with a queue | stacks-queues, bit-manipulation, numbers | near-threshold |
| [2019-12-23](../../../src/content/questions/2019-12-23.md) | Build the game Snake | games, simulation | near-threshold |
| [2020-02-10](../../../src/content/questions/2020-02-10.md) | Point inside triangle check | geometry, arrays | near-threshold |
| [2020-03-09](../../../src/content/questions/2020-03-09.md) | Mean, median, and mode of an integer array | arrays, math | near-threshold |
| [2020-03-16](../../../src/content/questions/2020-03-16.md) | Build with a free COVID-19 API | absent | zero-topics |
| [2020-03-24](../../../src/content/questions/2020-03-24.md) | Compress sorted characters in-place | arrays, strings | near-threshold |
| [2020-03-31](../../../src/content/questions/2020-03-31.md) | Broken calculator minimum operations | absent | zero-topics, near-threshold |
| [2020-04-06](../../../src/content/questions/2020-04-06.md) | Compare strings with backspace characters | strings, parsing, simulation | near-threshold |
| [2020-04-27](../../../src/content/questions/2020-04-27.md) | Implement a circular queue | data-structures, stacks-queues | near-threshold |
| [2020-05-25](../../../src/content/questions/2020-05-25.md) | Simple text editor with append, delete, and undo | strings, data-structures | near-threshold |
| [2020-06-01](../../../src/content/questions/2020-06-01.md) | Check if a number is a power of two | math, numbers | near-threshold |
| [2020-07-06](../../../src/content/questions/2020-07-06.md) | Draggable button that changes background color with distance | absent | zero-topics |
| [2020-07-27](../../../src/content/questions/2020-07-27.md) | Generate valid IPv4 addresses from digit string | strings, parsing, numbers | near-threshold |
| [2020-08-10](../../../src/content/questions/2020-08-10.md) | Arranging lions, tigers, leopards, and panthers | math, dynamic-programming | near-threshold |
| [2020-11-02](../../../src/content/questions/2020-11-02.md) | Jump to the end without hitting obstacles | arrays | near-threshold |
| [2020-11-09](../../../src/content/questions/2020-11-09.md) | Counting playlists with song repeat constraints | dynamic-programming | near-threshold |
| [2020-12-14](../../../src/content/questions/2020-12-14.md) | Remove folder from filesystem list | arrays | near-threshold |
| [2021-03-01](../../../src/content/questions/2021-03-01.md) | Paint cans needed for a room | geometry, math | near-threshold |
| [2021-03-08](../../../src/content/questions/2021-03-08.md) | Valid tic-tac-toe board position check | games, matrices, arrays | near-threshold |
| [2021-03-29](../../../src/content/questions/2021-03-29.md) | Validate a numeric string | strings, parsing, numbers | near-threshold |
| [2021-04-19](../../../src/content/questions/2021-04-19.md) | Move zeroes to end of array | arrays | near-threshold |
| [2021-04-26](../../../src/content/questions/2021-04-26.md) | Rotate brackets into a balanced string | strings | near-threshold |
| [2021-05-24](../../../src/content/questions/2021-05-24.md) | Two-player Connect Four with win detection | games, matrices, arrays | more-than-three-qualify, ambiguous-third-topic |
| [2021-06-07](../../../src/content/questions/2021-06-07.md) | Product of three numbers with duplicates excluded | absent | zero-topics |
| [2021-06-14](../../../src/content/questions/2021-06-14.md) | Print an asterisk arrow in a direction | absent | zero-topics |
| [2021-06-21](../../../src/content/questions/2021-06-21.md) | Draw an ASCII art cube of height x | absent | zero-topics |
| [2021-06-28](../../../src/content/questions/2021-06-28.md) | Design a Pride flag in any medium | absent | zero-topics |
| [2021-07-12](../../../src/content/questions/2021-07-12.md) | Check if IPv4 address is in CIDR range | parsing | near-threshold |
| [2021-07-26](../../../src/content/questions/2021-07-26.md) | Trailing zeros in factorial | math, numbers | near-threshold |
| [2021-08-23](../../../src/content/questions/2021-08-23.md) | Finding top GitHub repos using navigator.sendBeacon | absent | zero-topics |
| [2021-09-13](../../../src/content/questions/2021-09-13.md) | Generate well-formed parentheses combinations | strings | near-threshold |
| [2021-10-11](../../../src/content/questions/2021-10-11.md) | Odious number check in binary | bit-manipulation, numbers, math | near-threshold |
| [2021-11-01](../../../src/content/questions/2021-11-01.md) | Finding GitHub repos depending on React ^17.0.2 | absent | zero-topics |
| [2021-11-08](../../../src/content/questions/2021-11-08.md) | Find local peak indices in an integer array | arrays, searching | near-threshold |
| [2021-12-06](../../../src/content/questions/2021-12-06.md) | Wrapping paper order for boxes | geometry, math | near-threshold |
| [2021-12-13](../../../src/content/questions/2021-12-13.md) | Generate a Christmas tree from an integer height | absent | zero-topics, near-threshold |
| [2021-12-27](../../../src/content/questions/2021-12-27.md) | Fireworks firing order with no repeated colors | arrays, sorting | near-threshold |
| [2022-01-03](../../../src/content/questions/2022-01-03.md) | Shortest path between connected points | graphs, arrays | near-threshold |
| [2022-01-17](../../../src/content/questions/2022-01-17.md) | Wordle guess emoji feedback function | strings, games | near-threshold |
| [2022-02-07](../../../src/content/questions/2022-02-07.md) | Word search in a 2D letter grid | matrices, arrays, searching | more-than-three-qualify, near-threshold |
| [2022-02-14](../../../src/content/questions/2022-02-14.md) | Keyboard remote control word typing function | matrices, strings, simulation | near-threshold |
| [2022-03-21](../../../src/content/questions/2022-03-21.md) | Smallest interval between times in a list | dates-times, arrays, intervals | near-threshold |
| [2022-05-09](../../../src/content/questions/2022-05-09.md) | Splitting vacation expenses among friends | absent | zero-topics |
| [2022-05-23](../../../src/content/questions/2022-05-23.md) | Shortest path from start to end in grid with walls | matrices, searching, graphs | more-than-three-qualify, near-threshold |
| [2022-06-20](../../../src/content/questions/2022-06-20.md) | Previous Fibonacci number or -1 | math | near-threshold |
| [2022-07-04](../../../src/content/questions/2022-07-04.md) | Rummikub tray and valid sets functions | games | near-threshold |
| [2022-07-18](../../../src/content/questions/2022-07-18.md) | Hide email local part with asterisks | strings, parsing | near-threshold |
| [2022-07-25](../../../src/content/questions/2022-07-25.md) | Find array intersection indices | arrays, linked-lists, searching | near-threshold |
| [2022-09-05](../../../src/content/questions/2022-09-05.md) | Generator function for a numeric range | absent | zero-topics |
| [2022-09-19](../../../src/content/questions/2022-09-19.md) | Calculate GPA from letter grades | absent | zero-topics |
| [2022-09-26](../../../src/content/questions/2022-09-26.md) | Ordinal suffix concatenation function | numbers, strings, math | near-threshold |
| [2022-10-03](../../../src/content/questions/2022-10-03.md) | Fibonacci-like sequence generator with extra credit | arrays, math | near-threshold |
| [2022-10-17](../../../src/content/questions/2022-10-17.md) | Toggling doors across multiple passes | simulation, math | near-threshold |
| [2022-10-31](../../../src/content/questions/2022-10-31.md) | Print ASCII printable characters without built-ins | strings | near-threshold |
| [2022-12-12](../../../src/content/questions/2022-12-12.md) | Sum of integers within a rectangle in a 2D array | matrices, arrays, geometry | near-threshold |
| [2023-01-16](../../../src/content/questions/2023-01-16.md) | Spin the wheel betting game | games, simulation, probability | near-threshold |
| [2023-02-13](../../../src/content/questions/2023-02-13.md) | Print 0 to 100 without digits 1-9 | absent | zero-topics |
| [2023-03-20](../../../src/content/questions/2023-03-20.md) | Convert colors between HEX, RGB, and HSL | absent | zero-topics, near-threshold |
| [2023-04-03](../../../src/content/questions/2023-04-03.md) | Self-describing source length in English words | strings | near-threshold |
| [2023-05-22](../../../src/content/questions/2023-05-22.md) | Scrabble word score calculator | strings, games | near-threshold |
| [2023-06-19](../../../src/content/questions/2023-06-19.md) | Maximum depth of JSON data | absent | zero-topics |
| [2023-09-25](../../../src/content/questions/2023-09-25.md) | Pokémon type matchup function | absent | zero-topics |
| [2023-10-02](../../../src/content/questions/2023-10-02.md) | Insert operators to reach target | numbers, math | near-threshold |
| [2023-10-09](../../../src/content/questions/2023-10-09.md) | Convert English number words to integer | parsing, strings, numbers | near-threshold |
| [2024-01-08](../../../src/content/questions/2024-01-08.md) | Count possible letter sequences from an array | arrays, strings, math | near-threshold |
| [2024-02-05](../../../src/content/questions/2024-02-05.md) | ASCII honeycomb shape generator | absent | zero-topics, near-threshold |
| [2024-02-12](../../../src/content/questions/2024-02-12.md) | Generator that yields values in a range | absent | zero-topics |
| [2024-03-04](../../../src/content/questions/2024-03-04.md) | Pomodoro timer with start, pause, and resume | simulation, dates-times | near-threshold |
| [2024-04-01](../../../src/content/questions/2024-04-01.md) | Sum numbers without repeated digits | arrays, numbers | near-threshold |
| [2024-04-22](../../../src/content/questions/2024-04-22.md) | Print an asterisk arrow by direction | absent | zero-topics |
| [2024-07-29](../../../src/content/questions/2024-07-29.md) | Convert metric and imperial units | math | near-threshold |
| [2024-09-16](../../../src/content/questions/2024-09-16.md) | Count scoring combinations in american football | dynamic-programming, math | near-threshold |
| [2024-09-23](../../../src/content/questions/2024-09-23.md) | Minimum laundry loads for sorting clothing | arrays | near-threshold |
| [2024-10-14](../../../src/content/questions/2024-10-14.md) | Generate SVG circle string from radius, center, color | strings | near-threshold |
| [2024-12-16](../../../src/content/questions/2024-12-16.md) | White elephant gift exchange game simulator class | games, simulation, data-structures | more-than-three-qualify, ambiguous-third-topic |
| [2025-01-27](../../../src/content/questions/2025-01-27.md) | Find all anagram start indices in a string | strings, sliding-window, arrays | more-than-three-qualify |
| [2025-02-03](../../../src/content/questions/2025-02-03.md) | Evaluate a postfix expression | parsing, stacks-queues, strings | near-threshold |
| [2025-03-03](../../../src/content/questions/2025-03-03.md) | Store closing price discount calculator | dates-times, math | near-threshold |
| [2025-03-17](../../../src/content/questions/2025-03-17.md) | Cribbage hand scoring function | absent | zero-topics |
| [2025-05-12](../../../src/content/questions/2025-05-12.md) | Insert operators to reach target value | numbers, math | near-threshold |
| [2025-05-19](../../../src/content/questions/2025-05-19.md) | Draw an ASCII art cube of height n | absent | zero-topics |
| [2025-06-16](../../../src/content/questions/2025-06-16.md) | Sorting monarchs by name and Roman numeral | arrays, sorting, strings | near-threshold |
| [2025-07-07](../../../src/content/questions/2025-07-07.md) | Grand finale subarray start index | arrays | near-threshold |
| [2025-07-14](../../../src/content/questions/2025-07-14.md) | Vim cursor navigation over multi-line string | simulation, strings, parsing | more-than-three-qualify, near-threshold, ambiguous-third-topic |
| [2025-07-21](../../../src/content/questions/2025-07-21.md) | Minimum keyboard assembly time with arrival delays | absent | zero-topics, near-threshold |
| [2025-09-01](../../../src/content/questions/2025-09-01.md) | Count battleships on a 2D grid | matrices, games | near-threshold |
| [2025-10-06](../../../src/content/questions/2025-10-06.md) | Group component edits into changelog entries | arrays, intervals | near-threshold |
| [2025-11-03](../../../src/content/questions/2025-11-03.md) | Knight moves on an 8x8 chessboard | matrices, games | near-threshold |
| [2025-11-10](../../../src/content/questions/2025-11-10.md) | Merge sorted arrays in place | arrays, sorting | near-threshold |
| [2025-12-15](../../../src/content/questions/2025-12-15.md) | Generate a Latin square of size n | matrices, math | near-threshold |
| [2025-12-29](../../../src/content/questions/2025-12-29.md) | Replace repeated digit runs with their length | strings | near-threshold |
| [2026-01-12](../../../src/content/questions/2026-01-12.md) | Hungry bears above forest average | arrays, sorting | near-threshold |
| [2026-01-19](../../../src/content/questions/2026-01-19.md) | Konami code substring mapping in strings | strings, sliding-window | near-threshold |
| [2026-04-06](../../../src/content/questions/2026-04-06.md) | Perrin number combinations summing to target | absent | zero-topics |
| [2026-05-04](../../../src/content/questions/2026-05-04.md) | Longest coprime adjacent subsequence | arrays, math | near-threshold |
| [2026-06-15](../../../src/content/questions/2026-06-15.md) | Maximum distinct positive integers summing to n | math, numbers | near-threshold |
| [2026-06-22](../../../src/content/questions/2026-06-22.md) | Auto-reply for unavailable date ranges with overrides | intervals, dates-times, arrays | near-threshold |
| [2026-07-27](../../../src/content/questions/2026-07-27.md) | Fulfilled ice cream orders before first failure | arrays, hash-maps | near-threshold |
| [2026-08-24](../../../src/content/questions/2026-08-24.md) | Partition array: odd, even, then zeros | arrays | near-threshold |
| [2026-09-07](../../../src/content/questions/2026-09-07.md) | Minimum moves to unlock a backpack code | strings, numbers | near-threshold |
| [2026-10-05](../../../src/content/questions/2026-10-05.md) | Zombie grid infection spread time | matrices, arrays, graphs | more-than-three-qualify, near-threshold |
| [2026-10-19](../../../src/content/questions/2026-10-19.md) | Ghost keyboard: apply # and ~ to typed text | strings, parsing, simulation | near-threshold |
| [2026-10-26](../../../src/content/questions/2026-10-26.md) | Minimum swaps to restore shuffled Halloween costumes | arrays | near-threshold |

## Failures

None.

## Provider usage

Returned usage covers successful recorded responses, including cache hits; it is not an invoice or a count of fresh calls in this invocation.

| Field | Recorded | Cache hits | Retried requests | Input tokens (incl. cache) | Output tokens |
| --- | ---: | ---: | ---: | ---: | ---: |
| title | 480 | 480 | 0 | 235836 | 9954 |
| topics | 480 | 480 | 0 | 2111511 | 0 |

## Checkpoint

Review the candidate vocabulary, Title faithfulness, distribution, zero-Topic/ambiguous cases, and threshold before approving a write backfill. A full write backfill and weekly activation remain unapproved. CI credentials have not been verified. No deployment is part of this work.
