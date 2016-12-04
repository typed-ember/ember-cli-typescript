var path = require('path');

module.exports = {
  description: 'Initialize files needed for typescript compilation',

  files: function() {
    return [
      path.join(this.path, 'files', 'tsconfig.json'),
      path.join(this.path, 'files', 'app', 'config', 'environment.d.ts')
      ];
  },

   mapFile: function() {
    var result = this._super.mapFile.apply(this, arguments);
    if (result.indexOf('/tsconfig.json')>-1) {
      return 'tsconfig.json';
    } else if (result.indexOf('/app/')>-1) {
      var pos = result.indexOf('/app/');
      return result.substring(pos+1);
    }
  },

  normalizeEntityName: function() {
    // Entity name is optional right now, creating this hook avoids an error.
  }
}

