/** Candidate vocabulary under the approved centrality policy; threshold/backfill review pending. */
export const TOPIC_REVISION = "2026-10-31-centrality-v1";

export const TOPIC_POLICY =
  "Include subjects and data structures central to the Question. Include algorithmic techniques when explicitly requested or central, rather than merely one possible solution. Select up to three Topics and report low-confidence cases for review.";

export const TOPIC_DEFINITIONS = {
  arrays: "Arrays, lists, sequences, or subarrays are central to the task.",
  "bit-manipulation":
    "Binary representations or bit-level operations are central; binary search alone does not qualify.",
  "data-structures":
    "Designing or implementing a data structure is explicitly requested; merely receiving an array or string is insufficient.",
  "dates-times":
    "Calendar dates, clocks, durations, or time calculations are central; identifiers containing a date are insufficient.",
  "dynamic-programming":
    "Dynamic programming is explicitly requested or central to the Question, rather than merely one possible solution to an optimization task.",
  games:
    "Rules or state of an actual game are central; a seasonal story alone is insufficient.",
  geometry:
    "Shapes, coordinates, distances, spatial relations, or geometric measurement are central.",
  graphs:
    "Vertices, edges, connectivity, or cycle structure is central, including implicit graphs when intrinsic to the task.",
  "hash-maps":
    "Maps, dictionaries, keyed lookup, or implementing a hash map are central subjects; a possible frequency-counting solution alone is insufficient.",
  intervals:
    "Ranges, time spans, interval merging, or overlap between intervals is central.",
  "linked-lists":
    "Linked nodes, list pointers, or linked-list operations are central.",
  math: "Arithmetic, algebra, number theory, combinatorics, or a mathematical relation is central.",
  matrices:
    "A two-dimensional array, board, or grid and its cell relationships are central.",
  numbers:
    "Integer digits, representations, or numeric properties are central; merely using numeric values is insufficient.",
  parsing:
    "Interpreting syntax, commands, encoded notation, or a structured textual format is central.",
  probability:
    "Probability, random sampling, or randomized generation is central; the word random in a pointer or input description alone is insufficient.",
  recursion:
    "Recursion is explicitly requested or fundamental to the task; one possible recursive solution alone is insufficient.",
  regex:
    "Regular expressions or regex matching are explicitly required or offered as a task variant; a prohibition on regex does not qualify.",
  searching:
    "Finding a target, match, path, or boundary in a collection or search space is central.",
  simulation:
    "Modeling a sequence of state changes under explicit rules is central.",
  "sliding-window":
    "Maintaining a contiguous moving window is a defining feature of the task.",
  sorting:
    "Ordering or reordering data is a central requested operation; already sorted input alone is insufficient.",
  "stacks-queues":
    "Stack or queue semantics, LIFO/FIFO behavior, or implementing these structures is central.",
  strings: "Processing, transforming, or comparing textual strings is central.",
  trees:
    "A tree data structure or hierarchy of nodes is central; printing a pine-tree shape alone is insufficient.",
  "two-pointers":
    "Coordinated pointer or index movement is a defining technique for the task, rather than an incidental possible implementation.",
} as const;

export type Topic = keyof typeof TOPIC_DEFINITIONS;
export const TOPIC_IDS = Object.keys(TOPIC_DEFINITIONS) as [Topic, ...Topic[]];

const LINE_BREAK = /[\r\n]/u;

export function validTitle(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim() === value &&
    value.length > 0 &&
    value.length <= 60 &&
    !LINE_BREAK.test(value)
  );
}

export function validTopics(value: unknown): value is Topic[] {
  return (
    Array.isArray(value) &&
    value.length >= 1 &&
    value.length <= 3 &&
    new Set(value).size === value.length &&
    value.every(
      (item) =>
        typeof item === "string" && Object.hasOwn(TOPIC_DEFINITIONS, item)
    )
  );
}
