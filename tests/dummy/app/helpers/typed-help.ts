import Ember from 'ember';
import { helper } from '@ember/component/helper';

export function typedHelp(/*params, hash*/) {
  return 'my type of help';
}

export default helper(typedHelp);
