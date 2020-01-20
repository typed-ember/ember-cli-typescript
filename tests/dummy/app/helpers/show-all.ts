interface Dict<T = unknown> {
  [key: string]: T | undefined;
}

// BEGIN-SNIPPET show-all.ts
import { helper } from '@ember/component/helper';

export function showAll(positional: unknown[], named: Dict) {
  // pretty print each item with its index, like `0: { neat: true }` or
  // `1: undefined`.
  const positionalDescription =
    'positional: ' +
    positional
      .reduce<string[]>((items, arg, index) => items.concat(`${index}: ${JSON.stringify(arg)}`), [])
      .join(', ');

  // pretty print each item with its name, like `cool: beans` or
  // `answer: 42`.
  const namedDescription =
    'named: ' +
    Object.keys(named)
      .reduce<string[]>(
        (items, key) => items.concat(`${key}: ${JSON.stringify(named[key], undefined, 2)}`),
        []
      )
      .join(', ');

  return `${positionalDescription}\n${namedDescription}`;
}

export default helper(showAll);
// END-SNIPPET
