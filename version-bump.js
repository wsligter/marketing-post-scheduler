#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to read and parse package.json
function readPackageJson(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    process.exit(1);
  }
}

// Function to write updated package.json
function writePackageJson(filePath, content) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');
    console.log(`Updated ${filePath} to version ${content.version}`);
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error.message);
    process.exit(1);
  }
}

// Function to bump version according to semver
function bumpVersion(version, type) {
  const [major, minor, patch] = version.split('.').map(Number);
  
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      console.error('Invalid version type. Use major, minor, or patch.');
      process.exit(1);
  }
}

// Main function
function main() {
  // Get version bump type from command line arguments
  const bumpType = process.argv[2];
  if (!['major', 'minor', 'patch'].includes(bumpType)) {
    console.error('Usage: node version-bump.js [major|minor|patch]');
    process.exit(1);
  }

  // Define paths to package.json files
  const frontendPackagePath = path.join(__dirname, 'frontend', 'package.json');
  const backendPackagePath = path.join(__dirname, 'backend', 'package.json');
  
  // Read package.json files
  const frontendPackage = readPackageJson(frontendPackagePath);
  const backendPackage = readPackageJson(backendPackagePath);
  
  // Get current version
  const currentVersion = frontendPackage.version;
  console.log(`Current version: ${currentVersion}`);
  
  // Calculate new version
  const newVersion = bumpVersion(currentVersion, bumpType);
  console.log(`New version: ${newVersion}`);
  
  // Update versions in both package.json files
  frontendPackage.version = newVersion;
  backendPackage.version = newVersion;
  
  // Write updated package.json files
  writePackageJson(frontendPackagePath, frontendPackage);
  writePackageJson(backendPackagePath, backendPackage);
  
  console.log(`\nSuccessfully bumped version from ${currentVersion} to ${newVersion}`);
}

main();
