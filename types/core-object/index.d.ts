
interface Constructor<T> {
  new (): T;
  new <U> (options: U): T & U;
}

declare class CoreObject {
  constructor();
  init(...args: any[]): void;
  _super: this & ((...args: any[]) => any);

  static extend<Statics, Instance, T extends { [key: string]: any; }>(
    this: Statics & Constructor<Instance>,
    options: T & ThisType<Instance & T>
  ): { [P in keyof Statics]: Statics[P] } & Constructor<Instance & T>;
}

export = CoreObject;
