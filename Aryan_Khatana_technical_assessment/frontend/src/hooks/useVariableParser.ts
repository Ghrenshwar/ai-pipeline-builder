import { useMemo } from "react";

const TOKEN_PATTERN = /{{\s*([^{}]+?)\s*}}/g;
const IDENTIFIER_PATTERN = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

export function parseVariables(value: string) {
  const variables = new Set<string>();
  const invalid = new Set<string>();
  let match = TOKEN_PATTERN.exec(value);

  while (match) {
    const token = match[1].trim();
    if (IDENTIFIER_PATTERN.test(token)) {
      variables.add(token);
    } else {
      invalid.add(token);
    }
    match = TOKEN_PATTERN.exec(value);
  }

  TOKEN_PATTERN.lastIndex = 0;
  return { variables: Array.from(variables), invalid: Array.from(invalid) };
}

export function useVariableParser(value: string) {
  return useMemo(() => parseVariables(value), [value]);
}
