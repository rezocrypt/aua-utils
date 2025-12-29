(function () {
    "use strict";

    // ----- Checking if we are in right place or no -----

    if (!location.href.includes("auasonis.jenzabarcloud.com/GENSRsC.cfm")) return;

    // ----- Global Variables And Constants -----

    let courses = [];
    let matchingCourses = [];
    let showOnly = false;
    let checkedDays = [];

    const dayCheckboxes = {};
    const availableTimes = [];
    const timeCheckboxes = {};

    const AUA_BLUE = "#002147";

    // This function generates a params object for fetching courses. This is complex because Jenzabar
    // doesn't provide automaticaly correct semester and year parameters so we need to find it by
    // ourselves.
    function getRequestParams(year = null, semester = null) {
        // Defining semesters information
        const semesters = [
            {
                id: "spring",
                index: 3,
                coursesBegin: "January 19",
                coursesEnd: "May 14",
            },
            {
                id: "summer",
                index: 4,
                coursesBegin: "June 15",
                coursesEnd: "August 7",
            },
            {
                id: "fall",
                index: 1,
                coursesBegin: "August 20",
                coursesEnd: "December 9",
            },
        ];

        // Here will be final result stored
        let matchedSemester = null;

        // Finding out for which semester we must show courses now (which idk why jenzabar DIDN'T)
        semesters.forEach((semester, index) => {
            // Parsing dates
            const semesterEndDate = semester.coursesEnd;
            const nextSemesterEndDate =
                semesters[index + 1]?.coursesEnd || semesters[0].coursesEnd;

            // Getting date objects
            const startDate = new Date(`${semesterEndDate}, 1900`);
            const endDate = new Date(
                `${nextSemesterEndDate}, ${1900 + (semesters[index + 1] ? 0 : 1)}`,
            );

            // Defining current date to compare with something but with year 1900
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            let formattedYear = null;
            const compareDate = new Date(`${semesters[0].coursesEnd}, 1900`);

            // Setting full year for comparing
            currentDate.setFullYear(1900);

            // Comparing to get the full year for request which needs to be something like 202526
            if (currentDate <= compareDate) {
                formattedYear = `${currentYear - 1}${currentYear % 100}`;
            } else {
                formattedYear = `${currentYear}${(currentYear % 100) + 1}`;
            }

            // Then setting to one more year if it is actually in spring semester (its too complex here)
            currentDate.setFullYear(1900 + (currentDate <= compareDate ? 1 : 0));

            // Finally checking if we are between the ends of our semester and the following semester
            if (startDate <= currentDate && currentDate <= endDate) {
                matchedSemester = semesters[semesters[index + 1] ? index + 1 : 0];
                matchedSemester["year"] = formattedYear;
            }
        });

        /* EXAMPLE const params = {chkschyear: "202526", chkschsem: "3", search: "" }; */

        // Defining finally the parameters
        const params = {
            chkschyear: year || matchedSemester.year,
            chkschsem: semester || matchedSemester.index,
            search: "",
        };

        // Returning
        return params;
    }

    // Defining initial params for first load of the plugin
    const params = getRequestParams();


    // ========== HTML Generation and Manipulation Logic ==========

    // Here I decided to use one function to create the entire window to keep things organized
    // which is not done in gened-plugin.js.
    function createWindow() {
        // ----- Main Window Section -----

        // Creating main window element inside which everything will be placed
        const win = document.createElement("div");
        win.id = "aua-courses-plugin-window";
        win.style.cssText = `
            position: fixed;
            top: 100px;
            right: 100px;
            height: auto;
            max-height: 80vh;
            width: 300px;
            background: white;
            color: #fff;
            border: 1px solid #333;
            border-radius: 6px;
            font-size: 13px;
            overflow: auto;
            z-index: 999999;
            resize: both;     /* bottom-right corner resize */
        `;



        // ----- Header Section -----

        // Creating header
        const header = document.createElement("div");
        header.style.cssText = `
            background: ${AUA_BLUE};
            color: #ffffff;
            padding: 10px 8px 8px 8px;
            cursor: move;
            border-top-left-radius: 6px;
            border-top-right-radius: 6px;
            position: sticky;
            top: 0;
            z-index: 10;
        `;

        // Creating image container for AUA log
        const imageContainer = document.createElement("div");
        imageContainer.style.cssText = `
            display: flex;
            justify-content: center;
            margin-bottom: 5px;
        `;

        // Creating the actual image using aua.am/favicon.ico in case of change
        const image = document.createElement("img");
        image.src = "https://aua.am/favicon.ico";
        image.style.cssText = `
            width: 32px;
            height: 32px;
        `;
        imageContainer.appendChild(image);

        // Appending image container to header
        header.appendChild(imageContainer);

        // Creating header text for plugin
        const headerText = document.createElement("div");
        headerText.textContent = "AUA Courses Plugin";
        headerText.style.cssText = `
            font-size: 16px;
            font-weight: bold;
            margin-top: 4px;
            text-align: center;
        `;

        // Appending header text to header
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
        closeButton.addEventListener("click", () => closeWindow());

        // Appending close button to header
        header.appendChild(closeButton);



        // ----- Content Section -----

        // Creating content container inside which will other interactive elements be placed
        const content = document.createElement("div");
        content.style.cssText = `
            padding: 10px;
            text-align: left;
            background: white;
            overflow: auto;
        `;



        // ----- Semester Section -----

        // Defining wrapper inside which will be semester title and select
        const semesterWrapper = document.createElement("div");
        semesterWrapper.style.cssText = `
            display: flex;
            align-items: center;
            margin-top: 10px;
            margin-bottom: 6px;
        `;

        // Defining semester title
        const semesterTitle = document.createElement("div");
        semesterTitle.textContent = "Semester";
        semesterTitle.style.cssText = `
            color: ${AUA_BLUE};
            font-weight: bold;
            font-size: 16px;
        `;

        // Appending semester title to wrapper
        semesterWrapper.appendChild(semesterTitle);

        // Defining semester select where will be semesters as options
        const selectSemester = document.createElement("select");
        selectSemester.id = "semesterSelect";
        selectSemester.style.cssText = `
            margin-left: auto;
            width: 120px;  // adjust width for semester
            border: 1px solid ${AUA_BLUE};
            border-radius: 4px;
            padding: 4px 6px;
            background: #ffffff;
            color: ${AUA_BLUE};
            font-weight: normal;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s ease;
        `;

        // Defining semester options (for some reason semester values are 3,4,1 for spring, summer, fall)
        // ask to jenzabar why
        const semesters = [
            { value: "3", text: "Spring" },
            { value: "4", text: "Summer" },
            { value: "1", text: "Fall" },
        ];

        // Appending semesters as options to select
        semesters.forEach((sem) => {
            const opt = document.createElement("option");
            opt.value = sem.value;
            opt.textContent = sem.text;
            selectSemester.appendChild(opt);
        });


        // Append after 100ms to avoid JCF interference (otherwise JCF overrides it)
        setTimeout(() => {
            semesterWrapper.appendChild(selectSemester);
        }, 100);


        // Appending semesterWrapper to content
        content.appendChild(semesterWrapper);



        // ----- Year Section -----

        // Defining wrapper for year title and input
        const yearWrapper = document.createElement("div");
        yearWrapper.style.cssText = `
            display: flex;
            align-items: center;
            margin-top: 10px;
            margin-bottom: 6px;
        `;

        // Defining year title element
        const yearTitle = document.createElement("div");
        yearTitle.textContent = "Year";
        yearTitle.style.cssText = `
            color: ${AUA_BLUE};
            font-weight: bold;
            font-size: 16px;
        `;

        // Appending year title to wrapper
        yearWrapper.appendChild(yearTitle);

        // Defining year input element (first I was going to use select but 
        // someone may want to enter custom year like 202021 and that would be impossible.
        // So input is better here (at least I think so).    
        const inputYear = document.createElement("input");
        inputYear.id = "yearInput";
        inputYear.type = "text";
        inputYear.value = params.chkschyear;
        inputYear.style.cssText = `
            margin-left: auto;
            width: 120px;  
            border: 1px solid ${AUA_BLUE};
            border-radius: 4px;
            padding: 4px 6px;
            background: #ffffff;
            color: ${AUA_BLUE};
            font-weight: normal;
            font-size: 13px;
            box-sizing: border-box;
            cursor: text;
            transition: all 0.2s ease;
        `;

        // Appending year input to wrapper
        yearWrapper.appendChild(inputYear);

        // Append after 100ms to avoid JCF interference
        yearTitle.insertAdjacentElement("afterend", inputYear);

        // Appending yearWrapper to content
        content.appendChild(yearWrapper);


        // ----- Reload Button Section -----

        // This butto sends data to fetchCourses function to fetch courses with current semester and year
        // that user entered in inputs selectSemester and inputYear.
        const reloadButton = document.createElement("button");
        reloadButton.textContent = "Reload";
        reloadButton.style.cssText = `
            width: 100%;
            margin-top: 10px;
            margin-bottom: 5px;
            padding: 8px;
            border: 1px solid ${AUA_BLUE};
            background: #fff;
            cursor: pointer;
            color: ${AUA_BLUE};
            font-weight: bold;
            transition: all 0.2s ease;
        `;

        // Appending relad button to content
        content.appendChild(reloadButton);

        // Hover effect
        reloadButton.addEventListener("mouseenter", () => {
            reloadButton.style.background = AUA_BLUE;
            reloadButton.style.color = "#fff";
        });
        reloadButton.addEventListener("mouseleave", () => {
            reloadButton.style.background = "#fff";
            reloadButton.style.color = AUA_BLUE;
        });

        // Click effect
        reloadButton.addEventListener("mousedown", () => {
            reloadButton.style.transform = "scale(0.97)";
        });
        reloadButton.addEventListener("mouseup", () => {
            reloadButton.style.transform = "scale(1)";
        });

        // The event that calls fetchCourses function
        reloadButton.addEventListener("click", () => fetchCourses());



        // ----- Show Only Matching Button Section -----

        // This button shows only matching courses when clicked and hides non-matching ones.

        // Creates container for show only matching button
        const bottomContainer = document.createElement("div");
        bottomContainer.style.cssText = `
            margin-top: 5px;
            padding-top: 6px;
            text-align: center;
        `;

        // Creating the actual button
        const showOnlyButton = document.createElement("button");
        showOnlyButton.innerHTML = `
            Show only matching ( <span style="font-size: 12px;" id="matchedCount">0</span> )
        `;
        showOnlyButton.id = "showOnlyButton";
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
            margin-bottom: 15px;
        `;

        // Hover effect
        showOnlyButton.addEventListener("mouseenter", () => {
            showOnlyButton.style.background = AUA_BLUE;
            showOnlyButton.style.color = "#fff";
        });
        showOnlyButton.addEventListener("mouseleave", () => {
            if (!showOnly) {
                showOnlyButton.style.background = "#fff";
                showOnlyButton.style.color = AUA_BLUE;
            }
        });

        // Click effect
        showOnlyButton.addEventListener("mousedown", () => {
            showOnlyButton.style.transform = "scale(0.97)";
        });
        showOnlyButton.addEventListener("mouseup", () => {
            showOnlyButton.style.transform = "scale(1)";
        });

        // Toggle functionality
        showOnlyButton.addEventListener("click", () => {
            // Toggling showOnly variable
            showOnly = !showOnly;

            // Updating button styles based on state
            if (showOnly) {
                showOnlyButton.style.setProperty(
                    "background",
                    `${AUA_BLUE}`,
                    "important",
                );
                showOnlyButton.style.setProperty("color", "#ffffff", "important");
            } else {
                showOnlyButton.style.setProperty("background", "#ffffff", "important");
                showOnlyButton.style.setProperty("color", `${AUA_BLUE}`, "important");
            }

            // Finally calling highlightRows to apply the changes
            highlightRows();
        });

        // Appending show only button to bottom container and then to content
        bottomContainer.appendChild(showOnlyButton);
        content.appendChild(bottomContainer);



        // ----- Search Input Section -----

        // Creating search title
        const searchTitle = document.createElement("div");
        searchTitle.textContent = "Search";
        searchTitle.style.cssText = `
            font-size: 15px;
            font-weight: bold;
            color: #002147;
            margin-bottom: 4px;
        `;
        content.appendChild(searchTitle);

        // Creating search input
        const searchInput = document.createElement("input");
        searchInput.autofocus = true;
        searchInput.type = "text";
        searchInput.id = "searchInput";
        searchInput.placeholder = "Search keywords";
        searchInput.style.cssText = `
            width: 100%;
            box-sizing: border-box;
        `;

        // Using debounce to avoid too many calls while user is typing
        // so if it is typing like f r e s h m a n it won't call highlightRows
        // for each letter but only after user stops typing for 500ms
        let debounceTimer;
        searchInput.addEventListener("input", () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                highlightRows();
            }, 500); // 500ms delay after user stops typing
        });

        // Appending search input to content
        content.appendChild(searchInput);




        // ----- Clear Filters Button Section -----

        // This button clears all filters (search input, day checkboxes, time checkboxes)

        // Creating the actual button
        const clearFiltersButton = document.createElement("button");
        clearFiltersButton.textContent = "Clear Filters";
        clearFiltersButton.style.cssText = `
            width: 100%;
            margin-top: 15px;
            margin-bottom: 5px;
            padding: 8px;
            border: 1px solid ${AUA_BLUE};
            background: #fff;
            cursor: pointer;
            color: ${AUA_BLUE};
            font-weight: bold;
            transition: all 0.2s ease;
        `;

        // Appending clear filters button to content
        content.appendChild(clearFiltersButton);

        // Hover effect
        clearFiltersButton.addEventListener("mouseenter", () => {
            clearFiltersButton.style.background = AUA_BLUE;
            clearFiltersButton.style.color = "#fff";
        });
        clearFiltersButton.addEventListener("mouseleave", () => {
            clearFiltersButton.style.background = "#fff";
            clearFiltersButton.style.color = AUA_BLUE;
        });

        // Click effect
        clearFiltersButton.addEventListener("mousedown", () => {
            clearFiltersButton.style.transform = "scale(0.97)";
        });
        clearFiltersButton.addEventListener("mouseup", () => {
            clearFiltersButton.style.transform = "scale(1)";
        });

        // Call your function
        clearFiltersButton.addEventListener("click", () => clearFilters());




















        // ----- GenEd Section -----

        // Title (dropdown toggle)
        const genedTitle = document.createElement("div");
        genedTitle.style.cssText = `
    color: ${AUA_BLUE};
    font-weight: bold;
    margin-top: 20px;
    margin-bottom: 6px;
    font-size: 16px;
    cursor: pointer;
    user-select: none;
    display: flex;
    align-items: center;
    gap: 6px;
`;

        const genedArrow = document.createElement("span");
        genedArrow.textContent = "▸"; // closed by default
        genedArrow.style.fontSize = "12px";

        const genedTitleText = document.createElement("span");
        genedTitleText.textContent = "GenEd";

        genedTitle.appendChild(genedArrow);
        genedTitle.appendChild(genedTitleText);
        content.appendChild(genedTitle);

        // Container
        const genedContainer = document.createElement("div");
        genedContainer.style.cssText = `
    display: none; /* closed by default */
    grid-template-columns: repeat(2, 1fr);
    gap: 6px 12px;
    margin-bottom: 10px;
`;
        content.appendChild(genedContainer);

        // Toggle logic
        let genedVisible = false; // closed by default
        genedTitle.addEventListener("click", () => {
            genedVisible = !genedVisible;
            genedContainer.style.display = genedVisible ? "grid" : "none";
            genedArrow.textContent = genedVisible ? "▾" : "▸";
        });

        // helper: small subtitle
        function createGenedSubtitle(text) {
            const el = document.createElement("div");
            el.textContent = text;
            el.style.cssText = `
        color: ${AUA_BLUE};
        font-weight: bold;
        margin-top: 10px;
        margin-bottom: 4px;
        font-size: 14px;
        user-select: none;
    `;
            return el;
        }

        // Only Gened button part
        genedContainer.appendChild(createGenedSubtitle("Only GenEd"));

        const onlyGenedLabel = document.createElement("label");
        onlyGenedLabel.style.cssText = `
            grid-column: span 2;
            display: flex;
            align-items: center;
            font-size: 13px;
            cursor: pointer;
            color: ${AUA_BLUE};
        `;

        const onlyGenedCheckbox = document.createElement("input");
        onlyGenedCheckbox.type = "checkbox";
        onlyGenedCheckbox.id = "only-gened-checkbox";
        onlyGenedCheckbox.style.marginRight = "6px";
        onlyGenedCheckbox.addEventListener("change", highlightRows);

        onlyGenedLabel.appendChild(onlyGenedCheckbox);
        onlyGenedLabel.appendChild(document.createTextNode("Show only GenEd courses"));
        genedContainer.appendChild(onlyGenedLabel);

        // ----- Themes -----
        genedContainer.appendChild(createGenedSubtitle("Themes"));

        const themeContainer = document.createElement("div");
        themeContainer.style.cssText = `
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
    grid-column: span 2;
`;

        const themeCheckboxes = [];

        for (let i = 1; i <= 9; i++) {
            const boxWrapper = document.createElement("div");
            boxWrapper.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
    `;

            const cb = document.createElement("input");
            cb.type = "checkbox";
            cb.id = `gened-theme-${i}-checkbox`
            cb.value = i;
            cb.addEventListener("change", highlightRows);

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

            boxWrapper.append(cb, labelText);
            themeContainer.appendChild(boxWrapper);
            themeCheckboxes.push(cb);
        }

        genedContainer.appendChild(themeContainer);

        // ----- Themes Mode -----
        genedContainer.appendChild(createGenedSubtitle("Themes Mode"));

        const modeLabel = document.createElement("div");
        modeLabel.style.cssText = `
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: ${AUA_BLUE};
`;

        // Add explanatory tooltip
        const tooltip = document.createElement("span");
        tooltip.textContent = "(?)";
        tooltip.title = "or: highlight if any selected theme matches\nand: highlight only if all selected themes match";
        tooltip.style.cssText = `
    cursor: help;
    color: ${AUA_BLUE};
    font-weight: bold;
`;

        modeLabel.appendChild(document.createTextNode("Mode:"));
        modeLabel.appendChild(tooltip);

        const selectMode = document.createElement("select");
        selectMode.id = "select-gened-theme-mode"
        selectMode.style.cssText = `
    border: 1px solid ${AUA_BLUE};
    border-radius: 4px;
    padding: 4px 6px;
    background: #ffffff;
    color: ${AUA_BLUE};
    font-weight: normal;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
`;

        ["or", "and"].forEach(mode => {
            const option = document.createElement("option");
            option.value = mode;
            option.textContent = mode; // lowercase
            selectMode.appendChild(option);
        });

        selectMode.value = "or";
        selectMode.addEventListener("change", highlightRows);

        modeLabel.appendChild(selectMode);
        genedContainer.appendChild(modeLabel);

        // ----- Class Level -----
        genedContainer.appendChild(createGenedSubtitle("Class Level"));

        const levelsContainer = document.createElement("div");
        levelsContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    grid-column: span 2;
`;

        function createCheckbox(labelText, value, checked = true) {
            const label = document.createElement("label");
            label.style.cssText = `
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
        color: ${AUA_BLUE};
    `;

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = value;
            checkbox.id = `gened-class-level-${value}`;
            checkbox.checked = checked;
            checkbox.style.cursor = "pointer";
            checkbox.addEventListener("change", highlightRows);

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(labelText));
            return label;
        }

        const lowerLabel = createCheckbox("Lower", "lower");
        const upperLabel = createCheckbox("Upper", "upper");

        levelsContainer.appendChild(lowerLabel);
        levelsContainer.appendChild(upperLabel);

        genedContainer.appendChild(levelsContainer);


















        // ----- Weekdays Filter (TOGGLE) Section -----

        // Weekdays title (clickable for toggle)
        const weekdaysTitle = document.createElement("div");
        weekdaysTitle.style.cssText = `
            color: ${AUA_BLUE};
            font-weight: bold;
            margin-top: 20px;
            margin-bottom: 6px;
            font-size: 16px;
            cursor: pointer;
            user-select: none;
            display: flex;
            align-items: center;
            gap: 6px;
        `;

        // Arrow for toggling the weekdays container as dropdown
        const arrow = document.createElement("span");
        arrow.textContent = "▾"; // open
        arrow.style.fontSize = "12px";

        // Title text (I played lot with Chatgpt that's why it is created separately two titles)
        const titleText = document.createElement("span");
        titleText.textContent = "Weekdays";

        // Appending arrow and title to weekdays title
        weekdaysTitle.appendChild(arrow);
        weekdaysTitle.appendChild(titleText);

        // Appending weekdays title to content
        content.appendChild(weekdaysTitle);

        // Creating container for weekdays' checkboxes
        const weekdaysContainer = document.createElement("div");
        weekdaysContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 6px 12px;
            margin-bottom: 10px;
        `;

        // Appending weekdays container to content
        content.appendChild(weekdaysContainer);

        // Logic for toggling weekdays container when clicking the title
        let weekdaysVisible = true;
        weekdaysTitle.addEventListener("click", () => {
            weekdaysVisible = !weekdaysVisible;
            weekdaysContainer.style.display = weekdaysVisible ? "grid" : "none";
            arrow.textContent = weekdaysVisible ? "▾" : "▸";
        });

        // Weekday options (I used these codes because they are present in course times but
        // for names I think it is better to have full names. I haven't use to be determined
        // because it is too long and I do not know CSS good enough).
        const days = [
            { code: "MON", name: "Monday" },
            { code: "TUE", name: "Tuesday" },
            { code: "WED", name: "Wednesday" },
            { code: "THU", name: "Thursday" },
            { code: "FRI", name: "Friday" },
            { code: "SAT", name: "Saturday" },
            { code: "TBD", name: "Unknown" },
        ];

        // Creating checkboxes for each weekday using the days array and foreach
        days.forEach((day) => {
            // Creating label for checkbox and text
            const label = document.createElement("label");
            label.style.cssText = `
                display: flex;
                align-items: center;
                font-size: 13px;
                cursor: pointer;
                color: ${AUA_BLUE};
            `;

            // Creating the actual checkbox element
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = day.code;
            checkbox.style.marginRight = "6px";

            // Adding event listener to checkbox to update checkedDays and highlight rows when changed
            checkbox.addEventListener("change", () => highlightRows());

            // Appending checkbox and text to label
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(day.name));

            // Appending label to weekdays container
            weekdaysContainer.appendChild(label);

            // Storing checkbox in dayCheckboxes object for later use and reference
            dayCheckboxes[day.code] = checkbox;
        });





        // ----- Times Filter (TOGGLE) Section -----

        // This is actually complex thing. Depending on available times in courses matching
        // the search and weekdays filters, the available times checkboxes are generated 

        // Times title (clickable for toggle)
        const timesTitle = document.createElement("div");
        timesTitle.style.cssText = `
            color: ${AUA_BLUE};
            font-weight: bold;
            margin-top: 20px;
            margin-bottom: 6px;
            font-size: 16px;
            cursor: pointer;
            user-select: none;
            display: flex;
            align-items: center;
            gap: 6px;
`;

        // Arrow for toggling times container
        const timesArrow = document.createElement("span");
        timesArrow.textContent = "▸"; // collapsed initially
        timesArrow.style.fontSize = "12px";

        // Title text
        const timesText = document.createElement("span");
        timesText.textContent = "Times";

        // Appending arrow and title to times title
        timesTitle.appendChild(timesArrow);
        timesTitle.appendChild(timesText);

        // Appending times title to content
        content.appendChild(timesTitle);

        // Container for actual time options (checkboxes)
        const timesContainer = document.createElement("div");
        timesContainer.id = "timesContainer";
        timesContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 6px;
            margin-bottom: 10px;
        `;

        // Appending times container to content
        content.appendChild(timesContainer);

        // Logic for toggling times container when clicking the title
        let timesVisible = false; // default not visible
        timesContainer.style.display = "none"; // hide initially
        timesTitle.addEventListener("click", () => {
            timesVisible = !timesVisible;
            timesContainer.style.display = timesVisible ? "grid" : "none";
            timesArrow.textContent = timesVisible ? "▾" : "▸";
        });







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
            flex-shrink: 0; /* keep footer height fixed */
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



        // ----- Window Assembly Section -----

        // Appending created sections to main window (only big sections because
        // smaller ones are already inside bigger ones)
        win.appendChild(header);
        win.appendChild(content);
        win.appendChild(footer);

        // Finally appending the window to body
        document.body.appendChild(win);
    }


    // ========== HTML Generation and Manipulation Logic ==========




    // ========== Logic Functionality ==========

    // This function is for clearing unnecessary things from the page before loading
    function clearFromUnnecessaryElements() {
        // This is main table where the rows will be REPLACED with new fetched ones (not clearing yet)
        const coursesDiv = document.querySelector(".table-responsive");

        // This form for search is not necessary and must be removed
        document.querySelector(".update-form")?.remove();

        // This heading text Courses By Semester is not necessary and must be removed
        document.querySelector(".heading-wrap")?.remove();
    }

    // Main function that is called when we got fetched
    function afterFetch(html) {
        // Preventing multiple fetches at the same time
        window.nowIsFetching = true;

        // Creating parser that parses the html content to doc variable
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        // Defining table that we got from fetch and table which we need to replace.
        const coursesTableParsed = doc.getElementById("crsbysemester");
        const coursesDiv = document.querySelector(".table-responsive");

        //Clearing original table content
        if (coursesDiv) {
            coursesDiv.innerHTML = "";
        }

        // Checking if both exist and replacing the original table with fetched one.
        if (coursesTableParsed && coursesDiv) {

            // Appending fetched table to the page (replacing with fetched courses)
            coursesDiv.appendChild(coursesTableParsed);

            // Updating courses array
            updateCoursesArray();
        } else {
            // In case of something went wrong but idk why code enters here because it calls afterFetch few times
            // Maybe because of fetchCourses being called multiple times.
            console.log("Either crsbysemester or table-responsive not found.");

            // Stopping loading animation
            stopLoadingAnimation();

            // Allowing new fetches
            window.nowIsFetching = false;
        }



        // ----- Setting Inputs to Current Semester and Year -----

        // Setting semester and year inputs to current values
        const selectSemester = document.querySelector("#semesterSelect"); // or your reference
        const inputYear = document.querySelector("#yearInput");

        // Change select to current semester and year (if by any reason they are empty)
        if (selectSemester.value === "") {
            selectSemester.value = params.chkschsem;
        }
        if (inputYear.value === "") {
            inputYear.value = params.chkschyear;
        }

        // Setupping gened content
        setupGeneds();

        // Clearing elements that are not needed
        clearFromUnnecessaryElements();

        // Generating available times for courses
        generateAvailableTimesOfAllCourses();

        // Parsing available times to checkboxes
        parseAvailableTimesToCheckboxes(availableTimes);

        // Clicking show only matches button for by default showing only matching courses
        !showOnly && document.getElementById("showOnlyButton")?.click();

        // Highlighting rows after all is done
        highlightRows();

        // Calling some additional design things that must be applied before showing
        setupAdditionalDesign();

        // Stopping loading animation
        stopLoadingAnimation();

        // Allowing new fetches
        window.nowIsFetching = true;

    }

    // Fetching to same origin to request courses.
    // By default we get all courses because in params "search=" which means
    // send me all courses. Believe me, now browsers are fast enough in terms of 
    // rendering and performing network requests for each filter it will take 
    // decades. So fetching all courses once and then filtering them on client side is
    // the best approach here (at least I think so).
    async function fetchCourses() {
        // Starting loading animation
        startLoadingAnimation();

        // Getting current values from inputs
        const selectSemester = document.querySelector("#semesterSelect");
        const inputYear = document.querySelector("#yearInput");

        // Getting params from inputs
        const currentParams = getRequestParams(
            inputYear?.value || null,
            selectSemester?.value || null,
        );

        // Fetching with new params FETCH WORKS BECAUSE IT IS NOT CROSS-ORIGIN and that's
        // the reason why I chose to make plugin and not static website.
        fetch("https://auasonis.jenzabarcloud.com/GENSRsC.cfm", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(currentParams),
        })
            .then((res) => res.text())
            .then(afterFetch)
            .catch((err) => console.log("Error fetching courses:", err));
    }

    // Update courses array from the table
    function updateCoursesArray() {

        // Getting all matching rows
        const rows = getRows();

        // Clearing previous courses
        courses = [];

        // Parsing each row to get course details
        rows.forEach((row) => {

            // Getting all cells in the row
            const cells = row.querySelectorAll("td");

            // Getting title and section spans
            const titleSpan = cells[0].querySelector(".title");
            const sectionSpan = cells[0].querySelector(".crsbysemester_course_id");

            // Defining the course data object where all parsed data will be stored
            const courseObj = {
                name: titleSpan?.textContent.trim() || "",
                code: sectionSpan?.textContent.replace(/[()]/g, "").trim() || "",
                section: cells[1]?.textContent.trim() || "",
                session: cells[2]?.textContent.trim() || "",
                credits: cells[3]?.textContent.trim() || "",
                campus: cells[4]?.textContent.trim() || "",
                instructor: cells[5]?.textContent.trim() || "",
                times: cells[6]?.textContent.trim() || "",
                takenSeats: cells[7]?.textContent.trim() || "",
                deliveryMethod: cells[10]?.textContent.trim() || "",
                location: cells[11]?.textContent.trim() || "",
            };

            // Pushing course object to courses array
            courses.push(courseObj);
        });
    }

    // Function for updating checked weekdays
    function updateCheckedWeekdays() {
        const checkboxKeywords = [];

        // Looping through dayCheckboxes to see which are checked
        // and marking each as keyword (because the codes that i used
        // are present in course times string)
        for (const code in dayCheckboxes) {
            // If checked, add to keywords
            if (dayCheckboxes[code].checked) {
                checkboxKeywords.push(code);
            }
        }

        // Finally updating checkedDays array with new keywords
        checkedDays = checkboxKeywords;
    }

    // Scrolling to nearest matching row
    function scrollToNearestMatching() {

        // Getting all matching rows
        const rows = getMatchingRows();

        // Scrolling to the first visible matching row
        for (const row of rows) {
            if (row.offsetParent !== null) {
                row.scrollIntoView({ behavior: "smooth", block: "center" });
                break;
            }
        }
    }

    // Variable to keep track of last scrolled index for Enter key navigation
    let lastScrolledIndex = -1;

    // Setting up Enter key navigation in search input
    function setupSearchInputEnterNavigation() {
        const searchInputElement = document.getElementById("searchInput");

        searchInputElement.addEventListener("keydown", (e) => {
            if (e.key !== "Enter") return;

            const rows = Array.from(getMatchingRows() || []).filter(row => row.offsetParent !== null);
            if (!rows.length) return;

            // Clear old temporary highlights
            rows.forEach(r => {
                if (r.dataset.tempHighlight === "true") {
                    // Restore the previous color stored in data attribute
                    r.style.backgroundColor = r.dataset.originalBg || "";
                    delete r.dataset.tempHighlight;
                    delete r.dataset.originalBg;
                }
            });

            // Update index
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

            // Store current color before temporary highlight
            row.dataset.originalBg = getComputedStyle(row).backgroundColor;
            row.style.backgroundColor = "#f7f183ff";

            setTimeout(() => {
                row.style.backgroundColor = row.dataset.originalBg;
                delete row.dataset.tempHighlight;
                delete row.dataset.originalBg;
            }, 500);
        });
    }

    // Function for extracting the rows from courses table
    function getRows() {
        // Getting the table
        const table = document.getElementById("crsbysemester");

        // If table not found, return but for sure this will cause lot of errors
        if (!table) return;

        // Getting all rows with matching class
        const rows = table.querySelectorAll("tbody tr");

        // Returning the rows
        return rows;
    }

    // Function for extracting matching rows from courses table
    function getMatchingRows() {
        // Getting the table
        const table = document.getElementById("crsbysemester");

        // If table not found, return but for sure this will cause lot of errors
        if (!table) return;

        // Getting all rows with matching class
        const rows = table.querySelectorAll("tbody tr.matching");

        // Returning the rows
        return rows;
    }

    // Generating available times for courses. It goes through courses
    // and extracts times using regex and adds to availableTimes array
    // if they match the regex and are not already present.
    function generateAvailableTimesOfAllCourses() {
        courses.forEach((course) => {
            // Selecting the matching times using regex. So we will get extracted array 
            // of times like ["9:00am-10:15am", "11:00am-12:15pm"]
            const times = course.times.match(
                /\b\d{1,2}:\d{2}(?:am|pm)-\d{1,2}:\d{2}(?:am|pm)\b/gi,
            );

            // If no times found, skip
            if (times === null) return;

            // Adding each time to availableTimes if not already present
            times.forEach((time) => {
                if (!availableTimes.includes(time)) {
                    availableTimes.push(time);
                }
            });
        });

        // Sorting available times to be from earliest to latest but I forgot
        // to implement proper time sorting so it is just alphabetical for now
        // but I think it is not too complex to fix.
        availableTimes.sort();
    }

    // Parse avialbale times to checkboxes
    function parseAvailableTimesToCheckboxes(availableTimes) {

        // Getting times container where we will add/remove checkboxes
        const timesContainer = document.getElementById("timesContainer");

        // Remove unchecked checkboxes (like this is helpful when from old matching some
        // times are checked by user and its not good to remove them automatically)
        Object.keys(timeCheckboxes).forEach((time) => {
            const checkbox = timeCheckboxes[time];
            if (!checkbox.checked) {
                checkbox.parentElement.remove(); // remove label from DOM
                delete timeCheckboxes[time];
            }
        });

        // Add new checkboxes
        availableTimes.forEach((time) => {

            // Skip if already exists (or checked)
            if (timeCheckboxes[time]) {
                return;
            }

            // Creating label for checkbox and text
            const label = document.createElement("label");
            label.style.cssText = `
                display: flex;
                align-items: center;
                font-size: 13px;
                cursor: pointer;
                color: ${AUA_BLUE};
            `;

            // Creating the actual checkbox element
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = time;
            checkbox.style.marginRight = "6px";

            // Adding event listener to checkbox to update checkedDays and highlight rows when changed
            checkbox.addEventListener("change", () => highlightRows("time-filter"));

            // Appending checkbox and text to label
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(time));

            // Appending label to times container
            timesContainer.appendChild(label);

            // Storing checkbox in timeCheckboxes object for later use and reference
            timeCheckboxes[time] = checkbox;
        });

    }


    // Function for updating matched count
    function updateMatchedCount() {
        const matchedCountSpan = document.getElementById("matchedCount");
        if (matchedCountSpan) {
            matchedCountSpan.textContent = matchingCourses.length;
        }
    }

    // Function for closing the plugin window
    function closeWindow() {
        // Getting the window element
        const win = document.getElementById("aua-courses-plugin-window");
        if (win) win.remove();

        // Creating notification element to notify that this is one time action and after
        // refreshing it will still be enabled.
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

        // Appending notification to body
        document.body.appendChild(notif);

        // Triggering animation
        requestAnimationFrame(() => {
            notif.style.opacity = "1";
            notif.style.transform = "translateX(-50%) translateY(0)";
        });

        // Removing notification after 4 seconds
        setTimeout(() => {
            notif.style.opacity = "0";
            notif.style.transform = "translateX(-50%) translateY(-20px)";
            notif.addEventListener("transitionend", () => notif.remove());
        }, 4000);
    }


    // Function for clearing all filters
    function clearFilters() {
        // Clear search input
        const searchInput = document.getElementById("searchInput");
        if (searchInput) {
            searchInput.value = "";
        }

        // Clear day checkboxes
        for (const code in dayCheckboxes) {
            dayCheckboxes[code].checked = false;
        }

        // Clear time checkboxes
        for (const time in timeCheckboxes) {
            timeCheckboxes[time].checked = false;
        }

        // Update checked days
        updateCheckedWeekdays();


        // // Clear Geneds

        // Resetting only gened and class upper and lower level
        document.getElementById("only-gened-checkbox").checked = false;
        document.getElementById("gened-class-level-lower").checked = true;
        document.getElementById("gened-class-level-upper").checked = true;

        // Unchecking themes checkboxes
        for (let i = 1; i <= 9; i++) {
            const themeCheckbox = document.getElementById(`gened-theme-${i}-checkbox`);
            themeCheckbox.checked = false;
        }


        // Highlight rows again
        highlightRows();
    }

    // Function for additional design setup
    function setupAdditionalDesign() {
        // Function for making column with given index invisible
        function makeColumnInvisible(index) {
            document.querySelectorAll("table tr").forEach((row, rowIndex) => {
                const cells = row.querySelectorAll("th, td"); // get both th and td
                const cell = cells[index];
                if (cell) cell.style.display = "none";
            });

        }

        const table = document.getElementById('crsbysemester');
        const tableHeaders = table.querySelectorAll('th');


        // Iterating through headers to add them functionality for collapsing the column
        // useful for columns that are always empty
        tableHeaders.forEach((header, index) => {
            header.style.cssText = `
                text-align: center;
                border: 1px solid rgba(0,0,0,0.17);
                cursor: pointer;
                transition: background-color 0.3s, color 0.3s;
                position: relative;
            `;

            // Tooltip element
            const tooltip = document.createElement("span");
            tooltip.textContent = "Click to remove column";
            tooltip.style.cssText = `
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%);
                background-color: #ff4d4d;
                color: #fff;
                padding: 2px 6px;
                font-size: 12px;
                border-radius: 3px;
                white-space: nowrap;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.2s;
            `;
            header.appendChild(tooltip);

            // Hover effect
            header.addEventListener("mouseenter", () => {
                header.style.backgroundColor = "#ff4d4d";
                header.style.color = "#fff";
                tooltip.style.opacity = "1";
            });

            header.addEventListener("mouseleave", () => {
                header.style.backgroundColor = "";
                header.style.color = "";
                tooltip.style.opacity = "0";
            });

            // Click to remove column
            header.onclick = () => {
                makeColumnInvisible(index);
            };
        });

    }


    // Start loading animation (which is AUA logo just rotating in the middle with blue border)
    function startLoadingAnimation() {

        // If it exists already, do not create another
        if (document.getElementById("centerLoader")) return;

        // Creating the main loader element
        const loader = document.createElement("div");
        loader.id = "centerLoader";
        loader.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 50px;
            height: 50px;
            border: 5px solid #e0e0e0;
            border-top: 5px solid #002147;
            border-radius: 50%;
            animation: spinLoader 1s linear infinite;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;

        // Creating the image element inside loader
        const img = document.createElement("img");
        img.src = "https://play-lh.googleusercontent.com/lPU7TDhLFw2IfDxV_lEFw-YGSXnN7SgR-ybL4hQsNneceUR3mNxcwKV4NdZuKBf1daU=w240-h480-rw";
        img.style.cssText = `
            width: 80%;
            height: 80%;
            border-radius: 50%;
        `;

        // Appending image to loader
        loader.appendChild(img);

        // Appending loader to body
        document.body.appendChild(loader);

        // Adding keyframes for spin animation if not already present
        if (!document.getElementById("centerLoaderKeyframes")) {
            const style = document.createElement("style");
            style.id = "centerLoaderKeyframes";
            style.textContent = `
                @keyframes spinLoader {
                    0% { transform: translate(-50%, -50%) rotate(0deg); }
                    100% { transform: translate(-50%, -50%) rotate(360deg); }
                }
            `;

            // Appending style to head
            document.head.appendChild(style);
        }
    }

    // Function that stops loading animation (by just removing the loader element)
    function stopLoadingAnimation() {
        // Defining loader element
        const loader = document.getElementById("centerLoader");

        // Removing loader if exists
        if (loader) loader.remove();
    }

    // Special function which generates color for each DIFFERENT string and even
    // if strings are similar they will have completly different colors.
    function stringToDistinctColor(str) {
        // Formatting string for parsing to algorithm
        str = str.toLowerCase().trim();

        // Convert string to number
        let hash = 5381;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) + hash) + str.charCodeAt(i);
        }

        // Generate color components
        const hue = Math.abs((hash * 97) % 360);          // 0–360
        const saturation = 65 + (Math.abs((hash >> 8) * 13) % 25); // 65–90%
        const lightness = 75 + (Math.abs((hash >> 16) * 7) % 20);  // 75–94%

        // Returning generated color
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    // Function for applying highlight style
    function enableRowHighlightStyle(row, searchInputKeywords) {
        // This checks if it is one time already formatted to not repeat the actions
        const rowIsFormatted = row.classList.contains("formatted-row");

        // Applying first time
        if (rowIsFormatted === false) {

            // Changing default link to seperate CLICK FOR COURSE INFO span
            const firstTd = row.querySelector('td:first-child');
            const a = firstTd.querySelector('a');
            if (a) {
                const url = a.href;                 // store URL
                a.replaceWith(...a.childNodes);     // remove <a> but keep content
                const infoLink = document.createElement('a');
                infoLink.href = url;
                infoLink.textContent = 'Course Info';
                infoLink.style.cssText = `
                    margin-left: 8px;
                    color: blue;
                    text-decoration: underline;
                    cursor: pointer;
                `;
                infoLink.target = '_blank';         // optional: open in new tab
                firstTd.appendChild(infoLink);      // append only once
            }
        }

        // Enabling highlight style 
        row.querySelectorAll("td").forEach((td, index) => {

            let target = td;
            if (target.id === "gened-td") { return; }

            // Finding the deepest child of each td because it happens that the 
            // actual content is insite <p> or even <p><em> and then hihlighting it
            while (target.children.length > 0) {
                // If its child is just higlighted element than it is not counted and we reached to bottom
                if (target.children[0].id === "highlightMark") break;

                // Assigning the child element as new target
                target = target.children[0];
            }

            // Getting text content and generating UNIQUE color for SAME strings 
            const text = target.textContent.trim();
            const bgColor = stringToDistinctColor(text);

            // Aplying gened themes highlight
            const genedTd = row.querySelector(".is-gened-course");
            if (genedTd) {
                // Checking if show only gened is on and higlighting gened span color
                const onlyGenedValue = document.getElementById("only-gened-checkbox").checked;
                const genedSpanElement = genedTd.querySelector(`.gened-title-span`);

                // Checking and applying new style for title
                if (genedSpanElement) {
                    if (onlyGenedValue) {
                        genedSpanElement.style.backgroundColor = "#00ff22ff";
                    }
                    else {
                        genedSpanElement.style.backgroundColor = "#a8e9b1ff";
                    }
                }

                // Changing background color of gened theme box if theme filter is checked
                for (let i = 1; i <= 9; i++) {

                    // Getting elements
                    const themeCheckboxValue = document.getElementById(`gened-theme-${i}-checkbox`)?.checked;
                    const themeInGened = row.querySelector(`.gened-course-theme-${i}-number`);

                    // Checking if they exist and if the matched theme exists
                    if (themeInGened) {
                        if (themeCheckboxValue) {
                            themeInGened.style.backgroundColor = '#de9fecff';
                        }
                        else {
                            themeInGened.style.backgroundColor = '#efcff6';
                        }
                    }

                }
            }


            // Applying styles that are onetime when row is never passed through this funciton
            if (rowIsFormatted === false) {

                // If we have all content inside a td element as text then we put it inside span
                // and then continue
                if (target === td) {
                    // Creating new element for text
                    const span = document.createElement("span");

                    // Adding text to new element
                    span.textContent = td.textContent.trim();

                    // Clearing the actual td and adding new element.
                    td.textContent = "";
                    td.appendChild(span);
                    target = span;
                }

                // Adding onclick event to filter the classes when user clicks to 
                // specific data box (like if )
                target.onclick = () => {
                    // Getting text content of element
                    const text = target.textContent.trim();

                    // Defining search input element because when clicked the text content
                    // will be appended inside input's value
                    const searchInputElement = document.getElementById("searchInput");

                    // If it already is included then we remove, otherwise we include
                    if (searchInputElement.value.includes(text)) {

                        // Making search input value to get rid from that input that already contains
                        searchInputElement.value =
                            searchInputElement.value =
                            searchInputElement.value
                                .replaceAll(` "${text}" `, "")
                                .replace(/\s+/g, " ")
                                .trim();
                    }
                    else {
                        // Appending the text content to searchInput for exact matching
                        searchInputElement.value += ` "${text}" `;
                    }

                    // Finally calling filter function
                    highlightRows();
                };

                // Formatting first td which is reponsible for course name (its so ugly)
                if (index === 0) {
                    Array.from(td.children).forEach((element) => { element.style.margin = "10px" })
                }
            }

            // Applying style to highlighted td
            target.style.cssText = `
                background-color: ${bgColor};
                color: #333;
                border-radius: 15px;
                padding: 4px 12px;
                margin: 2px;
                display: inline-block;
                border: 1px solid rgba(0,0,0,0.1);
                cursor: pointer;
            `;

            // Making brighter if there is exact match
            let newText = text;

            // Matching each keyword and putting it inside <mark> for higlighting
            searchInputKeywords.forEach(keyword => {
                const regex = new RegExp(`(?<!<mark[^>]*>)(` + keyword + `)(?![^<]*<\/mark>)`, "gi");
                newText = newText.replace(regex, `<mark id="highlightMark" style="background-color: ${stringToDistinctColor(text)}; padding: 0px;">$1</mark>`);
            });

            // Changing the <td> background to brighter color
            if (searchInputKeywords.some(k => text.toLowerCase().includes(k.toLowerCase()))) {
                target.style.backgroundColor = `hsl(${stringToDistinctColor(text).match(/\d+/)[0]},100%,75%)`;
                target.innerHTML = newText;
            }

        });


        // Making each td (row data) to have border and also padding
        row.querySelectorAll("td").forEach(td => {
            td.style.border = "1px solid rgba(0,0,0,0.3)";
            td.style.padding = "8px 12px";
        });

        // Also changing background color when highlighted
        if (showOnly === false) {
            row.style.setProperty("background-color", "#fdf3b9ff", "important");
        }
        else {
            row.style.setProperty("background-color", "#ffffff", "important");
        }

        // Finally changing state to formatted row for not going each time and doing the same thing
        if (rowIsFormatted === false) {
            row.classList.add("formatted-row");
        }
    }

    // Function for disabling highlight style
    function disableRowHighlightStyle(row) {
        row.querySelectorAll("td").forEach(td => {
            // Remove all added <mark> elements but keep their text
            td.querySelectorAll("#highlightMark").forEach(mark => {
                const textNode = document.createTextNode(mark.textContent);
                mark.replaceWith(textNode);
            });

            row.style.setProperty("background-color", "#ffffff", "important");

        });
    }


    // Function that does the decision if gened matching is true or false
    function getGenedMatching(row) {

        // ----- Only Gened -----

        // Getting if only gened option is checked or not
        let onlyGened = document.getElementById("only-gened-checkbox");
        if (onlyGened) { onlyGened = onlyGened.checked }

        // Getting decision for only gened option
        let isGened = row.querySelector(".is-gened-course") ? true : false;

        // Making gened match false if user selected onlyGened but class is not gened class
        if (!isGened && onlyGened) { return false; };
        if (!isGened && !onlyGened) { return true; };



        // ----- Themes Matching with or / and -----

        // Getting which themes are selected
        const checkedThemes = [];

        // Collecting all theme checkboxes using ids
        for (let i = 1; i <= 9; i++) {
            const themeCheckbox = document.getElementById(`gened-theme-${i}-checkbox`);
            if (themeCheckbox.checked && !checkedThemes.includes(i)) {
                checkedThemes.push(i);
            }
        }

        // Getting themes mode (or / and)
        let themesMode = document.getElementById("select-gened-theme-mode").value;

        // Doing the actual theme matching test with themes mode applied
        const availableGenedThemeNumberElements = [...row.querySelectorAll(".gened-course-theme-number")];
        const themes = availableGenedThemeNumberElements.map((item, index) => Number(item?.textContent));

        // Final decision for theme matching
        let genedThemeMatching;

        if (themesMode === "or") {
            genedThemeMatching = false;
        }
        if (themesMode === "and") {
            if (themes.length === 0) {
                genedThemeMatching = false;
            }
            else {
                genedThemeMatching = true;
            }
        }

        // Doing check matching through for loop on checked and available themes
        for (let i = 0; i < checkedThemes.length; i++) {
            const checkedTheme = checkedThemes[i];

            if (themesMode === "or" && themes.includes(checkedTheme)) {
                genedThemeMatching = true;
                break;
            }
            if (themesMode === "and" && !themes.includes(checkedTheme)) {
                genedThemeMatching = false;
                break;
            }
        }

        // Checking if themes is empty then returning true but if not empty
        // and nothing found then returning false
        if (checkedThemes.length === 0) { genedThemeMatching = true; }
        if (genedThemeMatching === false) { return false; };



        // ----- Course Level Matching (upper / lower) -----

        // Getting class level
        let lowerClassChecked = document.getElementById("gened-class-level-lower")?.checked;
        let upperClassChecked = document.getElementById("gened-class-level-upper")?.checked;

        // Getting the course number of that gened
        let courseNumberSpan = row.querySelector(".gened-course-number-span");
        let courseNumber = courseNumberSpan.textContent.trim();

        // Extracting class level from course number
        const classLevel = (courseNumber[0] === "1") ? "lower" : "upper";

        // Doing final decision
        if ((!lowerClassChecked && classLevel === "lower") || (!upperClassChecked && classLevel === "upper")) {
            return false;
        }

        // Returning true if no false was returned until now
        return true;
    }

    // Function for highlighting rows based on search and filters
    function highlightRows(calledBy = null) {
        // Defining array for available times
        let availableTimes = [];

        // Clearing previous matching courses
        matchingCourses = [];



        // ----- Search Input -----

        // 1. Get the search input value and convert to lowercase
        const searchInputText = document.getElementById("searchInput").value.toLowerCase();

        // 2. Use regex to match either quoted phrases or single words
        //    - "([^"]+)"  matches anything inside double quotes
        //    - (\S+)      matches any sequence of non-space characters
        const regex = /"([^"]+)"|(\S+)/g;

        // 3. Apply the regex and collect matches
        const searchInputKeywords = [...searchInputText.matchAll(regex)].map(match => {
            // match[1] contains the quoted phrase (if any)
            // match[2] contains the single word (if no quotes)
            return match[1] ?? match[2];
        });


        // Updating checked weekdays
        updateCheckedWeekdays();

        // Getting matching rows
        const rows = getRows();

        // Iterating through rows and courses
        rows.forEach((row, index) => {
            const course = courses[index];
            let searchMatches = true;

            //------Search matching------

            // Checking each keyword from search input to see if it is present
            for (const keyword of searchInputKeywords) {
                const classKeywords = [];

                // Collect all fields to search in
                for (const key in course) {
                    if (course.hasOwnProperty(key)) {
                        classKeywords.push(course[key].toLowerCase());
                    }
                }

                // Check if keyword is found in any field
                let foundInAnyField = classKeywords.some((field) =>
                    field.includes(keyword),
                );

                // If keyword not found in any field, mark searchMatches as false
                if (!foundInAnyField && searchInputKeywords.length > 0) {
                    searchMatches = false;
                }
            }



            //------Weekdays matching------

            // The variable that will decide weather daysMatch has happend
            let daysMatch = false;

            // If no weekdays are checked, consider it a match (because maybe user just ignored that filter)
            if (checkedDays.length === 0) {
                daysMatch = true; // If no days are checked, consider it a match
            } else {
                for (const day of checkedDays) {
                    // If includes at least one checked day, it's a match
                    if (course.times.includes(day)) {
                        daysMatch = true;
                        break;
                    }
                }
            }



            //------Times matching------

            // The variable that will decide weather timesMatch has happend
            let timesMatch = false;

            // Getting checked times as array from timeCheckboxes where are only checked ones
            const checkedTimes = Object.keys(timeCheckboxes).filter(
                (time) => timeCheckboxes[time].checked,
            );

            // If no times are checked, consider it a match (because maybe user just ignored that filter)
            if (checkedTimes.length === 0) {
                timesMatch = true; // If no times are checked, consider it a match
            } else {
                for (const time of checkedTimes) {
                    if (course.times.includes(time)) {
                        timesMatch = true;
                        break;
                    }
                }
            }



            // ----- Gened Matching -----

            // Defining genedMatch which is responsible for final decision of gened part
            let genedMatch = getGenedMatching(row);



            // ----- Final Decision -----

            // I think its best to check if all three matches are true. Also if you think it would 
            // be useful you can add option to choose AND/OR logic between these three filters but idk,
            // it will make everything more complicated.
            let finalMatch = searchMatches && (daysMatch && timesMatch) && genedMatch;

            // The actual logic if finalMatch has happened
            if (finalMatch) {

                // Highlighting row if any filter is active (because if no filter is active, all rows are matching)
                if (!(searchInputKeywords.length === 0 && checkedDays.length === 0 && checkedTimes.length === 0)) {
                    enableRowHighlightStyle(row, searchInputKeywords);
                }
                else {
                    enableRowHighlightStyle(row, searchInputKeywords);
                }

                // Showing row
                row.style.display = "";

                // Adding matching class and removing not-matching class
                row.classList.add("matching");
                row.classList.remove("not-matching");

                // Adding course to matchingCourses array
                matchingCourses.push(course);

                // Extracting available times from matching courses only if not called by time-filter
                // because if one time checkbox is clicked it will remove all others from available times
                if (calledBy !== "time-filter") {
                    const times = course.times.match(
                        /\b\d{1,2}:\d{2}(?:am|pm)-\d{1,2}:\d{2}(?:am|pm)\b/gi,
                    );
                    if (times !== null) {
                        times.forEach((time) => {
                            if (!availableTimes.includes(time)) {
                                availableTimes.push(time);
                            }
                        });
                    }
                }
            } else {
                // Resetting any highlight
                disableRowHighlightStyle(row)
                row.style.display = showOnly ? "none" : ""; // Hide if show only matching is active

                // Adding not-matching class and removing matching class
                row.classList.add("not-matching");
                row.classList.remove("matching");
            }
        });


        // Scrolling to nearest matching row only if called not by time-filter
        scrollToNearestMatching();

        // After performing search
        availableTimes.sort();

        // Parsing available times to checkboxes only if not called by time-filter 
        // because it will remove all unchecked ones
        if (calledBy !== "time-filter") {
            parseAvailableTimesToCheckboxes(availableTimes);
        }

        // Updating matched count
        updateMatchedCount();
    }

    // Initializing the plugin
    updateCheckedWeekdays();
    fetchCourses();
    createWindow();
    setupSearchInputEnterNavigation();



    // ----- Gened Content -----


    // This is just a script that you need to run in https://gened.aua.am/courses-and-their-clusters/ website
    // console to get latest geneds.
    () => {

        // Get all tables on the page
        const tables = document.querySelectorAll("table");

        // Pick the last table
        const lastTable = tables[tables.length - 1];

        // Extract rows
        const rows = lastTable.querySelectorAll("tr");

        // Result array
        const courses = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll("td");
            if (!cells.length) return; // skip header or empty rows

            const code = cells[0].textContent.trim();
            const courseNumber = cells[1].textContent.trim();
            const name = cells[2].textContent.trim();
            const rawThemes = cells[3].textContent.trim(); // assuming themes in 4th cell

            // Split by comma
            const parts = rawThemes.split(',').map(t => t.trim());
            const themes = [];

            parts.forEach(t => {
                // Extract numbers
                const numbers = t.match(/\d+/g);
                if (numbers) themes.push(...numbers);

                // Extract remaining non-numeric text
                const text = t.replace(/\d+/g, '').trim();
                if (text) themes.push(text);
            });

            courses.push({
                code,
                courseNumber,
                name,
                themes
            });
        });
    }

    // Defining an object which will just contain all available geneds information.
    // It is static and must be updated manually time by time
    const geneds = [
        {
            "code": "BAB",
            "courseNumber": "101",
            "name": "Introduction to Business (Previously BUS 101)",
            "themes": [
                "4",
                "5"
            ]
        },
        {
            "code": "BAB",
            "courseNumber": "105",
            "name": "Foundations of Management (Previously BUS 105)",
            "themes": [
                "5"
            ]
        },
        {
            "code": "BAB",
            "courseNumber": "109",
            "name": "Single-Variable Calculus for Business and Economics (Previously Business Math, BUS 109) (Not open to CS, DS, ES and Economics majors)",
            "themes": [
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "BAB",
            "courseNumber": "110",
            "name": "Applied Statistics   (Previously BUS 110),   (Not open to CS, DS, ES and Economics majors)",
            "themes": [
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "BAB",
            "courseNumber": "112",
            "name": "Social, Legal & Ethical Environment of Business (Previously BUS 112)",
            "themes": [
                "3",
                "6"
            ]
        },
        {
            "code": "BAB",
            "courseNumber": "209",
            "name": "Linear Algebra and Multi-variable Calculus for Business and Economics (Previously Business Math II, BUS 209), (Not open to CS, DS, ES majors)",
            "themes": [
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "BAB",
            "courseNumber": "288",
            "name": "Business Analytics (Previously BUS 288 )",
            "themes": [
                "4",
                "5",
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "BUS",
            "courseNumber": "218",
            "name": "Financial Inclusion and Sustainable Development",
            "themes": [
                "4",
                "5"
            ]
        },
        {
            "code": "CBE",
            "courseNumber": "102",
            "name": "Introduction to Personal Finance (Not open to BAB, BSE majors as General Education)",
            "themes": [
                "5"
            ]
        },
        {
            "code": "CBE",
            "courseNumber": "282",
            "name": "Trade (Previously CHSS 282) (Not open to BAB, BSE majors as General Education)",
            "themes": [
                "4",
                "5"
            ]
        },
        {
            "code": "CBE",
            "courseNumber": "283",
            "name": "Trust (Previously CHSS 283)",
            "themes": [
                "4",
                "5",
                "6"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "101",
            "name": "Eastern Armenian Language 1",
            "themes": [
                "1"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "102",
            "name": "Eastern Armenian Language 2",
            "themes": [
                "1"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "103",
            "name": "Armenian Language & Literature 1 (Previously FND 103)",
            "themes": [
                "Foundation"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "104",
            "name": "Armenian Language & Literature 2 (Previously FND 104)",
            "themes": [
                "Foundation"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "108",
            "name": "Contemporary Issues in American Education",
            "themes": [
                "1",
                "2",
                "3",
                "6"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "110",
            "name": "Introduction to Philosophy",
            "themes": [
                "3",
                "6"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "111",
            "name": "Introduction to Ethics",
            "themes": [
                "3",
                "6"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "112",
            "name": "Introduction to Logic & Rhetoric",
            "themes": [
                "1",
                "3"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "114",
            "name": "Introduction to Religion",
            "themes": [
                "2",
                "3",
                "6"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "120",
            "name": "The Study of History (Previously CHSS 220)",
            "themes": [
                "2",
                "4"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "125",
            "name": "History of the Middle East",
            "themes": [
                "2",
                "4"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "127",
            "name": "World Civilizations 1",
            "themes": [
                "2",
                "4"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "128",
            "name": "History of the Modern World",
            "themes": [
                "2",
                "4"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "129",
            "name": "Global Perspectives and Site Stories",
            "themes": [
                "2",
                "4"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "130",
            "name": "Introduction to Art",
            "themes": [
                "1"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "140",
            "name": "Music Appreciation",
            "themes": [
                "1"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "141",
            "name": "Understanding the XXth century through Music",
            "themes": [
                "1",
                "2"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "142",
            "name": "Music Theory",
            "themes": [
                "1"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "151",
            "name": "Introduction to French Language & Culture",
            "themes": [
                "1",
                "2",
                "4"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "152",
            "name": "Introduction to Korean Language & Culture",
            "themes": [
                "1",
                "2",
                "4"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "153",
            "name": "Introduction to Japanese Language & Culture",
            "themes": [
                "1",
                "2",
                "4"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "154",
            "name": "Armenian Society and Culture (Previously Armenian Language & Culture (through 2017))",
            "themes": [
                "1",
                "2",
                "4"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "155",
            "name": "Introduction to Russian Language & Culture",
            "themes": [
                "1",
                "2",
                "4"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "156",
            "name": "Introduction to Latin Language & Culture",
            "themes": [
                "1",
                "2",
                "4"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "157",
            "name": "Introduction to Italian Language & Culture",
            "themes": [
                "1",
                "2",
                "4"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "158",
            "name": "Introduction to Turkish Language & Culture",
            "themes": [
                "1",
                "2",
                "4"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "159",
            "name": "Introduction  to Chinese Language & Culture",
            "themes": [
                "1",
                "2",
                "4"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "160",
            "name": "Introduction to Arabic Language & Arab Culture",
            "themes": [
                "1",
                "2",
                "4"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "170",
            "name": "Religion in America",
            "themes": [
                "1",
                "2",
                "3",
                "4",
                "6"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "180",
            "name": "Introduction to Psychology",
            "themes": [
                "3",
                "6"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "181",
            "name": "Introduction to Sociology",
            "themes": [
                "4",
                "6"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "183",
            "name": "Statistics for Humanities and Social Sciences (Not open to BAB, CS, DS, or ES majors)",
            "themes": [
                "3",
                "5",
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "184",
            "name": "Social Psychology",
            "themes": [
                "3",
                "4",
                "6"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "185",
            "name": "Understanding Genocide",
            "themes": [
                "2",
                "4"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "186",
            "name": "World Regional Geography",
            "themes": [
                "2",
                "4"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "187",
            "name": "The Armenian Genocide",
            "themes": [
                "2",
                "4"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "188",
            "name": "The Holocaust",
            "themes": [
                "2",
                "4"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "189",
            "name": "Gender Perspectives",
            "themes": [
                "2",
                "3",
                "4"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "190",
            "name": "Armenian Heritage & Culture",
            "themes": [
                "1",
                "2",
                "4"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "192",
            "name": "Introduction to Classical Cultures",
            "themes": [
                "1",
                "2",
                "4"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "194",
            "name": "Introduction to Cultural Anthropology",
            "themes": [
                "2",
                "4"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "195",
            "name": "Introduction to Archaeology",
            "themes": [
                "2",
                "4"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "196",
            "name": "Archaeological Excavation Practice",
            "themes": [
                "2",
                "4"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "201",
            "name": "Comparative Education",
            "themes": [
                "3",
                "6"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "202",
            "name": "Perspectives in Education",
            "themes": [
                "3",
                "6"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "203",
            "name": "Philosophy of Mind",
            "themes": [
                "3",
                "6"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "204",
            "name": "Bioethics",
            "themes": [
                "3",
                "4"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "205",
            "name": "Learning, activism, and social movements",
            "themes": [
                "2",
                "4",
                "6"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "207",
            "name": "Ethics in Public Affairs",
            "themes": [
                "3",
                "4",
                "6"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "210",
            "name": "Philosophy, Politics and Economics Seminar",
            "themes": [
                "3",
                "4",
                "5"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "211",
            "name": "Great Books",
            "themes": [
                "1",
                "2",
                "3"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "212",
            "name": "Epistemology & Philosophy of Science",
            "themes": [
                "3",
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "213",
            "name": "Symbolic Logic",
            "themes": [
                "1",
                "3"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "221",
            "name": "Ancient Near East: History and Civilizations",
            "themes": [
                "2",
                "4"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "222",
            "name": "Soviet Armenia",
            "themes": [
                "2",
                "4"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "223",
            "name": "Armenian History 1 (Previously FND 221)",
            "themes": [
                "Foundation"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "224",
            "name": "Armenian History 2 (Previously FND 222)",
            "themes": [
                "Foundation"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "225",
            "name": "The Modern Middle East: Peoples, States and Societies",
            "themes": [
                "2",
                "4"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "230",
            "name": "Asian Art",
            "themes": [
                "1",
                "2"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "231",
            "name": "Armenian Visual Traditions: Illuminated Manuscripts",
            "themes": [
                "1",
                "2"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "232",
            "name": "Topics in Western Art History",
            "themes": [
                "1",
                "2"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "234",
            "name": "Cultural Policy and Arts Management",
            "themes": [
                "1",
                "2",
                "4",
                "5"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "236",
            "name": "Baroque Era",
            "themes": [
                "1",
                "2"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "237",
            "name": "20th Century Art",
            "themes": [
                "1",
                "2",
                "6"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "238",
            "name": "Psychology of Gender",
            "themes": [
                "2",
                "4",
                "6"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "239",
            "name": "The Age of Enlightenment",
            "themes": [
                "1",
                "2"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "241",
            "name": "Armenian Music",
            "themes": [
                "1",
                "2",
                "3"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "250",
            "name": "Professional Communication in Armenian",
            "themes": [
                "1",
                "5"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "255",
            "name": "Russian Professional Communication",
            "themes": [
                "1",
                "2",
                "5"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "256",
            "name": "Latin Language & Literature",
            "themes": [
                "1",
                "2"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "261",
            "name": "Armenian Literature in Perspective",
            "themes": [
                "1",
                "2"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "262",
            "name": "Russian Language and Literature",
            "themes": [
                "1",
                "2"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "272",
            "name": "Comparative Religion",
            "themes": [
                "1",
                "2",
                "3",
                "4",
                "6"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "280",
            "name": "Clinical Psychology",
            "themes": [
                "3",
                "6"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "281",
            "name": "Human Development & Personality",
            "themes": [
                "3",
                "6",
                "7"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "286",
            "name": "Comparative Genocide",
            "themes": [
                "2",
                "4"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "288",
            "name": "Modern Turkey",
            "themes": [
                "2",
                "4"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "290",
            "name": "Cultural Geography",
            "themes": [
                "2",
                "4"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "292",
            "name": "Gender & Social Change",
            "themes": [
                "2",
                "4"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "294",
            "name": "Advanced Studies in Gender",
            "themes": [
                "2",
                "4",
                "6"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "295",
            "name": "Special Topics in the Arts",
            "themes": [
                "1",
                "2",
                "3",
                "(or as documented in the course schedule for a particular offering)"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "295",
            "name": "Special Topics in the Arts: Finding Voice",
            "themes": [
                "1",
                "2",
                "3"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "296",
            "name": "Special Topics in Social Sciences",
            "themes": [
                "4",
                "5",
                "6",
                "(or as documented in the course schedule for a particular offering)"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "296",
            "name": "Special Topics in Social Sciences: Armenian Women’s History in the Global Context",
            "themes": [
                "2",
                "4"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "296",
            "name": "Special Topics in Social Sciences: Critical Thinking for the Digital Era",
            "themes": [
                "1",
                "4",
                "6"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "296",
            "name": "Special Topics in Social Sciences: Gender and Genocide",
            "themes": [
                "2",
                "4"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "296",
            "name": "Special Topics in Social Sciences: Health in Human Rights",
            "themes": [
                "2",
                "4"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "296",
            "name": "Special Topics in Social Sciences: Modern Diasporas",
            "themes": [
                "2",
                "4"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "296",
            "name": "Special Topics in Social Sciences: Philosophical Exploration of Normativity",
            "themes": [
                "1",
                "3",
                "6"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "296",
            "name": "Special Topics in Social Sciences: Russia, the West and the Rest",
            "themes": [
                "2",
                "4"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "296",
            "name": "Special Topics in Social Sciences: Soviet Armenian History through Film",
            "themes": [
                "1",
                "2",
                "4"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "296",
            "name": "Special Topics in Social Sciences: Trust",
            "themes": [
                "4",
                "5",
                "6"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "297",
            "name": "Research Projects in Gender Studies",
            "themes": [
                "2",
                "3",
                "4"
            ]
        },
        {
            "code": "CHSS",
            "courseNumber": "298",
            "name": "Independent Study",
            "themes": [
                "As determined as offering"
            ]
        },
        {
            "code": "CS",
            "courseNumber": "100",
            "name": "Calculus 1 (Not open to BAB majors as General Education)",
            "themes": [
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "CS",
            "courseNumber": "101",
            "name": "Calculus 2",
            "themes": [
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "CS",
            "courseNumber": "102",
            "name": "Calculus 3",
            "themes": [
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "CS",
            "courseNumber": "104",
            "name": "Linear Algebra",
            "themes": [
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "CS",
            "courseNumber": "110",
            "name": "Introduction to Computer Science",
            "themes": [
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "CS",
            "courseNumber": "111",
            "name": "Discrete Math",
            "themes": [
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "CSE",
            "courseNumber": "111",
            "name": "The Scientific Method & Critical Thinking",
            "themes": [
                "3",
                "6",
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "CSE",
            "courseNumber": "112",
            "name": "Mathematical Thinking  (Not open to CS, DS, ES majors)",
            "themes": [
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "CSE",
            "courseNumber": "120",
            "name": "Introduction to the World of Programming   (Not open to CS, DS, ES majors)",
            "themes": [
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "CSE",
            "courseNumber": "131",
            "name": "Industrial Technologies",
            "themes": [
                "5",
                "8",
                "9"
            ]
        },
        {
            "code": "CSE",
            "courseNumber": "141",
            "name": "Understanding Data  (Not open to DS majors)",
            "themes": [
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "CSE",
            "courseNumber": "150",
            "name": "Cybersecurity Essentials  (Not open to CS majors)",
            "themes": [
                "4",
                "8",
                "9"
            ]
        },
        {
            "code": "CSE",
            "courseNumber": "151",
            "name": "Introduction to Energy Sources",
            "themes": [
                "8",
                "9"
            ]
        },
        {
            "code": "CSE",
            "courseNumber": "162",
            "name": "Introduction to Bioscience",
            "themes": [
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "CSE",
            "courseNumber": "170",
            "name": "Chemistry in Everyday Life (Previously ENV 170.  Not open to ESS, ES majors or to DS majors in the Bioinformatics track)",
            "themes": [
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "CSE",
            "courseNumber": "171",
            "name": "Conceptual Physics. (Not open to CS, DS, ES majors)",
            "themes": [
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "CSE",
            "courseNumber": "175",
            "name": "Relativity",
            "themes": [
                "8"
            ]
        },
        {
            "code": "CSE",
            "courseNumber": "181",
            "name": "Creativity and Technological Innovation",
            "themes": [
                "5",
                "9"
            ]
        },
        {
            "code": "CSE",
            "courseNumber": "190",
            "name": "Engineering for non-Engineers (Not open to ES majors)",
            "themes": [
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "CSE",
            "courseNumber": "210",
            "name": "Historical Development of Mathematical Ideas",
            "themes": [
                "3",
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "CSE",
            "courseNumber": "220",
            "name": "Tomorrow’s Technologies",
            "themes": [
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "CSE",
            "courseNumber": "221",
            "name": "Nanotechnology:  Science and Application",
            "themes": [
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "CSE",
            "courseNumber": "222",
            "name": "Technology Marketing (Previously CSE 130 (through Spring 2024))",
            "themes": [
                "5",
                "9"
            ]
        },
        {
            "code": "CSE",
            "courseNumber": "230",
            "name": "Music Technology",
            "themes": [
                "1",
                "4",
                "9"
            ]
        },
        {
            "code": "CSE",
            "courseNumber": "241",
            "name": "Data Mining (Not open to DS majors)",
            "themes": [
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "CSE",
            "courseNumber": "262",
            "name": "Quantitative Biology",
            "themes": [
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "CSE",
            "courseNumber": "263",
            "name": "Human Physiology",
            "themes": [
                "7"
            ]
        },
        {
            "code": "CSE",
            "courseNumber": "264",
            "name": "Human Brain",
            "themes": [
                "3",
                "6",
                "7"
            ]
        },
        {
            "code": "CSE",
            "courseNumber": "265",
            "name": "Genetics",
            "themes": [
                "3",
                "6",
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "CSE",
            "courseNumber": "270",
            "name": "Sports Analytics (Not open to DS majors as General Education)",
            "themes": [
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "CSE",
            "courseNumber": "271",
            "name": "Number Statistics and the Environment",
            "themes": [
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "CSE",
            "courseNumber": "281",
            "name": "Design Thinking",
            "themes": [
                "8",
                "9"
            ]
        },
        {
            "code": "CSE",
            "courseNumber": "285",
            "name": "How things work",
            "themes": [
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "CSE",
            "courseNumber": "290",
            "name": "Start-up Culture",
            "themes": [
                "5",
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "CSE",
            "courseNumber": "291",
            "name": "Introduction to Product Design",
            "themes": [
                "1",
                "9"
            ]
        },
        {
            "code": "CSE",
            "courseNumber": "292",
            "name": "Building a Learning Organization",
            "themes": [
                "3",
                "5",
                "6",
                "9"
            ]
        },
        {
            "code": "DS",
            "courseNumber": "151",
            "name": "Cell and Molecular Biology (Not open to BSN majors)",
            "themes": [
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "101",
            "name": "Freshman Seminar 1 (Previously FND 101)",
            "themes": [
                "Foundation"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "102",
            "name": "Freshman Seminar 2 (Previously FND 102)",
            "themes": [
                "Foundation"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "103",
            "name": "Introduction to Language and Culture",
            "themes": [
                "1",
                "2",
                "4"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "104",
            "name": "Introduction to Communications",
            "themes": [
                "1",
                "4"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "105",
            "name": "Structure of English",
            "themes": [
                "1"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "120",
            "name": "American Literature 1",
            "themes": [
                "1"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "121",
            "name": "English Literature 1",
            "themes": [
                "1"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "122",
            "name": "World Literature 1",
            "themes": [
                "1",
                "2"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "130",
            "name": "Introduction to Journalism",
            "themes": [
                "1",
                "4"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "140",
            "name": "Expository Writing",
            "themes": [
                "1"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "141",
            "name": "Persuasive Writing",
            "themes": [
                "1"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "151",
            "name": "Consecutive & Simultaneous Interpreting",
            "themes": [
                "1"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "191",
            "name": "Acting Techniques (Previously CHSS135)",
            "themes": [
                "1"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "200",
            "name": "Introduction to Discourse Analysis",
            "themes": [
                "1"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "201",
            "name": "Photography (Previously CHSS 268)",
            "themes": [
                "1",
                "2"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "202",
            "name": "Lens on Armenia: Photojournalism in Yerevan (Previously CHSS 206)",
            "themes": [
                "1",
                "4"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "203",
            "name": "Creative Productions (Previously CHSS 233)",
            "themes": [
                "1",
                "2"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "204",
            "name": "Topics in Cinema (Previously CHSS 251)",
            "themes": [
                "1",
                "2",
                "4"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "205",
            "name": "Women/Gender and the Visual Arts (Previously CHSS 235)",
            "themes": [
                "1",
                "2",
                "4",
                "6"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "206",
            "name": "Music and Literature (Previously CHSS 240)",
            "themes": [
                "1"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "208",
            "name": "Modernism (Previously CHSS 291)",
            "themes": [
                "1",
                "2",
                "4"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "220",
            "name": "American Literature 2",
            "themes": [
                "1"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "221",
            "name": "English Literature 2",
            "themes": [
                "1"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "222",
            "name": "World Literature 2",
            "themes": [
                "1",
                "2"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "227",
            "name": "Modern Poetry (No longer offered)",
            "themes": [
                "1",
                "3"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "231",
            "name": "Public Speaking",
            "themes": [
                "1"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "232",
            "name": "Public Relations",
            "themes": [
                "1",
                "4",
                "5"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "233",
            "name": "Professional Communications",
            "themes": [
                "1",
                "5"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "234",
            "name": "Advertising",
            "themes": [
                "1",
                "4",
                "5"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "235",
            "name": "Communications Ethics (No longer offered)",
            "themes": [
                "1",
                "3"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "236",
            "name": "Survey and Polling Methodology (No longer offered)",
            "themes": [
                "4"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "237",
            "name": "Introduction to Filmmaking (Previously Filmmaking 2)",
            "themes": [
                "1",
                "4"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "138",
            "name": "Media & Society (Previously EC 238)",
            "themes": [
                "1",
                "4",
                "5",
                "6"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "240",
            "name": "Creative Writing-Fiction (Previously Creative Writing)",
            "themes": [
                "1"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "243",
            "name": "Creative Non-Fiction (Previously Practice of Art of Non-Fiction)",
            "themes": [
                "1"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "244",
            "name": "Writing for Media",
            "themes": [
                "1",
                "4"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "245",
            "name": "Writing for Tourism, Culture and Country Promotion",
            "themes": [
                "1",
                "4"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "246",
            "name": "Business and Data Journalism (Previously Business and Journalism)",
            "themes": [
                "1",
                "5"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "260",
            "name": "Negotiation",
            "themes": [
                "1",
                "4"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "261",
            "name": "World Media",
            "themes": [
                "1",
                "2",
                "4"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "262",
            "name": "Film and Video Editing (Previously Filmmaking 2)",
            "themes": [
                "1",
                "4"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "263",
            "name": "Opinion Making in the Age of New Media",
            "themes": [
                "1",
                "4",
                "6"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "268",
            "name": "Photography (CHSS 268 as of Spring 2024)",
            "themes": [
                "1"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "269",
            "name": "Visual Communication",
            "themes": [
                "1"
            ]
        },
        {
            "code": "EC",
            "courseNumber": "280",
            "name": "Oral History: Collecting Life Stories",
            "themes": [
                "2",
                "4",
                "6"
            ]
        },
        {
            "code": "ECON",
            "courseNumber": "101",
            "name": "Introduction to Economics (Not open to BAB, BSE majors)",
            "themes": [
                "4",
                "5"
            ]
        },
        {
            "code": "ECON",
            "courseNumber": "121",
            "name": "Principles of Microeconomics (Not open to BSE majors)",
            "themes": [
                "4",
                "5"
            ]
        },
        {
            "code": "ECON",
            "courseNumber": "122",
            "name": "Principles of Macroeconomics (Not open to BSE majors)",
            "themes": [
                "4",
                "5"
            ]
        },
        {
            "code": "ECON",
            "courseNumber": "201",
            "name": "Economics and Public Policy (Not open to BSE majors)",
            "themes": [
                "4",
                "5"
            ]
        },
        {
            "code": "ECON",
            "courseNumber": "224",
            "name": "Introduction to Econometrics (Previously BUS 224) (Not open to BSE majors)",
            "themes": [
                "4",
                "5"
            ]
        },
        {
            "code": "ENGS",
            "courseNumber": "123",
            "name": "Electricity and Magnetism",
            "themes": [
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "ENGS",
            "courseNumber": "131",
            "name": "Chemistry (Previously CSE 165) (Not open to ES majors or to DS majors in the Bioinformatics track)",
            "themes": [
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "ESS",
            "courseNumber": "101",
            "name": "Introduction to Environmental and Sustainability Sciences (Previously ENV 101 Introduction to Environmental Sciences)",
            "themes": [
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "ESS",
            "courseNumber": "140",
            "name": "Sustainable Energy Systems and Solutions (Previously ENV 150)",
            "themes": [
                "4",
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "ESS",
            "courseNumber": "160",
            "name": "Sustainable Food Systems (Previously ENV 120 Food) (Not open to ESS majors)",
            "themes": [
                "7",
                "9"
            ]
        },
        {
            "code": "ESS",
            "courseNumber": "180",
            "name": "Introduction to Geographic Information Systems (GIS) and Remote Sensing (Previously CSE 145)",
            "themes": [
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "ESS",
            "courseNumber": "200",
            "name": "Environmental Monitoring (Previously ENV 203)",
            "themes": [
                "4",
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "ESS",
            "courseNumber": "240",
            "name": "Sustainable Cities  (Previously ENV 211)  (Not open to ESS students)",
            "themes": [
                "4",
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "ESS",
            "courseNumber": "244",
            "name": "Water (Previously ENV 230) (Not open to ESS students)",
            "themes": [
                "7",
                "8"
            ]
        },
        {
            "code": "ESS",
            "courseNumber": "246",
            "name": "Solid Waste in Circular Economy",
            "themes": [
                "8",
                "9"
            ]
        },
        {
            "code": "ESS",
            "courseNumber": "250",
            "name": "Biodiversity: Conservation and Restoration (Previously ENV 250)",
            "themes": [
                "7"
            ]
        },
        {
            "code": "ESS",
            "courseNumber": "270",
            "name": "Disasters and Resilience Management (Not open to ESS students) (Previously ENV 210)",
            "themes": [
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "ENV",
            "courseNumber": "105",
            "name": "Numbers, Responsibility and the Environment",
            "themes": [
                "4",
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "ENV",
            "courseNumber": "110",
            "name": "Fundamentals of Climate Change (Previously Climate Change)",
            "themes": [
                "4",
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "ENV",
            "courseNumber": "130",
            "name": "Plants and Society",
            "themes": [
                "4",
                "7"
            ]
        },
        {
            "code": "ENV",
            "courseNumber": "140",
            "name": "Waste in Circular Economy (Previously Solid and Hazardous Waste) (Not open to ESS students)",
            "themes": [
                "8",
                "9"
            ]
        },
        {
            "code": "ENV",
            "courseNumber": "150",
            "name": "Basics of Sustainable Energy  (Not open to ESS students. Not open to ES students as General Education)",
            "themes": [
                "4",
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "ENV",
            "courseNumber": "201",
            "name": "Environmental Field Studies",
            "themes": [
                "4",
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "ENV",
            "courseNumber": "202",
            "name": "Projects in Environmental Sciences",
            "themes": [
                "4",
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "ENV",
            "courseNumber": "204",
            "name": "Environmental Decision Tools",
            "themes": [
                "4",
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "ENV",
            "courseNumber": "212",
            "name": "Mining",
            "themes": [
                "4",
                "7",
                "8",
                "9"
            ]
        },
        {
            "code": "ENV",
            "courseNumber": "251",
            "name": "Forests",
            "themes": [
                "4",
                "7",
                "9"
            ]
        },
        {
            "code": "ENV",
            "courseNumber": "290",
            "name": "Special Topics in Environment Sciences",
            "themes": [
                "(as documented in the course schedule for a particular offering)"
            ]
        },
        {
            "code": "ENV",
            "courseNumber": "290",
            "name": "Special Topics in Environment Sciences: Systems Thinking for Sustainability",
            "themes": [
                "4",
                "7"
            ]
        },
        {
            "code": "EPIC",
            "courseNumber": "231",
            "name": "Translations: Design and Fabrication",
            "themes": [
                "1",
                "9"
            ]
        },
        {
            "code": "HRSJ",
            "courseNumber": "142",
            "name": "Introduction to Human Rights (Previously LAW 142)",
            "themes": [
                "4"
            ]
        },
        {
            "code": "HRSJ",
            "courseNumber": "210",
            "name": "Genocide Studies and Human Rights Seminar (Previously CHSS 285)",
            "themes": [
                "2",
                "4"
            ]
        },
        {
            "code": "LLM",
            "courseNumber": "101",
            "name": "Law in Everyday Life (Previously LAW 101)",
            "themes": [
                "4"
            ]
        },
        {
            "code": "LLM",
            "courseNumber": "110",
            "name": "Introduction to Armenian Justice System (Previously LAW 110)",
            "themes": [
                "4"
            ]
        },
        {
            "code": "LLM",
            "courseNumber": "160",
            "name": "Law & Justice in Popular Culture (Previously LAW 160)",
            "themes": [
                "3",
                "4"
            ]
        },
        {
            "code": "LLM",
            "courseNumber": "201",
            "name": "Armenian Constitution (Previously LAW 201)",
            "themes": [
                "4"
            ]
        },
        {
            "code": "LLM",
            "courseNumber": "202",
            "name": "Legal Anthropology (LAW 202)",
            "themes": [
                "2",
                "4"
            ]
        },
        {
            "code": "LLM",
            "courseNumber": "262",
            "name": "Public Advocacy (Previously LAW 262)",
            "themes": [
                "1",
                "4"
            ]
        },
        {
            "code": "PG",
            "courseNumber": "104Ge",
            "name": "Comparative Politics",
            "themes": [
                "4"
            ]
        },
        {
            "code": "PG",
            "courseNumber": "111",
            "name": "Introduction to Political Science (Previously PSIA 101) (Not open to PG majors)",
            "themes": [
                "4"
            ]
        },
        {
            "code": "PG",
            "courseNumber": "112",
            "name": "Introduction to US Government (Previously PSIA 102)",
            "themes": [
                "4"
            ]
        },
        {
            "code": "PG",
            "courseNumber": "113",
            "name": "Introduction to Armenian Government (Previously PSIA 103)",
            "themes": [
                "4"
            ]
        },
        {
            "code": "PG",
            "courseNumber": "201",
            "name": "Political Philosophy  (Previously PSIA 201)",
            "themes": [
                "2",
                "3",
                "4"
            ]
        },
        {
            "code": "PG",
            "courseNumber": "215",
            "name": "International Relations  (Previously PSIA 205)",
            "themes": [
                "4"
            ]
        },
        {
            "code": "PG",
            "courseNumber": "221",
            "name": "Special Topics in Politics and Governance",
            "themes": [
                "4",
                "(or as documented in the course schedule for a particular offering)"
            ]
        },
        {
            "code": "PG",
            "courseNumber": "221",
            "name": "Special Topics in Politics and Governance International Security",
            "themes": [
                "4"
            ]
        },
        {
            "code": "PG",
            "courseNumber": "271",
            "name": "Religion & Politics (Previously PSIA 271)",
            "themes": [
                "1",
                "2",
                "3",
                "4",
                "6"
            ]
        },
        {
            "code": "PG",
            "courseNumber": "272",
            "name": "Geopolitics of Asia  (Previously PSIA 272)",
            "themes": [
                "2",
                "4",
                "5"
            ]
        },
        {
            "code": "PG",
            "courseNumber": "273",
            "name": "Geopolitics of Europe  (Previously PSIA 273)",
            "themes": [
                "2",
                "4",
                "5"
            ]
        },
        {
            "code": "PG",
            "courseNumber": "274",
            "name": "Survey and Polling (Previously CHSS 215)",
            "themes": [
                "4",
                "8"
            ]
        },
        {
            "code": "PG",
            "courseNumber": "281",
            "name": "Development Policy  (Previously PSIA 281)",
            "themes": [
                "4",
                "5"
            ]
        },
        {
            "code": "PG",
            "courseNumber": "282",
            "name": "Survey of Regional Politics  (Previously PSIA 282)",
            "themes": [
                "2",
                "4",
                "5"
            ]
        },
        {
            "code": "PH",
            "courseNumber": "101",
            "name": "Basics of Healthy Lifestyle",
            "themes": [
                "7"
            ]
        },
        {
            "code": "PH",
            "courseNumber": "102",
            "name": "Understanding Substance Use and Addictions (Previously CHSS 296 Special Topics in Social Sciences: Understanding Substance Use and Addictions)",
            "themes": [
                "4",
                "6"
            ]
        },
        {
            "code": "PH",
            "courseNumber": "201",
            "name": "Global Health",
            "themes": [
                "4",
                "7"
            ]
        },
        {
            "code": "PH",
            "courseNumber": "202",
            "name": "Causes, Treatment and Prevention of Cancer",
            "themes": [
                "4",
                "7"
            ]
        },
        {
            "code": "PH",
            "courseNumber": "203",
            "name": "Human Nutrition and Health",
            "themes": [
                "6",
                "7"
            ]
        }
    ]

    // Function that loads all gened information in rows of table
    function setupGeneds() {
        // Appending thead to include also title for Gened row
        const thead = document.querySelector('#crsbysemester thead tr');
        if (thead) {
            const th = document.createElement('th');
            th.textContent = 'Gened';
            thead.appendChild(th);
        }

        // Going through each row to check if its name exists in geneds name
        const rows = getRows();
        rows.forEach((row, index) => {
            // Gets course name formatted
            const rowCourseName = row.querySelector('td:first-child span').textContent.toLowerCase().trim();

            // Contains if this row is gened courses' row or on
            let isGened = false;

            // Iterating through each gened
            for (const gened of geneds) {
                // Checking if gened name includes course name
                if (gened.name.toLowerCase().includes(rowCourseName)) {
                    // Defining gened <td>
                    const genedTd = document.createElement("td");
                    genedTd.id = "gened-td";
                    genedTd.classList.add("is-gened-course");


                    // Creating span for title that it is gened
                    const genedSpan = document.createElement("span");
                    genedSpan.classList.add("gened-title-span");
                    genedSpan.style.cssText = `
                        text-align: center;
                        font-size: 1.3em;
                        padding: 2px 8px 2px 8px;
                        margin-bottom: 10px;
                        border-radius: 5px;
                        width: auto;
                        display: box;
                        cursor: help;
                    `

                    // For showing only geneds when it is clicked
                    genedSpan.onclick = () => {
                        const onlyGenedCheckbox = document.getElementById("only-gened-checkbox");
                        onlyGenedCheckbox.checked = !onlyGenedCheckbox.checked;
                        onlyGenedCheckbox.dispatchEvent(new Event("change", { bubbles: true }));
                    }

                    genedSpan.textContent = "Gened";
                    genedSpan.title = `${gened.name}\n\nCourse number: ${gened.courseNumber} \nCode: ${gened.code} \nThemes: ${gened.themes}\n\nDouble-check—computers can’t be correct about everything, according to Gödel’s theorem.`;

                    // Appending elements to <td>
                    genedTd.appendChild(genedSpan);


                    // Creating span for course number for lower and upper
                    const genedCourseNumberSpan = document.createElement("span");
                    genedCourseNumberSpan.classList.add("gened-course-number-span")
                    genedCourseNumberSpan.style.cssText = `
                        background-color: #f5bb79cc;
                        padding: 2px 8px 2px 8px;
                        margin-bottom: 10px;
                        border-radius: 5px;
                        width: auto;
                        display: inline-block;
                        margin-left: 5px;
                        margin-right: 5px;
                    `
                    genedCourseNumberSpan.textContent = `${gened.courseNumber}`;

                    // Appending elements to <td>
                    genedTd.appendChild(genedCourseNumberSpan);


                    // Creating span for the code of class organizer like BAB or PG 
                    const genedCodeSpan = document.createElement("span");
                    genedCodeSpan.classList.add("gened-course-code-span")
                    genedCodeSpan.style.cssText = `
                        background-color: #f5bb79cc;
                        padding: 2px 8px 2px 8px;
                        margin-bottom: 10px;
                        border-radius: 5px;
                        width: auto;
                        display: inline-block;
                        margin-left: 5px;
                        margin-right: 5px;
                    `
                    genedCodeSpan.textContent = `${gened.code}`;

                    // Appending elements to <td>
                    genedTd.appendChild(genedCodeSpan);
                    genedTd.appendChild(document.createElement("br"));


                    // Adding themes to gened div
                    for (const theme of gened["themes"]) {
                        const themeElement = document.createElement("span");
                        themeElement.textContent = theme;
                        if (theme.length == 1) {
                            themeElement.style.cssText = `
                                background-color: #efcff6;
                                padding: 2px 6px 2px 6px;
                                margin-left: 2px;
                                margin-right: 2px;
                                display: inline;
                                cursor: pointer;
                            `;
                            themeElement.classList.add('gened-course-theme-number')
                            themeElement.classList.add(`gened-course-theme-${theme}-number`)


                            // Triggering checkbox click when some theme is selected
                            themeElement.onclick = () => {
                                const themeCheckbox = document.getElementById(`gened-theme-${theme}-checkbox`);
                                themeCheckbox.checked = !themeCheckbox.checked;
                                themeCheckbox.dispatchEvent(new Event("change", { bubbles: true }));
                            }
                        }
                        else {
                            themeElement.style.cssText = `
                                margin-top: 5px;
                            `;
                        }

                        genedTd.appendChild(themeElement);
                    }

                    // Adding genedTd to row
                    row.appendChild(genedTd);

                    // Marking this as gened
                    isGened = true;

                    // Breaking
                    break;
                }
            }

            // Adding not gened if is gened is false
            if (isGened === false) {
                // Defining gened <td>
                const genedTd = document.createElement("td");
                genedTd.id = "gened-td";
                genedTd.classList.add("is-not-gened-course");


                // Creating span for title that it is gened
                const genedSpan = document.createElement("span");
                genedSpan.classList.add("gened-title-span");
                genedSpan.style.cssText = `
                        text-align: center;
                        background-color: #e98585ff;
                        font-size: 1.3em;
                        padding: 2px 8px 2px 8px;
                        margin-bottom: 10px;
                        border-radius: 5px;
                        width: auto;
                        display: box;
                        cursor: help;
                    `


                genedSpan.textContent = "Not Gened";
                genedSpan.title = `Double-check—computers can’t be correct about everything, according to Gödel’s theorem.`;

                // Appending elements to <td>
                genedTd.appendChild(genedSpan);

                // Adding genedTd to row
                row.appendChild(genedTd)
            }

        })
    }
})();
