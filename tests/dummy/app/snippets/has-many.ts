// BEGIN-SNIPPET has-many.ts
import Model, { hasMany } from '@ember-data/model';
import EmberArray from '@ember/array';
import DS from 'ember-data'; // NOTE: this is a workaround, see discussion below!
import Comment from './comment';
import User from './user';

export default class Thread extends Model {
  @hasMany('comment')
  comment!: DS.PromiseManyArray<Comment>;

  @hasMany('user', { async: false })
  participants!: EmberArray<User>;
}
// END-SNIPPET
