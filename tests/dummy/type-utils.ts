export function is<T>(val: unknown, predicate: boolean): val is T {
  return predicate;
}
