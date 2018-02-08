import Component from '@ember/component';

function compute(): { value: string } {
  return { value: 'from component' };
}

export default Component.extend({
  someValue: compute().value,
});
