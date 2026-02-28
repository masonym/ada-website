/**
 * Natural sort function for filenames with numbers in parentheses
 * Sorts strings like "Name (1).ext", "Name (2).ext", "Name (10).ext" in proper numerical order
 */
export const naturalSort = (a: string, b: string): number => {
  // Extract numbers from parentheses in filenames like "Name (123).ext"
  const getNumber = (filename: string): number => {
    const match = filename.match(/\((\d+)\)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const numA = getNumber(a);
  const numB = getNumber(b);

  // If both have numbers, sort by number
  if (numA !== 0 && numB !== 0) {
    return numA - numB;
  }

  // If only one has a number, prioritize the one with number
  if (numA !== 0) return -1;
  if (numB !== 0) return 1;

  // If neither has numbers, fall back to string comparison
  return a.localeCompare(b);
};
