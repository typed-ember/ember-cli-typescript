// BEGIN-SNIPPET simplified-glimmer-component.d.ts
export default class Component<Args extends {} = {}> {
  args: Args;

  constructor(owner: unknown, args: Args);
}
// END-SNIPPET
