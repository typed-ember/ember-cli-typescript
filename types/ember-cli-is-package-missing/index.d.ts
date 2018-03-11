import Project = require("../ember-cli/lib/models/project");

declare function isPackageMissing(context: { project: Project }, packageName: string): boolean;

export = isPackageMissing;
