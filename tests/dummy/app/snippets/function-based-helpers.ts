declare module '@ember/debug' {
  export function assert(message: string, value: unknown): asserts value;
}

// BEGIN-SNIPPET function-based-helper.ts
import { helper } from '@ember/component/helper';
import { assert } from '@ember/debug';
import { is } from '../../type-utils'

export function join(positional: [unknown, unknown], named: Dict<unknown>) {
  assert(
    `'join' requires two 'string' positional parameters`,
    is<[string, string]>(
      positional,
      positional.length === 2 &&
      positional.every(el => typeof el === 'string')
    )
  );
  assert(`'join' requires argument 'separator'`, typeof named.separator === 'string');

  const joined = positional.join(named.separator);
  const prefix = typeof named.prefix === 'string' ? named.prefix : '';

  return `${prefix}${joined}`;
}

export default helper(join);
// END-SNIPPET
