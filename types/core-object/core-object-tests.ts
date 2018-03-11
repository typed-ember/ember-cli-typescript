import CoreObject = require("core-object");

let Klass = CoreObject.extend({
  foo() {}
});

let instance = new Klass();
instance.foo();

let instance2 = new Klass({
  bar() {}
});

instance2.foo();
instance2.bar();

let Klass2 = Klass.extend({
  bar() {}
});

let instance3 = new Klass2();
instance3.foo();
instance3.bar();

CoreObject.extend({
  init() {
    this._super();
  }
});

CoreObject.extend({
  init() {
    this._super.init.call(this);
  }
});

CoreObject.extend({}).extend({});
