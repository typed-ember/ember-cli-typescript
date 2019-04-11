const conventionalRecommendedBump = require(`conventional-recommended-bump`);
const semver = require('semver');
const fs = require('fs-extra');
const path = require('path');

const PACKAGE_JSON_PATH = path.join(__dirname, '..', 'package.json');

function releaseWithRecommendation(releaseType) {
  const packageJson = fs.readJsonSync(PACKAGE_JSON_PATH);
  let newVersion = semver.parse(packageJson.version);
  switch (releaseType) {
    case 'major':
      newVersion.major++;
      break;
    case 'minor':
      newVersion.minor++;
      break;
    case 'patch':
      newVersion.patch++;
      break;
    default:
      throw new Error('Unknown version recommendataion: ' + releaseType);
  }
  // eslint-disable-next-line no-console
  console.log(
    `Performing ${releaseType} version bump to ${packageJson.version} --> ${newVersion.format()}`
  );
  packageJson.version = newVersion.format();
  fs.writeJsonSync(PACKAGE_JSON_PATH, packageJson, {
    spaces: '  ',
  });
}

conventionalRecommendedBump(
  {
    preset: `angular`,
  },
  (error, recommendation) => {
    const { releaseType } = recommendation;
    if (!releaseType) {
      // eslint-disable-next-line no-console
      console.log('No version bump recommended. Skipping release');
      return;
    }
    releaseWithRecommendation(releaseType);
  }
);
