// Storage variable setup for cross-browser compatibility
const storage = typeof browser !== "undefined" ? browser.storage : chrome.storage;


// ----- Plugin Controllers Management -----

// Plugin controller is a div in popup.html which controls enabling/disabling a plugin

// Mapping of plugin controllers to plugin names which are identifiers in storage
// controllers' div ids must match the keys here
// Example: "genedController" div controls "gened-plugin" plugin
const pluginControllerMap = {
        genedController: "gened-plugin",
        coursesController: "courses-plugin",
};

// Function to visually enable a plugin controller
function visuallyEnablePlugin(id) {
        const pluginControllerDiv = document.getElementById(id);
        if (pluginControllerDiv) {
                pluginControllerDiv.classList.add("pluginEnabled");
                pluginControllerDiv.classList.remove("pluginDisabled");
        }
}

// Function to visually disable a plugin controller
function visuallyDisablePlugin(id) {
        const pluginControllerDiv = document.getElementById(id);
        if (pluginControllerDiv) {
                pluginControllerDiv.classList.add("pluginDisabled");
                pluginControllerDiv.classList.remove("pluginEnabled");
        }
}

// Initialize checkboxes from storage on popup load
function laodControllers() {

        // Getting enabledPlugins from storage
        storage.local.get("enabledPlugins", (result) => {
                // Extract enabledPlugins object
                const enabledPlugins = result.enabledPlugins || {};

                // Iterate over each controller to set its visual state
                for (const [controllerId, name] of Object.entries(pluginControllerMap)) {

                        // Check if the plugin is enabled or disabled and set visual state accordingly
                        if (enabledPlugins[name] === false) {
                                visuallyDisablePlugin(controllerId);
                        } else {
                                visuallyEnablePlugin(controllerId);
                        }
                }
        });
}

// Function for getting current controller state
function getControllerState(controllerId) {
        // Finding controller div
        const controllerDiv = document.getElementById(controllerId);
        // If it exists and has pluginEnabled class, return true
        if (controllerDiv) {
                return controllerDiv.classList.contains("pluginEnabled");
        }

        // Just in case
        return false;
}

// Function to reload tabs matching a plugin's URLs when it is enabled/disabled
// to automatically apply changes without needing manual refresh
function reloadPluginTabs(pluginName) {

        // Getting plugins info from storage
        storage.local.get(["plugins"], (data) => {

                // Extract plugins object
                const plugins = data.plugins || {};
                const pluginInfo = plugins[pluginName];
                if (!pluginInfo || !pluginInfo.matches) return;

                // For each match URL pattern of the plugin, query tabs and reload them
                pluginInfo.matches.forEach((matchUrl) => {
                        chrome.tabs.query({ url: matchUrl }, (tabs) => {
                                tabs.forEach((tab) => chrome.tabs.reload(tab.id));
                        });
                });
        });
}

// Setting up event listeners for plugin controllers in popup so 
// when clicked they toggle the plugin state and enable or disable it
function setupControllersListeners() {

        // Iterating over each controller
        for (const [controllerId, name] of Object.entries(pluginControllerMap)) {
                // Finding controller div
                const controllerDiv = document.getElementById(controllerId);

                // Setting up click listener
                controllerDiv.addEventListener("click", () => {
                        // Get current state and do corresponding action for disabled and enabled states
                        if (getControllerState(controllerId)) {
                                // Currently enabled, so disable it

                                // Getting enabledPlugins from storage
                                storage.local.get("enabledPlugins", (result) => {
                                        // Extract enabledPlugins object
                                        const enabledPlugins = result.enabledPlugins || {};
                                        
                                        // Set the plugin to disabled
                                        enabledPlugins[name] = false;

                                        // Visually disable the controller (make it look disabled)
                                        visuallyDisablePlugin(controllerId);

                                        // Update storage and reload relevant tabs
                                        storage.local.set({ enabledPlugins }, () => {
                                                reloadPluginTabs(name);
                                        });
                                });
                        } else {
                                // Currently disabled, so enable it

                                // Getting enabledPlugins from storage
                                storage.local.get("enabledPlugins", (result) => {
                                        // Extract enabledPlugins object
                                        const enabledPlugins = result.enabledPlugins || {};
                                        
                                        // Set the plugin to enabled
                                        enabledPlugins[name] = true;

                                        // Visually enable the controller (make it look enabled)
                                        visuallyEnablePlugin(controllerId);

                                        // Update storage and reload relevant tabs
                                        storage.local.set({ enabledPlugins }, () => {
                                                reloadPluginTabs(name);
                                        });
                                });
                        }
                });
        }
}

// Call controllers' setupers
laodControllers();
setupControllersListeners();



// ----- Footer Icons Management -----

// We need manually add listeners to footer icons because
// if we add them in HTML, the browsers block them for security reasons.

// Handle footer icon clicks in one function
document.querySelectorAll(".footerIcon").forEach((icon) => {
        icon.addEventListener("click", () => {
                const urls = {
                        GitHub: "https://github.com/rezocrypt/aua-utils",
                        Telegram: "https://t.me/rezocrypt",
                };
                const url = urls[icon.title];
                if (url) chrome.tabs.create({ url });
        });
});



// ----- Useful Links -----

// List of useful links to show in popup
const usefulLinks = [
        {
                name: "AUA General Education",
                url: "https://gened.aua.am/courses-and-their-clusters/",
                image: "",
        },
        {
                name: "AUA Courses",
                url: "https://auasonis.jenzabarcloud.com/GENSRsC.cfm",
                image: "",
        },
        {
                name: "AUA Academic Calendar",
                url: "https://registrar.aua.am/academic-calendar/",
                image: "",
        },
        {
                name: "AUA Events Calendar",
                url: "https://newsroom.aua.am/events-calendar/",
                image: "",
        },
        {
                name: "AUA Registrar Forms",
                url: "https://registrar.aua.am/forms-2/",
                image: "",
        },
        {
                name: "AUA Library Study Rooms",
                url: "https://aua-am.libcal.com/reserve/rooms",
                image: "",
        },
];

// Getting container where all useful links will be added
const usefulLinksContainer = document.getElementById("usefulLinksContainer");

// Creating and adding each useful link card to the container
// Styles are in popup.css
usefulLinks.forEach((link) => {

        // Creating card elements
        const card = document.createElement("div");
        card.className = "linkCard";
        card.dataset.url = link.url;

        // Creating icon but here we must be careful because I did something wrong
        // and before opening popup for half minute it tried to fetch all images
        // so thats why I use asynchronous loading for images
        const icon = document.createElement("div");
        icon.className = "linkIcon";
        if (link.image) {
                const img = new Image();
                img.src = link.image;
                img.onload = () =>
                        (icon.style.background = `url("${link.image}") center / contain no-repeat`);
        }

        // Creating text element which is the name of useful link
        const text = document.createElement("div");
        text.className = "linkText";
        text.textContent = link.name;

        // Appending icon and text to card, and card to container
        card.appendChild(icon);
        card.appendChild(text);

        // Adding card to container
        usefulLinksContainer.appendChild(card);
});

// Adds click listeners to each useful link card to open the link in new tab
document.querySelectorAll(".linkCard").forEach((card) => {
        card.addEventListener("click", () => {
                const url = card.dataset.url;
                if (url) chrome.tabs.create({ url });
        });
});
