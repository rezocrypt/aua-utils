// ==UserScript==
// @name         AUA Gened Plugin
// @namespace    https://github.com/rezocrypt/aua-utils/
// @version      1.0.0
// @description  AUA Gened Plugin helps you find general education courses by keyword, theme, or level.
// @match        https://gened.aua.am/courses-and-their-clusters/
// @run-at       document-end
// @grant        none
// @icon         https://aua.am/favicon.ico
// @author       rezocrypt
// @match        *://*/*
// @supportURL   https://t.me/rezocrypt
// @updateURL    https://github.com/rezocrypt/aua-utils/blob/main/tampermonkey/output/scripts/gened-plugin.js
// @downloadURL  https://github.com/rezocrypt/aua-utils/blob/main/tampermonkey/output/scripts/gened-plugin.js
// @license      GPL-3.0
// ==/UserScript==

(function () {
        "use strict";

        /* 
                AUA Gened Plugin - Simple Architecture

                1. Table Setup:
                - Uses the last table on the page.
                - Moves first row into a new table for sticky header.

                2. Plugin Window:
                - Floating window with header, content, footer.
                - Content includes search, themes, mode, class levels, "Show Only Matching" button.

                3. Filtering:
                - highlightRows() checks keywords, themes, mode, and class levels.
                - Highlights matching rows and hides others if "Show Only Matching" is on.

                4. Interactions:
                - Inputs and checkboxes trigger highlightRows().
                - Enter/Shift+Enter navigates through matches with temporary highlight.
                - Close button removes window and shows notification.

                5. Important Variables & Functions:
                - table: the main table being filtered.
                - win: main plugin window div.
                - searchInput: keyword search input.
                - checkboxes: array of theme checkboxes.
                - selectMode: "and/or" dropdown for theme matching.
                - lowerLabel, upperLabel: checkboxes for class levels.
                - showOnly: toggle for showing only matching rows.
                - lastScrolledIndex: tracks current row for Enter navigation.
                - highlightRows(): main function to apply filters and highlight rows.
                - scrollToNearestMatching(): scrolls to first visible matching row.
                - updateMatchedCount(): updates count of matched rows.
                - closeWindow(): closes plugin window and shows notification.
        */


        // ----- Checking if we are in right place or no -----

        if (!location.href.includes("gened.aua.am/courses-and-their-clusters")) return;


        // ========== HTML Generation and Manipulation Logic ==========



        // ----- Global Variables And Constants -----

        // Constants for main table
        const tables = document.querySelectorAll("table");
        const table = tables[tables.length - 1]; // last table
        if (!table) return;

        // Call setupTable to separate header row and also set table height to auto
        setupTable();

        // AUA blue color constant
        const AUA_BLUE = "#002147";



        // ----- Creating Plugin's Main Window -----

        // This win is the window object where all other elements will be appended
        const win = document.createElement("div");
        win.id = "aua-gened-plugin-window";
        win.style.cssText = `
                position: fixed;
                top: 100px;
                right: 100px;
                width: 260px;
                background: #111;
                color: #fff;
                border: 1px solid #333;
                border-radius: 6px;
                font-size: 13px;
                z-index: 999999;
        `;



        // ----- Header Section -----

        // This is header part of the window which contains title, logo and close button
        const header = document.createElement("div");
        header.style.cssText = `
                background: ${AUA_BLUE};
                color: #ffffff;
                padding: 10px 8px 8px 8px;
                cursor: move;
                border-top-left-radius: 6px;
                border-top-right-radius: 6px;
        `;

        // Logo of header
        const imageContainer = document.createElement("div");
        imageContainer.style.cssText = `
                display: flex;
                justify-content: center;
                margin-bottom: 5px;
        `;
        const image = document.createElement("img");
        image.src = "https://aua.am/favicon.ico";
        image.style.cssText = `
                width: 32px;
                height: 32px;
        `;
        imageContainer.appendChild(image);
        header.appendChild(imageContainer);

        // Title of header
        const headerText = document.createElement("div");
        headerText.textContent = "AUA Gened Plugin";
        headerText.style.cssText = `
                font-size: 16px;
                font-weight: bold;
                margin-top: 4px;
                text-align: center;
        `;
        header.appendChild(headerText);

        // Movable behavior which lets to move window by dragging the header
        let dx, dy;
        header.onpointerdown = (e) => {
                dx = e.clientX - win.offsetLeft;
                dy = e.clientY - win.offsetTop;
                document.onpointermove = (e) => {
                        win.style.left = e.clientX - dx + "px";
                        win.style.top = e.clientY - dy + "px";
                };
                document.onpointerup = () => {
                        document.onpointermove = null;
                        document.onpointerup = null;
                };
        };

        // Close button of header 
        const closeButton = document.createElement("button");
        closeButton.textContent = "×";
        closeButton.title = "Close Window";
        closeButton.style.cssText = `
                position: absolute;
                top: 8px;
                right: 8px;
                width: 24px;
                height: 24px;
                border: none;
                background: #d32f2f;
                color: #fff;
                font-weight: bold;
                font-size: 16px;
                border-radius: 4px;
                cursor: pointer;
                line-height: 20px;
                text-align: center;
                padding: 0;
                transition: 0.2s;
        `;

        // Adding event listeners to close button for hover effect and click action
        closeButton.addEventListener("mouseenter", () => {
                closeButton.style.opacity = "0.8";
        });
        closeButton.addEventListener("mouseleave", () => {
                closeButton.style.opacity = "1";
        });
        closeButton.addEventListener("click", () => closeWindow()); // Calls closeWindow function on click

        // Adding close button to header
        header.appendChild(closeButton);



        // ----- Content Section -----

        // This is content part of the window which contains all interactive elements
        // Alll other elements will be added inside this content div
        const content = document.createElement("div");
        content.style.cssText = `
                padding: 10px;
                text-align: left;
                background: white;
        `;



        // ----- Search Section -----

        // Title for search section
        const searchTitle = document.createElement("div");
        searchTitle.textContent = "Search";
        searchTitle.style.cssText = `
                font-size: 15px;
                font-weight: bold;
                color: #002147;
                margin-bottom: 4px;
        `;

        // Adding search title to content
        content.appendChild(searchTitle);

        // Search input box
        const searchInput = document.createElement("input");
        searchInput.type = "text";
        searchInput.autofocus = true;
        searchInput.placeholder = "Search keywords";
        searchInput.style.cssText = `
                width: 100%;
                box-sizing: border-box;
        `;

        // Calling highlightRows function on input event
        searchInput.addEventListener("input", () => {
                highlightRows();
        });

        // Adding search input to content
        content.appendChild(searchInput);



        // ----- Themes Section -----

        // Title for themes section
        const themesTitle = document.createElement("div");
        themesTitle.textContent = "Themes";
        themesTitle.style.cssText = `
                color: ${AUA_BLUE};
                font-weight: bold;
                margin-top: 20px;
                margin-bottom: 6px;
                font-size: 16px;
        `;

        // Adding themes title to content
        content.appendChild(themesTitle);

        // Creating checkboxes for themes 1 to 9
        const checkboxes = [];

        // Container for theme checkboxes
        const themeContainer = document.createElement("div");
        themeContainer.style.cssText = `
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                justify-content: center;
        `;

        // Creating individual checkbox with label for each theme from 1 to 9
        for (let i = 1; i <= 9; i++) {
                // Wrapper for each individual checkbox and label
                const boxWrapper = document.createElement("div");
                boxWrapper.style.cssText = `
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        cursor: pointer;
                `;

                // Creating the checkbox input
                const cb = document.createElement("input");
                cb.type = "checkbox";
                cb.value = i;

                // Adding event listener to call highlightRows when checkbox state changes
                cb.addEventListener("change", () => {
                        highlightRows();
                });

                // Creating label text for the checkbox (which is just the theme number)
                const labelText = document.createElement("div");
                labelText.textContent = i;
                labelText.style.cssText = `
                        margin-top: 2px;
                        color: #555555;
                        font-size: 16px;
                        line-height: 26px;
                        font-weight: 400;
                        font-style: normal;
                `;

                // Adding checkbox and label text to wrapper container
                boxWrapper.append(cb, labelText);

                // Adding the wrapper container to the main themes container
                themeContainer.appendChild(boxWrapper);

                // Pushing checkbox element to array for later accessing and checking its state
                checkboxes.push(cb);
        }

        // Adding themes section container to content
        content.appendChild(themeContainer);



        // ----- Themes Mode Section -----

        // Creating themes mode title
        const modeTitle = document.createElement("div");
        modeTitle.textContent = "Themes Mode";
        modeTitle.style.cssText = `
                color: ${AUA_BLUE};
                font-weight: bold;
                margin-top: 20px;
                margin-bottom: 6px;
                font-size: 16px;
        `;

        // Adding modeTitle to content
        content.appendChild(modeTitle);

        // Creating (?) tooltip which explains for what is themes mode
        const tooltip = document.createElement("span");
        tooltip.textContent = "(?)";
        tooltip.title = "or: highlight if any selected theme matches\n \
                         and: highlight only if all selected themes match";
        tooltip.style.cssText = `
                cursor: help;
                color: ${AUA_BLUE};
                font-weight: bold;
                margin-left: 6px;
        `;

        // Adding that tooltip to modeTitle (next to the text)
        modeTitle.appendChild(tooltip);

        // Creating select dropdown for choosing themes mode (or/and)
        const selectMode = document.createElement("select");
        selectMode.style.cssText = `
                width: 100%;
                border: 1px solid ${AUA_BLUE};
                border-radius: 4px;
                padding: 4px 6px;
                background: #ffffff;
                color: ${AUA_BLUE};
                font-weight: normal;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.2s ease; /* smooth hover/focus effect */
        `;

        // Focus effect on select
        selectMode.addEventListener("focus", () => {
                selectMode.style.borderColor = "#001733";
                selectMode.style.boxShadow = "0 0 4px rgba(0,33,71,0.4)";
        });

        // Blur effect on select
        selectMode.addEventListener("blur", () => {
                selectMode.style.borderColor = `${AUA_BLUE}`;
                selectMode.style.boxShadow = "none";
        });

        // Creating options for select (or)
        const orOption = document.createElement("option");
        orOption.value = "or";
        orOption.textContent = "or";

        // Creating options for select (and)
        const andOption = document.createElement("option");
        andOption.value = "and";
        andOption.textContent = "and";

        // Adding options to select
        selectMode.appendChild(orOption);
        selectMode.appendChild(andOption);

        // Setting default value to "or"
        selectMode.value = "or";

        // Adding event listener to call highlightRows when mode changes
        selectMode.addEventListener("change", () => highlightRows());

        // Adding select to content
        content.appendChild(selectMode);



        // ----- Class Level Section -----

        // Creating class level title
        const levelTitle = document.createElement("div");
        levelTitle.textContent = "Class Level";
        levelTitle.style.cssText = `
                color: ${AUA_BLUE};
                font-weight: bold;
                margin-top: 20px;
                margin-bottom: 6px;
                font-size: 16px;
        `;

        // Adding levelTitle to content
        content.appendChild(levelTitle);

        // Creating checkboxes for class levels (lower/upper)
        const levelsContainer = document.createElement("div"); // container for neat left alignment
        levelsContainer.style.cssText = `
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                gap: 6px;
        `;

        // Function to create a labeled checkbox (just use this function twice for lower and upper)
        function createCheckbox(labelText, value, checked = true) {
                // Creating label element which will contain checkbox and text
                const label = document.createElement("label");
                label.style.cssText = `
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        color: ${AUA_BLUE}
                `;

                // Creating the checkbox input
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.addEventListener("change", () => {
                        highlightRows();
                });
                checkbox.value = value;
                checkbox.checked = checked; // By default both are checked
                checkbox.style.cursor = "pointer";

                // Appending checkbox and label text to label element
                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(labelText));

                // Returning the complete label element
                return label;
        }

        // Creating lower and upper level checkboxes using the function above (createCheckbox)
        const lowerLabel = createCheckbox("Lower", "lower");
        const upperLabel = createCheckbox("Upper", "upper");

        // Adding level checkboxes to levels container
        levelsContainer.appendChild(lowerLabel);
        levelsContainer.appendChild(upperLabel);

        // Adding levels section container to content
        content.appendChild(levelsContainer);



        // ----- Show Only Matching Section -----

        // Creating container for the button
        const showOnlyButtonContainer = document.createElement("div");
        showOnlyButtonContainer.style.cssText = `
                margin-top: 12px;
                padding-top: 6px;
                text-align: center;
        `;

        // Creating the "Show Only Matching" button
        const showOnlyButton = document.createElement("button");
        showOnlyButton.innerHTML = "Show only matching (<span  id='matchedCount'>0</span>)"; // includes matched count span
        showOnlyButton.style.cssText = `
                width: 100%;
                padding: 6px;
                border: 1px solid ${AUA_BLUE};
                border-radius: 4px;
                background: #ffffff;
                color: ${AUA_BLUE} !important;
                font-weight: bold;
                cursor: pointer;
                transition: 0.2s;
                margin-bottom: 8px;
                text-transform: none !important;
        `;

        // By default, showOnly is false
        let showOnly = false;

        // Adding hover effects to showOnlyButton
        showOnlyButton.addEventListener("mouseenter", () => {
                if (!showOnly)
                        showOnlyButton.style.setProperty("background", "#e0e0e0", "important");
        });

        // Adding mouseleave effects to showOnlyButton
        showOnlyButton.addEventListener("mouseleave", () => {
                if (!showOnly) {
                        showOnlyButton.style.setProperty("background", "#ffffff", "important");
                        showOnlyButton.style.setProperty("color", `${AUA_BLUE}`, "important");
                } else {
                        showOnlyButton.style.setProperty(
                                "background",
                                `${AUA_BLUE}`,
                                "important",
                        );
                        showOnlyButton.style.setProperty("color", "#ffffff", "important");
                }
        });

        // Show Only button click event to toggle showOnly state and highlight rows accordingly
        // but the actual hiding/showing is handled in highlightRows function which uses showOnly variable
        showOnlyButton.addEventListener("click", () => {
                // Reversing the showOnly state
                showOnly = !showOnly;

                // Updating button styles based on showOnly state
                if (showOnly) {
                        // If user wants to show only matching, change button styles to active state
                        showOnlyButton.style.setProperty(
                                "background",
                                `${AUA_BLUE}`,
                                "important",
                        );
                        showOnlyButton.style.setProperty("color", "#ffffff", "important");
                } else {
                        // If user wants to show all, revert button styles to default state
                        showOnlyButton.style.setProperty("background", "#ffffff", "important");
                        showOnlyButton.style.setProperty("color", `${AUA_BLUE}`, "important");
                }

                // Calling highlightRows to apply the showOnly filter
                highlightRows();
        });

        // Adding showOnlyButton to its container and then to content
        showOnlyButtonContainer.appendChild(showOnlyButton);
        content.appendChild(showOnlyButtonContainer);



        // ----- Footer Section -----

        // This is footer part of the window which contains social icons (yet)
        const footer = document.createElement("div");
        footer.style.cssText = `
                width: 100%;
                background: #002147;
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 14px;
                padding: 10px 0;
                border-bottom-left-radius: 6px;
                border-bottom-right-radius: 6px;
                box-sizing: border-box;
        `;

        // Function to create clickable social icons
        function createIcon(src, title, url) {
                // Creating image element for icon
                const icon = document.createElement("img");
                icon.src = src;
                icon.style.cssText = `
                        width: 22px;
                        height: 22px;
                        filter: invert(1);
                        cursor: pointer;
                `;
                icon.title = title;

                // Adding click event to open the url in new tab
                icon.addEventListener("click", () => {
                        window.open(url, "_blank");
                });

                // Returning the created icon element
                return icon;
        }

        // Creating GitHub icon using createIcon function
        const githubIcon = createIcon(
                "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/github.svg",
                "GitHub",
                "https://github.com/rezocrypt/aua-utils",
        );

        // Creating Telegram icon using createIcon function
        const telegramIcon = createIcon(
                "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/telegram.svg",
                "Telegram",
                "https://t.me/rezocrypt",
        );

        // Adding created social icons to footer
        footer.appendChild(githubIcon);
        footer.appendChild(telegramIcon);



        // ----- Section Assembly -----

        // Appending created sections to main window (only big sections because
        // smaller ones are already inside bigger ones)
        win.appendChild(header);
        win.appendChild(content);
        win.appendChild(footer);

        // Finally appending the complete window to document body
        document.body.appendChild(win);

        // ========== HTML Manipulation Logic ==========





        // ========== Logic Functionality ==========

        // Function to scroll to nearest matching row
        function scrollToNearestMatching() {
                const rows = table.querySelectorAll("tbody tr.matching");
                for (const row of rows) {
                        if (row.offsetParent !== null) {
                                // check if row is visible
                                row.scrollIntoView({ behavior: "smooth", block: "center" });
                                break;
                        }
                }
        }

        // This function seperates first row of the table into a new table above the original table
        // because first row is header and we want it to be always visible. It also sets table height to auto
        function setupTable() {
                table.style.height = "auto"; // keep height auto

                // Get the first row of the original table
                const firstRow = table.querySelector("tr");
                if (firstRow) {
                        // Create a new table
                        const newTable = document.createElement("table");
                        newTable.style.width = table.style.width || "100%"; // optional: match width
                        newTable.style.borderCollapse = "collapse"; // optional styling
                        newTable.appendChild(firstRow); // move first row into new table

                        // Insert the new table above the original table
                        table.parentNode.insertBefore(newTable, table);
                }
        }

        // Function to close the plugin window and show notification that it is just closing and not disabling
        function closeWindow() {
                // Remove main plugin window if it exists
                const win = document.getElementById("aua-gened-plugin-window");
                if (win) win.remove();

                // Generate and show notification
                const notif = document.createElement("div");
                notif.innerHTML = "⚠ Plugin not disabled! Disable it manually from the <b>Extension</b> or from <b>Tampermonkey</b>.";
                notif.style.cssText = `
                        position: fixed;
                        top: 20px;
                        left: 50%;
                        transform: translateX(-50%) translateY(-20px);
                        background: #fff3cd;
                        color: #856404;
                        padding: 10px 20px;
                        border-left: 5px solid #ffc107;
                        border-radius: 5px;
                        font-size: 14px;
                        box-shadow: 0 2px 6px rgba(0,0,0,0.15);
                        opacity: 0;
                        transition: opacity 0.4s ease, transform 0.4s ease;
                        z-index: 9999;
                        max-width: 90%;
                        text-align: center;
                        font-family: sans-serif;
                `;
                document.body.appendChild(notif);

                // Triggering animation for warning notification
                requestAnimationFrame(() => {
                        notif.style.opacity = "1";
                        notif.style.transform = "translateX(-50%) translateY(0)";
                });

                // Auto-remove notification after 4 seconds
                setTimeout(() => {
                        notif.style.opacity = "0";
                        notif.style.transform = "translateX(-50%) translateY(-20px)";
                        notif.addEventListener("transitionend", () => notif.remove());
                }, 4000);
        }

        // Function for updating matched count
        function updateMatchedCount() {
                const matchedCountSpan = document.getElementById("matchedCount");
                if (matchedCountSpan) {
                        matchedCountSpan.textContent = table.querySelectorAll("tbody tr.matching").length;
                }
        }

        // Variable to keep track of last scrolled index for Enter key navigation
        let lastScrolledIndex = -1;

        // Adding keydown event listener to search input for Enter and Shift+Enter key navigation
        searchInput.addEventListener("keydown", (e) => {
                if (e.key !== "Enter") return;

                const rows = Array.from(table.querySelectorAll("tbody tr.matching"))
                        .filter(row => row.offsetParent !== null);
                if (!rows.length) return;

                // Clear old temporary highlights
                rows.forEach(r => {
                        if (r.dataset.tempHighlight === "true") {
                                r.style.backgroundColor = "";
                                delete r.dataset.tempHighlight;
                        }
                });

                // Determine next index: Shift+Enter for previous
                if (e.shiftKey) {
                        lastScrolledIndex = (lastScrolledIndex - 1 + rows.length) % rows.length;
                } else {
                        lastScrolledIndex = (lastScrolledIndex + 1) % rows.length;
                }

                const row = rows[lastScrolledIndex];

                // Scroll to row
                row.scrollIntoView({ behavior: "smooth", block: "center" });

                // Temporary highlight
                row.dataset.tempHighlight = "true";
                const originalBg = row.style.backgroundColor;
                row.style.backgroundColor = "#ffcc33";
                setTimeout(() => {
                        row.style.backgroundColor = originalBg;
                        delete row.dataset.tempHighlight;
                }, 500);
        });



        // ----- Core Highlighting Logic -----

        // Main function which highlights rows based on selected filters
        function highlightRows() {

                // ===== 1. READ FILTER STATE =====

                // Selected themes
                const selectedThemes = new Set();
                checkboxes.forEach((cb) => {
                        if (cb.checked) selectedThemes.add(cb.value);
                });
                const areThereSelectedThemes = selectedThemes.size > 0;

                // Theme match mode (and / or)
                const mode = selectMode.value;

                // Search keywords
                const keywords = searchInput.value
                        .toLowerCase()
                        .split(/\s+/)
                        .filter(Boolean);
                const areThereEnteredKeywords = keywords.length > 0;

                // Selected class levels
                const selectedLevels = new Set();
                if (lowerLabel.querySelector("input").checked) selectedLevels.add("lower");
                if (upperLabel.querySelector("input").checked) selectedLevels.add("upper");

                // ===== 2. PROCESS TABLE ROWS =====

                table.querySelectorAll("tbody tr").forEach((row) => {

                        // --- 2.1 Read row data ---
                        const cells = row.children;
                        const levelText = cells[1]?.textContent || "";
                        const nameText = (cells[2]?.textContent || "").toLowerCase();
                        const themesText = cells[3]?.textContent || "";

                        const classLevel = levelText.startsWith("1") ? "lower" : "upper";

                        // --- 2.2 Level filter ---
                        let levelMatch = selectedLevels.has(classLevel);

                        // --- 2.3 Theme filter ---
                        const rowThemes = new Set();
                        const themeMatches = themesText.match(/\d+/g);
                        if (themeMatches) {
                                themeMatches.forEach((t) => rowThemes.add(t));
                        }

                        let themeMatch = false;
                        if (areThereSelectedThemes) {
                                if (mode === "and") {
                                        themeMatch = true;
                                        selectedThemes.forEach((t) => {
                                                if (!rowThemes.has(t)) themeMatch = false;
                                        });
                                } else {
                                        selectedThemes.forEach((t) => {
                                                if (rowThemes.has(t)) themeMatch = true;
                                        });
                                }
                        }

                        // --- 2.4 Keyword filter ---
                        let keywordMatch = false;
                        if (areThereEnteredKeywords) {
                                keywordMatch = true;
                                keywords.forEach((kw) => {
                                        if (!nameText.includes(kw)) keywordMatch = false;
                                });
                        }

                        // --- 2.5 Final match decision ---
                        const isMatch = levelMatch && (!areThereSelectedThemes || themeMatch) && (!areThereEnteredKeywords || keywordMatch);

                        // --- 2.6 Apply result ---
                        const isAnyFilterApplied =
                                areThereEnteredKeywords ||
                                areThereSelectedThemes ||
                                selectedLevels.size !== 2;

                        if (isMatch) {
                                row.classList.add("matching");
                                row.style.backgroundColor = isAnyFilterApplied ? "#ffff99" : "";
                                // If showOnly is true, we **still show matched rows**
                                row.style.display = "";
                        } else {
                                row.classList.remove("matching");
                                row.style.backgroundColor = "";
                                // If showOnly is true, hide non-matching rows; otherwise show them
                                row.style.display = showOnly ? "none" : "";
                        }



                });

                // ===== 3. POST-PROCESSING =====
                scrollToNearestMatching();
                updateMatchedCount();
        }

        // Call highlightRows initially to set everything up
        highlightRows();

        // ========== Logic Functionality ==========
})();
