/**
 * Builds realistic problem catalogue for LeetCode and HackerRank practice tracking.
 * Features industry-standard coding interview problems across fundamental topics.
 */
import { PROBLEM_ID_PAD_LENGTH } from '../../config/constants';
import type { Difficulty, PlatformCode, Problem } from '../../types/domain';

export const PROBLEM_TOPICS: readonly string[] = [
  'Arrays',
  'Strings',
  'Hash Table',
  'Linked List',
  'Stack',
  'Queue',
  'Binary Search',
  'Trees',
  'Graphs',
  'Dynamic Programming',
  'Greedy',
  'Backtracking',
  'Math',
  'Sorting',
  'Two Pointers',
  'Sliding Window',
];

const LEETCODE_TITLES: readonly { title: string; topic: string; diff: Difficulty }[] = [
  { title: 'Two Sum', topic: 'Arrays', diff: 'Easy' },
  { title: 'Add Two Numbers', topic: 'Linked List', diff: 'Medium' },
  { title: 'Longest Substring Without Repeating Characters', topic: 'Sliding Window', diff: 'Medium' },
  { title: 'Median of Two Sorted Arrays', topic: 'Binary Search', diff: 'Hard' },
  { title: 'Longest Palindromic Substring', topic: 'Dynamic Programming', diff: 'Medium' },
  { title: 'Container With Most Water', topic: 'Two Pointers', diff: 'Medium' },
  { title: '3Sum', topic: 'Two Pointers', diff: 'Medium' },
  { title: 'Valid Parentheses', topic: 'Stack', diff: 'Easy' },
  { title: 'Merge Two Sorted Lists', topic: 'Linked List', diff: 'Easy' },
  { title: 'Generate Parentheses', topic: 'Backtracking', diff: 'Medium' },
  { title: 'Merge k Sorted Lists', topic: 'Linked List', diff: 'Hard' },
  { title: 'Search in Rotated Sorted Array', topic: 'Binary Search', diff: 'Medium' },
  { title: 'Trapping Rain Water', topic: 'Two Pointers', diff: 'Hard' },
  { title: 'Permutations', topic: 'Backtracking', diff: 'Medium' },
  { title: 'Maximum Subarray', topic: 'Dynamic Programming', diff: 'Medium' },
  { title: 'Spiral Matrix', topic: 'Arrays', diff: 'Medium' },
  { title: 'Jump Game', topic: 'Greedy', diff: 'Medium' },
  { title: 'Merge Intervals', topic: 'Sorting', diff: 'Medium' },
  { title: 'Climbing Stairs', topic: 'Dynamic Programming', diff: 'Easy' },
  { title: 'Binary Tree Inorder Traversal', topic: 'Trees', diff: 'Easy' },
  { title: 'Symmetric Tree', topic: 'Trees', diff: 'Easy' },
  { title: 'Binary Tree Level Order Traversal', topic: 'Trees', diff: 'Medium' },
  { title: 'Maximum Depth of Binary Tree', topic: 'Trees', diff: 'Easy' },
  { title: 'Best Time to Buy and Sell Stock', topic: 'Arrays', diff: 'Easy' },
  { title: 'Binary Tree Maximum Path Sum', topic: 'Trees', diff: 'Hard' },
  { title: 'Valid Palindrome', topic: 'Two Pointers', diff: 'Easy' },
  { title: 'Word Break', topic: 'Dynamic Programming', diff: 'Medium' },
  { title: 'Linked List Cycle', topic: 'Linked List', diff: 'Easy' },
  { title: 'LRU Cache', topic: 'Hash Table', diff: 'Medium' },
  { title: 'Min Stack', topic: 'Stack', diff: 'Medium' },
  { title: 'Number of Islands', topic: 'Graphs', diff: 'Medium' },
  { title: 'Course Schedule', topic: 'Graphs', diff: 'Medium' },
  { title: 'Kth Largest Element in an Array', topic: 'Sorting', diff: 'Medium' },
  { title: 'Lowest Common Ancestor of a Binary Tree', topic: 'Trees', diff: 'Medium' },
  { title: 'Product of Array Except Self', topic: 'Arrays', diff: 'Medium' },
  { title: 'Coin Change', topic: 'Dynamic Programming', diff: 'Medium' },
  { title: 'Longest Increasing Subsequence', topic: 'Dynamic Programming', diff: 'Medium' },
  { title: 'Alien Dictionary', topic: 'Graphs', diff: 'Hard' },
  { title: 'Serialize and Deserialize Binary Tree', topic: 'Trees', diff: 'Hard' },
  { title: 'Find Median from Data Stream', topic: 'Queue', diff: 'Hard' },
];

