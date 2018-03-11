
type Person = string | {
  name?: string;
  email?: string;
  url?: string;
}

/**
 * package.json file
 *
 * based on @types/normalize-package-data
 */
export interface Package {
  [k: string]: any;
  name: string;
  version: string;
  files?: string[];
  bin?: {[k: string]: string };
  man?: string[];
  keywords?: string[];
  author?: Person;
  maintainers?: Person[];
  contributors?: Person[];
  bundleDependencies?: {[name: string]: string; };
  dependencies?: {[name: string]: string; };
  devDependencies?: {[name: string]: string; };
  optionalDependencies?: {[name: string]: string; };
  description?: string;
  engines?: {[type: string]: string };
  license?: string;
  repository?: string | { type: string, url: string };
  bugs?: { url: string, email?: string } | { url?: string, email: string };
  homepage?: string;
  scripts?: {[k: string]: string};
  readme?: string;
  _id?: string;
  "ember-addon"?: {
    configPath?: string;
    before?: string[];
    after?: string[];
    paths?: string[];
  };
}
