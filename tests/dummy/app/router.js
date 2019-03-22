import AddonDocsRouter, { docsRoute } from 'ember-cli-addon-docs/router';
import config from './config/environment';

const Router = AddonDocsRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL,
});

Router.map(function() {
  docsRoute(this, function() {
    this.route('upgrade-notes');
    this.route('configuration');
    this.route('ts-guide', function() {
      this.route('with-addons');
      this.route('using-ts-effectively');
      this.route('current-limitations');
    });
    this.route('troubleshooting', function() {
      this.route('conflicting-types');
    });
    this.route('type-defs', function() {
      this.route('package-names');
    });
  });
});

export default Router;
