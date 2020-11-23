// BEGIN-SNIPPET belongs-to.ts
import Model, { belongsTo } from '@ember-data/model';
import DS from 'ember-data'; // NOTE: this is a workaround, see discussion below!
import User from './user';
import Site from './site';

export default class Post extends Model {
  @belongsTo('user')
  declare user: DS.PromiseObject<User>;

  @belongsTo('site', { async: false })
  declare site: Site;
}
// END-SNIPPET