const HACKERRANK_TITLES: readonly { title: string; topic: string; diff: Difficulty }[] = [
  { title: 'Simple Array Sum', topic: 'Arrays', diff: 'Easy' },
  { title: 'Compare the Triplets', topic: 'Arrays', diff: 'Easy' },
  { title: 'A Very Big Sum', topic: 'Math', diff: 'Easy' },
  { title: 'Diagonal Difference', topic: 'Arrays', diff: 'Easy' },
  { title: 'Plus Minus', topic: 'Math', diff: 'Easy' },
  { title: 'Staircase', topic: 'Strings', diff: 'Easy' },
  { title: 'Mini-Max Sum', topic: 'Sorting', diff: 'Easy' },
  { title: 'Birthday Cake Candles', topic: 'Arrays', diff: 'Easy' },
  { title: 'Time Conversion', topic: 'Strings', diff: 'Easy' },
  { title: 'Grading Students', topic: 'Math', diff: 'Easy' },
  { title: 'Equal Stacks', topic: 'Stack', diff: 'Medium' },
  { title: 'Dynamic Array', topic: 'Arrays', diff: 'Easy' },
  { title: 'Sherlock and the Valid String', topic: 'Strings', diff: 'Hard' },
  { title: 'Tree: Height of a Binary Tree', topic: 'Trees', diff: 'Easy' },
  { title: 'Crossword Puzzle', topic: 'Backtracking', diff: 'Hard' },
  { title: 'Connected Cells in a Grid', topic: 'Graphs', diff: 'Medium' },
  { title: 'Roads and Libraries', topic: 'Graphs', diff: 'Medium' },
  { title: 'Journey to the Moon', topic: 'Graphs', diff: 'Medium' },
  { title: 'Synchronous Shopping', topic: 'Graphs', diff: 'Hard' },
  { title: 'The Coin Change Problem', topic: 'Dynamic Programming', diff: 'Medium' },
  { title: 'Candies', topic: 'Dynamic Programming', diff: 'Hard' },
];

export function buildProblemCatalogue(count: number): Problem[] {
  return Array.from({ length: count }, (_unused, index) => buildProblem(index));
}

function buildProblem(index: number): Problem {
  const paddedNumber = String(index + 1).padStart(PROBLEM_ID_PAD_LENGTH, '0');
  const isHackerRank = index % 3 === 0;
  const platform: PlatformCode = isHackerRank ? 'hackerrank' : 'leetcode';

  let title = '';
  let topic = '';
  let difficulty: Difficulty = 'Easy';

  if (isHackerRank) {
    const item = HACKERRANK_TITLES[(index / 3) % HACKERRANK_TITLES.length];
    title = `HackerRank: ${item.title}`;
    topic = item.topic;
    difficulty = item.diff;
  } else {
    const item = LEETCODE_TITLES[index % LEETCODE_TITLES.length];
    title = `LeetCode #${(index % 250) + 1}: ${item.title}`;
    topic = item.topic;
    difficulty = item.diff;
  }

  return {
    id: `prob-${platform}-${paddedNumber}`,
    title,
    platform,
    difficulty,
    topic,
    tags: [slugify(topic), difficulty.toLowerCase(), platform],
  };
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-');
}
