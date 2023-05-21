export const snakeToCamelCase = (str) =>
  str.toLowerCase().replace(/[-_][a-z]/g, (group) => group.slice(-1).toUpperCase())
