import VersionChecker = require("ember-cli-version-checker");
import Project = require("ember-cli/lib/models/project");

declare let project: Project;
let checker = new VersionChecker(project);
let dep = checker.for('ember-cli');

if (dep.gte('2.0.0')) {
  /* deal with 2.0.0+ stuff */
} else {
  /* provide backwards compat */
};

checker.for('ember-cli').assertAbove('2.0.0');
checker.for('ember-cli').assertAbove('2.0.0', 'To use awesome-addon you must have ember-cli 2.0.0');

if (dep.isAbove('2.0.0')) {
  /* deal with 2.0.0 stuff */
} else {
  /* provide backwards compat */
};
let ember = checker.forEmber();

if (ember.isAbove('2.10.0')) {
  /* deal with 2.10.0 stuff */
};

if (dep.exists()) {
  /* do things when present */
};

dep.version;
