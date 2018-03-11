import Funnel = require("broccoli-funnel");
import EmberApp = require('ember-cli/lib/broccoli/ember-app');

// ember-cli-build.js
module.exports = function(defaults: {}) {
  var app = new EmberApp(defaults, {
    minifyJS: {
      enabled: false
    },
    minifyCSS: {
      enabled: false
    }
  });

  return app.toTree();
};

module.exports = function(defaults: {}) {
  var app = new EmberApp(defaults, {
    minifyJS: {
      options: {
        exclude: ["**/vendor.js"]
      }
    }
  });

  //...
  return app.toTree();
};

var app = new EmberApp({
  sourcemaps: {
    enabled: EmberApp.env() !== 'production',
    extensions: ['js']
  }
});

var app = new EmberApp({
  minifyCSS: {
    options: { processImport: true }
  }
});

var app = new EmberApp({
  storeConfigInMeta: false
});

var app = new EmberApp({
  outputPaths: {
    app: {
      html: 'index.html',
      css: {
        'app': '/assets/application-name.css'
      },
      js: '/assets/application-name.js'
    },
    vendor: {
      css: '/assets/vendor.css',
      js: '/assets/vendor.js'
    }
  }
});

var app = new EmberApp({
  outputPaths: {
    app: {
      css: {
        'app': '/assets/application-name.css',
        'themes/alpha': '/assets/themes/alpha.css'
      }
    }
  }
});

var app = new EmberApp({
  autoRun: false
});

app.import('bower_components/bootstrap/dist/css/bootstrap.css');

app.import('bower_components/ic-ajax/dist/amd/main.js', {
  using: [
    { transformation: 'amd', as: 'ic-ajax' }
  ]
});

app.import({
  development: 'bower_components/ember/ember.js',
  production:  'bower_components/ember/ember.prod.js'
});

if (app.env === 'development') {
  app.import('vendor/ember-renderspeed/ember-renderspeed.js');
}

app.import( app.bowerDirectory + '/sinonjs/sinon.js', { type: 'test' } );
app.import( app.bowerDirectory + '/sinon-qunit/lib/sinon-qunit.js', { type: 'test' } );

app.import('bower_components/font-awesome/fonts/fontawesome-webfont.ttf', {
  destDir: 'assets'
});

app.import('bower_components/es5-shim/es5-shim.js', {
  type: 'vendor',
  prepend: true
});

app.import('vendor/dependency-1.js', { outputFile: 'assets/additional-script.js'});

var app = new EmberApp({
  vendorFiles: {
    'handlebars.js': {
      production: 'bower_components/handlebars/handlebars.js'
    }
  }
});

var app = new EmberApp({
  vendorFiles: {
    'handlebars.js': false
  }
});
var app = new EmberApp({
  vendorFiles: {
    'handlebars.js': null
  }
});

var app = new EmberApp({
  addons: {
    blacklist: [
      'fastboot-app-server'
    ]
  }
});

var extraAssets = new Funnel('bower_components/a-lovely-webfont', {
  srcDir: '/',
  include: ['**/*.woff', '**/stylesheet.css'],
  destDir: '/assets/fonts'
});

// Providing additional trees to the `toTree` method will result in those
// trees being merged in the final output.

app.toTree(extraAssets);
app.toTree([ extraAssets ]);

var filteredAssets = new Funnel(app.toTree(), {
  // Exclude gitkeeps from output
  exclude: ['**/.gitkeep']
});
