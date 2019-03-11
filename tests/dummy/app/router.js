import AddonDocsRouter, { docsRoute } from 'ember-cli-addon-docs/router';
import config from './config/environment';

const Router = AddonDocsRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL,
});

Router.map(function() {
  docsRoute(this, function() {
    this.route('install-notes');
    this.route('configuration');
    this.route('ts-guide', function() {
      this.route('with-addons');
      this.route('using-ts-effectively');
      this.route('current-limitations');
    });
  });
});

export default Router;
