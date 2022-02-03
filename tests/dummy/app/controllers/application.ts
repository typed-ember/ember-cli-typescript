import Controller from '@ember/controller';

export default class ApplicationController extends Controller {
  // Just a very roundabout way of using some ES6 features
  value = ((test = 'Test') => `${test} ${'Value'}`)();
  foo = 'hello';
}
