import Funnel = require('broccoli-funnel');

var cssFiles = new Funnel('src/css');

var projectFiles = 'src';
var imageFiles = new Funnel(projectFiles, {
  srcDir: 'icons'
});

var todoRelatedFiles = new Funnel('src', {
  include: ['todo/**/*']
});

var nobodyLikesTodosAnyway = new Funnel('src', {
  exclude: ['**/todo.js']
});

var someFiles = new Funnel('src', {
  files: ['css/reset.css', 'icons/check-mark.png']
});

var node = new Funnel('packages/ember-metal/lib', {
  destDir: 'ember-metal',

  getDestinationPath: function(relativePath) {
    if (relativePath === 'lib/main.js') {
      return 'ember-metal.js';
    }

    return relativePath;
  }
});
