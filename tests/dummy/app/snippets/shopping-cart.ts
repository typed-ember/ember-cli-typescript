// BEGIN-SNIPPET shopping-cart.ts
import { A } from '@ember/array';
import Service from '@ember/service';

export default class ShoppingCartService extends Service {
  items = A([]);

  add(item) {
    this.items.pushObject(item);
  }

  remove(item) {
    this.items.removeObject(item);
  }

  empty() {
    this.items.clear();
  }
}
// END-SNIPPET
