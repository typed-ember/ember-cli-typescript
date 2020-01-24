// BEGIN-SNIPPET controller-with-model.ts
import Controller from '@ember/controller';
import MyRoute from '../routes/my-route';
import { ModelFrom } from '../lib/type-utils';

export default class ControllerWithModel extends Controller {
  model!: ModelFrom<MyRoute>;
}
// END-SNIPPET
