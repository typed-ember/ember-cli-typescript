import AddonDocsRouter, { docsRoute } from 'ember-cli-addon-docs/router';
import config from './config/environment';

const Router = AddonDocsRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL,
});

Router.map(function() {
  docsRoute(this, function() {
    this.route('getting-started', function() {
      this.route('installation');
      this.route('configuration');
    });

    this.route('ts', function() {
      this.route('overview');
      this.route('decorators');
      this.route('with-addons');
      this.route('using-ts-effectively');
      this.route('current-limitations');
    });

    this.route('ember', function() {
      this.route('overview');
      this.route('components');
      this.route('services');
      this.route('testing');
      this.route('routes');
      this.route('controllers');
      this.route('helpers');
      this.route('apps-and-addons');
    });

    this.route('ember-data', function() {
      this.route('overview');
      this.route('models');
      this.route('adapters');
      this.route('serializers');
      this.route('transforms');
    });

    this.route('legacy', function() {
      this.route('overview');
      this.route('ember-object');
      this.route('computed-properties');
      this.route('mixins');
      this.route('ember-component');
    });

    this.route('cookbook', function() {
      this.route('overview');
      this.route('working-with-route-models');
    });

    this.route('upgrade-notes');

    this.route('troubleshooting', function() {
      this.route('conflicting-types');
    });
    this.route('type-defs', function() {
      this.route('package-names');
    });
  });
});

export default Router;
