import AddonDocsRouter, { docsRoute } from 'ember-cli-addon-docs/router';
import config from './config/environment';

const Router = AddonDocsRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL,
});

Router.map(function() {
  docsRoute(this, function() {
    this.route('setup', function() {
      this.route('installation');
      this.route('configuration');
    });

    this.route('guide', function() {
      this.route('overview');
      this.route('components');
      this.route('services');
      this.route('testing');
      this.route('routes');
      this.route('controllers');
      this.route('helpers');
      this.route('apps-and-addons');
    });

    this.route('legacy', function() {
      this.route('overview');
      this.route('ember-object');
      this.route('mixins');
      this.route('ember-component');
    });

    this.route('upgrade-notes');
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
