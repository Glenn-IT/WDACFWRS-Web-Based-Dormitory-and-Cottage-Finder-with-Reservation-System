/**
 * WDACFWRS - System Integrity & Synchronization Verifier
 * Run with: node tools/verify_system.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log("=================================================");
console.log("  WDACFWRS - Automated System Integrity Verifier ");
console.log("=================================================\n");

let hasErrors = false;

// 1. PHP Syntax Check
console.log("[1/5] Checking PHP Syntax...");
function getPhpFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getPhpFiles(full));
    } else if (entry.name.endsWith('.php')) {
      results.push(full);
    }
  }
  return results;
}

const phpFiles = getPhpFiles('.');
let phpErrors = 0;
for (const file of phpFiles) {
  try {
    execSync(`php -l "${file}"`, { stdio: 'pipe' });
  } catch (err) {
    console.error(`  [FAIL] PHP Parse Error in ${file}:\n`, err.stderr.toString());
    phpErrors++;
    hasErrors = true;
  }
}
if (phpErrors === 0) {
  console.log(`  [PASS] All ${phpFiles.length} PHP files passed syntax check.`);
} else {
  console.log(`  [FAIL] ${phpErrors} PHP file(s) failed.`);
}

// 2. JS Syntax Check
console.log("\n[2/5] Checking JavaScript Syntax...");
function getJsFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getJsFiles(full));
    } else if (entry.name.endsWith('.js')) {
      results.push(full);
    }
  }
  return results;
}

const jsFiles = getJsFiles('assets/js');
let jsErrors = 0;
for (const file of jsFiles) {
  try {
    execSync(`node --check "${file}"`, { stdio: 'pipe' });
  } catch (err) {
    console.error(`  [FAIL] JS Syntax Error in ${file}:\n`, err.stderr.toString());
    jsErrors++;
    hasErrors = true;
  }
}
if (jsErrors === 0) {
  console.log(`  [PASS] All ${jsFiles.length} JavaScript files passed syntax check.`);
} else {
  console.log(`  [FAIL] ${jsErrors} JS file(s) failed.`);
}

// 3. Cross-Reference Verification: DataAPI & Auth methods vs Callers
console.log("\n[3/5] Verifying API Client Callers & Cross-References...");
const dataJs = fs.readFileSync("assets/js/data.js", "utf8");
const authJs = fs.readFileSync("assets/js/auth.js", "utf8");

const dataMethods = [...dataJs.matchAll(/([a-zA-Z0-9_]+)\s*:\s*\([^)]*\)\s*=>/g)].map(m => m[1]);
const authMethods = [...authJs.matchAll(/(?:async\s+)?([a-zA-Z0-9_]+)\s*\([^)]*\)\s*\{/g)].map(m => m[1]);

let refErrors = 0;
for (const file of jsFiles) {
  const content = fs.readFileSync(file, "utf8");
  const dataCalls = [...content.matchAll(/DataAPI\.([a-zA-Z0-9_]+)/g)].map(m => m[1]);
  for (const call of dataCalls) {
    if (!dataMethods.includes(call)) {
      console.error(`  [FAIL] Missing DataAPI.${call}() in assets/js/data.js (called by ${file})`);
      refErrors++;
      hasErrors = true;
    }
  }
  const authCalls = [...content.matchAll(/Auth\.([a-zA-Z0-9_]+)/g)].map(m => m[1]);
  for (const call of authCalls) {
    if (!authMethods.includes(call)) {
      console.error(`  [FAIL] Missing Auth.${call}() in assets/js/auth.js (called by ${file})`);
      refErrors++;
      hasErrors = true;
    }
  }
}

// 4. Check API files exist for all endpoints
const allEndpoints = [
  ...[...dataJs.matchAll(/apiFetch\([`"']([^`"'?${]+)/g)].map(m => m[1]),
  ...[...authJs.matchAll(/apiFetch\([`"']([^`"'?${]+)/g)].map(m => m[1])
];
for (const ep of allEndpoints) {
  const diskPath = path.join("api", ep);
  if (!fs.existsSync(diskPath)) {
    console.error(`  [FAIL] Missing API endpoint file on disk: ${diskPath}`);
    refErrors++;
    hasErrors = true;
  }
}
if (refErrors === 0) {
  console.log(`  [PASS] All DataAPI (${dataMethods.length}) and Auth (${authMethods.length}) client methods and endpoints match.`);
} else {
  console.log(`  [FAIL] ${refErrors} reference error(s) found.`);
}

// 5. Check HTML asset links
console.log("\n[4/5] Checking HTML Asset Links (JS & CSS)...");
function getHtmlFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getHtmlFiles(full));
    } else if (entry.name.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

const htmlFiles = getHtmlFiles('.');
let assetErrors = 0;
for (const htmlFile of htmlFiles) {
  const content = fs.readFileSync(htmlFile, "utf8");
  const dir = path.dirname(htmlFile);

  const scriptSrcs = [...content.matchAll(/<script[^>]+src=["']([^"']+)["']/g)].map(m => m[1]);
  for (const src of scriptSrcs) {
    if (!src.startsWith("http") && !src.startsWith("//")) {
      const resolved = path.resolve(dir, src);
      if (!fs.existsSync(resolved)) {
        console.error(`  [FAIL] In ${htmlFile}: Script not found: ${src}`);
        assetErrors++;
        hasErrors = true;
      }
    }
  }

  const linkHrefs = [...content.matchAll(/<link[^>]+href=["']([^"']+)["']/g)].map(m => m[1]);
  for (const href of linkHrefs) {
    if (!href.startsWith("http") && !href.startsWith("//")) {
      const resolved = path.resolve(dir, href);
      if (!fs.existsSync(resolved)) {
        console.error(`  [FAIL] In ${htmlFile}: Stylesheet not found: ${href}`);
        assetErrors++;
        hasErrors = true;
      }
    }
  }
}
if (assetErrors === 0) {
  console.log(`  [PASS] All asset links across ${htmlFiles.length} HTML files verified.`);
} else {
  console.log(`  [FAIL] ${assetErrors} missing asset(s) in HTML files.`);
}

// 6. Test Database Connectivity via PHP
console.log("\n[5/5] Checking Database Connectivity...");
try {
  const phpCode = "require 'config/database.php'; try { echo 'OK: ' . get_db()->getAttribute(PDO::ATTR_SERVER_VERSION); } catch (Exception $e) { echo 'ERR: ' . $e->getMessage(); }";
  const dbOut = execSync(`php -r "${phpCode.replace(/"/g, '\\"')}"`, { stdio: 'pipe' }).toString();
  if (dbOut.includes("OK:")) {
    console.log(`  [PASS] Database connected successfully (${dbOut.trim()})`);
  } else {
    console.log(`  [WARN] Database connection message: ${dbOut.trim()}`);
  }
} catch (e) {
  console.log(`  [WARN] Could not test DB connection directly: ${e.message}`);
}

console.log("\n=================================================");
if (!hasErrors) {
  console.log("  >>> SYSTEM STATUS: ALL CHECKS PASSED (HEALTHY) <<<");
} else {
  console.log("  >>> SYSTEM STATUS: ISSUES DETECTED <<<");
}
console.log("=================================================\n");
process.exit(hasErrors ? 1 : 0);
