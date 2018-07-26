'use strict';

module.exports = function(paths, addonName, appName, options) {
  options = options || {};
  const addonNameStar = [addonName, '*'].join('/');
  const addonPath = [options.isLinked ? 'node_modules' : 'lib', addonName].join('/');
  const addonAddonPath = [addonPath, 'addon'].join('/');
  const addonAppPath = [addonPath, 'app'].join('/');
  const appNameStar = [appName, '*'].join('/');
  const addonTestSupportPath = [addonName, 'test-support'].join('/');
  const addonTestSupportStarPath = `${addonTestSupportPath}/*`;
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
    if (!paths.hasOwnProperty(addonTestSupportPath)) {
      paths[addonTestSupportPath] = [ [addonPath, 'addon-test-support'].join('/') ];
    }
    if (!paths.hasOwnProperty(addonTestSupportStarPath)) {
      paths[addonTestSupportStarPath] = [ [addonPath, 'addon-test-support', '*'].join('/') ];
    }
    if (appStarPaths.indexOf(addonAppPath) === -1) {
      appStarPaths.push([addonAppPath, '*'].join('/'));
      paths[appNameStar] = appStarPaths;
    }
  }
}
