interface Dict<T = unknown> {
  [key: string]: T | undefined;
}

// BEGIN-SNIPPET show-all.ts
import { helper } from '@ember/component/helper';

const describe = (entries: string): string => (entries.length > 0 ? entries : '(none)');

export function showAll(positional: unknown[], named: Dict) {
  // pretty print each item with its index, like `0: { neat: true }` or
  // `1: undefined`.
  const positionalEntries = positional
    .reduce<string[]>((items, arg, index) => items.concat(`${index}: ${JSON.stringify(arg)}`), [])
    .join(', ');

  // pretty print each item with its name, like `cool: beans` or
  // `answer: 42`.
  const namedEntries = Object.keys(named)
    .reduce<string[]>(
      (items, key) => items.concat(`${key}: ${JSON.stringify(named[key], undefined, 2)}`),
      []
    )
    .join(', ');

  return `positional: ${describe(positionalEntries)}\nnamed: ${describe(namedEntries)}`;
}

export default helper(showAll);
// END-SNIPPET
