// BEGIN-SNIPPET cart-contents.ts
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import ShoppingCartService from 'my-app/services/shopping-cart';

export default class CartContentsComponent extends Component {
  @service shoppingCart: ShoppingCartService;

  @action
  remove(item) {
    this.shoppingCart.remove(item);
  }
};
// END-SNIPPET
