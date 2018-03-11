import fs = require('fs');
import EmberRouterGenerator = require('ember-router-generator');

var source = fs.readFileSync('./tests/fixtures/basic-route.js', { encoding: 'utf8' });

var routes = new EmberRouterGenerator(source);
var newRoutes = routes.add('foos');
var newRoutes = routes.add('foos/bar/baz');
var newRoutes = routes.add('edit', { path: ':foo_id/edit' });
var newRoutes = routes.add('foos/edit', { path: ':foo_id/edit', identifier: 'mount' });
var newRoutes = routes.add('edit', { path: ':foo_id/edit', resetNamespace: false });
var newRoutes = routes.add('foos/bar', { resetNamespace: true });

var newRoutes = routes.remove('foos');
var newRoutes = routes.remove('blog', { identifier: 'mount' });
var newRoutes = routes.remove('foos/bar/baz');
var newRoutes = routes.remove('blog/ember/engines', { identifier: 'mount' });

var code: string = newRoutes.code();
var code: string = newRoutes.code({ tabWidth: 2, quote: 'single' });
