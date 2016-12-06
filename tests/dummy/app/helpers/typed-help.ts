import Ember from 'ember';
export function typedHelp(/*params, hash*/) {
  return "my type of help";
}

export default Ember.Helper.helper(typedHelp);
