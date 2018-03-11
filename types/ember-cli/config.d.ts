/**
 * ember-cli-config.js options
 */
export interface Config {
  storeConfigInMeta?: boolean,
  autoRun?: boolean,
  outputPaths?: {
    app?: {
      html?: string;
      css?: {
        [name: string]: string;
      };
      js?: string;
    },
    tests?: {
      js?: string;
    },
    vendor?: {
      css?: string;
      js?: string;
    },
    testSupport?: {
      css?: string;
      js?: {
        testSupport?: string;
        testLoader?: string;
      },
    },
  },
  minifyCSS?: {
    enabled?: boolean;
    options?: {
      relativeTo?: string;
      processImport?: boolean;
    },
  },
  minifyJS?: {
    enabled?: boolean;
    options?: {
      exclude?: string[];
    }
  }
  sourcemaps?: {
    enabled?: boolean;
    extensions?: string[];
  },
  trees?: {},
  jshintrc?: {},
  addons?: {
    blacklist?: string[];
  },
  vendorFiles?: {
    [name: string]: boolean | { production: string; } | null;
  }
}
