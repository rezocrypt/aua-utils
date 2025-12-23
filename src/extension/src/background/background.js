// background.js
// This works both with:
// - Chrome (Manifest V3 + service_worker)
// - Firefox (Manifest V2 + background.scripts)

// Maps plugin names to their matching URL patterns and script files
const PLUGINS = {
        "gened-plugin": {
                matches: [
                        "https://gened.aua.am/courses-and-their-clusters",
                        "https://gened.aua.am/courses-and-their-clusters/",
                ],
                file: "scripts/gened-plugin.js",
        },
        "courses-plugin": {
                matches: [
                        "https://auasonis.jenzabarcloud.com/GENSRsC.cfm",
                        "https://auasonis.jenzabarcloud.com/GENSRsC.cfm/",
                ],
                file: "scripts/courses-plugin.js",
        }
}

// Cross-browser storage API. In Chrome, it's chrome.storage; in Firefox, it's browser.storage
// so to make this compatible, we define a unified storage variable.
const storage = (typeof browser !== "undefined") ? browser.storage : chrome.storage;

// When installed it sets up inside local storage which plugins are enabled and which one are disabled. By default
// all plugins are enabled on installation.
chrome.runtime.onInstalled.addListener(() => {
        // Generating enabledPlugins object with all plugins set to true
        // Example enabledPlugins: { "gened-plugin": true, "courses-plugin": true }
        const enabledPlugins = Object.fromEntries(
                Object.keys(PLUGINS).map(key => [key, true])
        );

        // Storing the enabledPlugins and plugins info in local storage
        storage.local.set({
                enabledPlugins: enabledPlugins,
                plugins: PLUGINS
        });
});

// Unified injection function which injects script file into tab (Chrome MV3 + Firefox MV2)
function injectPlugin(tabId, file) {
        if (chrome.scripting && chrome.scripting.executeScript) {
                // Chrome MV3
                chrome.scripting.executeScript({
                        target: { tabId },
                        files: [file],
                });
        } else {
                // Firefox MV2
                chrome.tabs.executeScript(tabId, { file });
        }
}

// Listen for page load completion and inject enabled plugins based on URL matching
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

        // If the page is not fully loaded or URL is undefined, do nothing
        if (changeInfo.status !== "complete" || !tab.url) return;

        // Retrieve enabled plugins from storage
        storage.local.get("enabledPlugins").then((result) => {
                
                // Extract enabledPlugins object
                const enabledPlugins = result.enabledPlugins;

                // Iterate over each plugin to check if it should be injected
                for (const [key, value] of Object.entries(PLUGINS)) {
                        // key is plugin name, value is plugin info
                        const pluginName = key;
                        const plugin = value;

                        // Check if the plugin is enabled
                        const isPluginEnabled = enabledPlugins[pluginName] || false;

                        // If not enabled, skip to the next plugin
                        if (!isPluginEnabled) {
                                continue;
                        }

                        // Check if the current tab's URL matches any of the plugin's URL patterns
                        if (plugin.matches.some((prefix) => tab.url.startsWith(prefix))) {
                                // Inject the plugin script into the tab
                                injectPlugin(tabId, plugin.file);
                        }
                }
        });
});
