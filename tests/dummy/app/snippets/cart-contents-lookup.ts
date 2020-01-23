// BEGIN-SNIPPET cart-contents-lookup.ts
import Component from '@glimmer/component';
import { getOwner } from '@ember/application';
import { action } from '@ember/object';

import ShoppingCartService from 'my-app/services/shopping-cart';

export default class CartContentsComponent extends Component {
  get cart() {
    return getOwner(this).lookup('service:shopping-cart') as ShoppingCartService;
  }

  @action
  remove(item) {
    this.cart.remove(item);
  }
};
// END-SNIPPET
