'use strict';

interface Paths {
  [name: string]: string[];
}

interface Options {
  isLinked?: boolean;
  removePaths?: boolean;
}

export = function updatePathsForAddon(paths: Paths, addonName: string, appName: string, options?: Options) {
  options = options || {};
  const addonNameStar = [addonName, '*'].join('/');
  const addonPath = [options.isLinked ? 'node_modules' : 'lib', addonName].join('/');
  const addonAddonPath = [addonPath, 'addon'].join('/');
  const addonAppPath = [addonPath, 'app'].join('/');
  const appNameStar = [appName, '*'].join('/');
  let appStarPaths;
  paths = paths || {};
  appStarPaths = paths[appNameStar] = paths[appNameStar] || [];

  if (options.removePaths) {
    if (paths.hasOwnProperty(addonName)) {
      delete paths[addonName];
    }
    if (paths.hasOwnProperty(addonNameStar)) {
      delete paths[addonNameStar]
    }
    let addonAppPathIndex = appStarPaths.indexOf([addonAppPath, '*'].join('/'));
    if (addonAppPathIndex > -1) {
      appStarPaths.splice(addonAppPathIndex, 1);
      paths[appNameStar] = appStarPaths;
    }
  } else {
    if (!paths.hasOwnProperty(addonName)) {
      paths[addonName] = [ addonAddonPath ];
    }
    if (!paths.hasOwnProperty(addonNameStar)) {
      paths[addonNameStar] = [ [addonAddonPath, '*'].join('/') ];
    }
    if (appStarPaths.indexOf(addonAppPath) === -1) {
      appStarPaths.push([addonAppPath, '*'].join('/'));
      paths[appNameStar] = appStarPaths;
    }
  }
}
