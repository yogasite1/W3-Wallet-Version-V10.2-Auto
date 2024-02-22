(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

/* global chrome */
// This file is used only for manifest version 3

// Represents if importAllScripts has been run
// eslint-disable-next-line
let scriptsLoadInitiated = false;
const testMode = false;
const loadTimeLogs = [];

function tryImport(...fileNames) {
  try {
    const startTime = new Date().getTime();
    // eslint-disable-next-line
    importScripts(...fileNames);
    const endTime = new Date().getTime();
    loadTimeLogs.push({
      name: fileNames[0],
      value: endTime - startTime,
      children: [],
      startTime,
      endTime
    });
    return true;
  } catch (e) {
    console.error(e);
  }
  return false;
}
function importAllScripts() {
  // Bail if we've already imported scripts
  if (scriptsLoadInitiated) {
    return;
  }
  scriptsLoadInitiated = true;
  const files = [];

  // In testMode individual files are imported, this is to help capture load time stats
  const loadFile = fileName => {
    if (testMode) {
      tryImport(fileName);
    } else {
      files.push(fileName);
    }
  };
  const startImportScriptsTime = Date.now();

  // value of applyLavaMoat below is dynamically replaced at build time with actual value
  const applyLavaMoat = false;
  if (typeof applyLavaMoat !== 'boolean') {
    throw new Error('Missing APPLY_LAVAMOAT environment variable');
  }
  loadFile('./globalthis.js');
  loadFile('./sentry-install.js');

  // eslint-disable-next-line no-undef
  const isWorker = !self.document;
  if (!isWorker) {
    loadFile('./snow.js');
  }
  loadFile('./use-snow.js');

  // Always apply LavaMoat in e2e test builds, so that we can capture initialization stats
  if (testMode || applyLavaMoat) {
    loadFile('./runtime-lavamoat.js');
    loadFile('./lockdown-more.js');
    loadFile('./policy-load.js');
  } else {
    loadFile('./init-globals.js');
    loadFile('./lockdown-install.js');
    loadFile('./lockdown-run.js');
    loadFile('./lockdown-more.js');
    loadFile('./runtime-cjs.js');
  }

  // This environment variable is set to a string of comma-separated relative file paths.
  const rawFileList = "./common-0.js,./common-1.js,./common-2.js,./common-3.js,./common-4.js,./common-5.js,./background-0.js,./background-1.js,./background-2.js,./background-3.js,./background-4.js,./background-5.js,./background-6.js";
  const fileList = rawFileList.split(',');
  fileList.forEach(fileName => loadFile(fileName));

  // Import all required resources
  tryImport(...files);
  const endImportScriptsTime = Date.now();

  // for performance metrics/reference
  console.log(`SCRIPTS IMPORT COMPLETE in Seconds: ${(Date.now() - startImportScriptsTime) / 1000}`);

  // In testMode load time logs are output to console
  if (testMode) {
    console.log(`Time for each import: ${JSON.stringify({
      name: 'Total',
      children: loadTimeLogs,
      startTime: startImportScriptsTime,
      endTime: endImportScriptsTime,
      value: endImportScriptsTime - startImportScriptsTime,
      version: 1
    }, undefined, '    ')}`);
  }
}

// Ref: https://stackoverflow.com/questions/66406672/chrome-extension-mv3-modularize-service-worker-js-file
// eslint-disable-next-line no-undef
self.addEventListener('install', importAllScripts);

/*
 * A keepalive message listener to prevent Service Worker getting shut down due to inactivity.
 * UI sends the message periodically, in a setInterval.
 * Chrome will revive the service worker if it was shut down, whenever a new message is sent, but only if a listener was defined here.
 *
 * chrome below needs to be replaced by cross-browser object,
 * but there is issue in importing webextension-polyfill into service worker.
 * chrome does seems to work in at-least all chromium based browsers
 */
chrome.runtime.onMessage.addListener(() => {
  importAllScripts();
  return false;
});

/*
 * This content script is injected programmatically because
 * MAIN world injection does not work properly via manifest
 * https://bugs.chromium.org/p/chromium/issues/detail?id=634381
 */
const registerInPageContentScript = async () => {
  try {
    await chrome.scripting.registerContentScripts([{
      id: 'inpage',
      matches: ['file://*/*', 'http://*/*', 'https://*/*'],
      js: ['inpage.js'],
      runAt: 'document_start',
      world: 'MAIN'
    }]);
  } catch (err) {
    /**
     * An error occurs when app-init.js is reloaded. Attempts to avoid the duplicate script error:
     * 1. registeringContentScripts inside runtime.onInstalled - This caused a race condition
     *    in which the provider might not be loaded in time.
     * 2. await chrome.scripting.getRegisteredContentScripts() to check for an existing
     *    inpage script before registering - The provider is not loaded on time.
     */
    console.warn(`Dropped attempt to register inpage content script. ${err}`);
  }
};
registerInPageContentScript();

},{}]},{},[1])
