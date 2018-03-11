import EmberAddon = require("ember-cli/lib/broccoli/ember-addon");
import Project = require("ember-cli/lib/models/project");

declare class DependencyVersionChecker {
  version?: string;
  exists(): boolean;
  isAbove(compareVersion: string): boolean;
  assertAbove(compareVersion: string, message?: string): never;
  gt(range: string): boolean;
  lt(range: string): boolean;
  gte(range: string): boolean;
  lte(range: string): boolean;
  eq(range: string): boolean;
  neq(range: string): boolean;
  satisfies(range: string): boolean;
}

declare class VersionChecker {
  constructor(addon: Project | EmberAddon);
  for(name: string, type?: 'npm' | 'bower'): DependencyVersionChecker;
  forEmber(): DependencyVersionChecker;
}

export = VersionChecker;
