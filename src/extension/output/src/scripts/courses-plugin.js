(function () {
    "use strict";

    // ----- Checking if we are in right place or no -----

    if (!location.href.includes("auasonis.jenzabarcloud.com/GENSRsC.cfm")) return;

    // ----- Global Variables And Constants -----

    let courses = [];
    let matchingCourses = [];
    let showOnly = false;
    let checkedDays = [];
    let notificationShown = false;

    const indexes = ["name", "section", "session", "credits", "campus", "instructor", "times", "seats", "spacesWaiting", "deliveryMethod", "distanceLearning", "location", "gened", "schedule"]

    const dayCheckboxes = {};
    const availableTimes = [];
    const timeCheckboxes = {};

    let schedulesData = {
        schedules: [{}, {}, {}],
        wishlist: {},
        activeScheduleIndex: 0,
        isScheduleOpened: true
    }

    schedulesData.wishlist = {
        "b5869cc0b5869cc0b5869cac0b5869cc0": {
            "name": "Calculus 2",
            "times": "MON 9:30am-10:20am, WED 9:30am-10:20am, FRI 9:30am-10:20am",
            "timesFormatted": [
                {
                    "weekday": "monday",
                    "start": 570,
                    "end": 620
                },
                {
                    "weekday": "wednesday",
                    "start": 570,
                    "end": 620
                },
                {
                    "weekday": "friday",
                    "start": 570,
                    "end": 620
                }
            ],
            "instructor": "Karen Keryan",
            "location": "Classroom 414W Paramaz Avedissian Building"
        },
    }
    schedulesData.schedules = [
        {
            "99fcbe6b99fcbe6b99fcbe6b99fcbe6b": {
                "name": "Mechanics",
                "times": "TUE 1:30pm-2:50pm, THU 1:30pm-2:50pm",
                "timesFormatted": [
                    {
                        "weekday": "tuesday",
                        "start": 810,
                        "end": 890
                    },
                    {
                        "weekday": "thursday",
                        "start": 810,
                        "end": 890
                    }
                ],
                "instructor": "Hrachya Kocharyan",
                "location": "Classroom 413W Paramaz Avedissian Building"
            },
            "19a511e819a511e819a511e819a511e8": {
                "name": "Mechanics Lab",
                "times": "TUE 10:30am-11:50am",
                "timesFormatted": [
                    {
                        "weekday": "tuesday",
                        "start": 630,
                        "end": 710
                    }
                ],
                "instructor": "Bilor Kurghinyan",
                "location": "Physics Lab Main Building"
            },
            "4d1a08b34d1a08b34d1a08b34d1a08b3": {
                "name": "Freshman Seminar 2",
                "times": "TUE 9:00am-10:20am, THU 9:00am-10:20am",
                "timesFormatted": [
                    {
                        "weekday": "tuesday",
                        "start": 540,
                        "end": 620
                    },
                    {
                        "weekday": "thursday",
                        "start": 540,
                        "end": 620
                    }
                ],
                "instructor": "Dvin Titizian",
                "location": "Classroom 204M Main Building"
            },
            "b5869cc0b5869cc0b5869cc0b5869cc0": {
                "name": "Calculus 2",
                "times": "MON 9:30am-10:20am, WED 9:30am-10:20am, FRI 9:30am-10:20am",
                "timesFormatted": [
                    {
                        "weekday": "monday",
                        "start": 570,
                        "end": 620
                    },
                    {
                        "weekday": "wednesday",
                        "start": 570,
                        "end": 620
                    },
                    {
                        "weekday": "friday",
                        "start": 570,
                        "end": 620
                    }
                ],
                "instructor": "Karen Keryan",
                "location": "Classroom 414W Paramaz Avedissian Building"
            },
            "1e8fa2c21e8fa2c21e8fa2c21e8fa2c2": {
                "name": "Linear Algebra",
                "times": "MON 8:30am-9:20am, WED 8:30am-9:20am, FRI 8:30am-9:20am",
                "timesFormatted": [
                    {
                        "weekday": "monday",
                        "start": 510,
                        "end": 560
                    },
                    {
                        "weekday": "wednesday",
                        "start": 510,
                        "end": 560
                    },
                    {
                        "weekday": "friday",
                        "start": 510,
                        "end": 560
                    }
                ],
                "instructor": "Vahagn Mikayelyan",
                "location": "Classroom 306E Paramaz Avedissian Building"
            },
            "729295e8729295e8729295e8729295e8": {
                "name": "The Scientific Method & Critical Thinking",
                "times": "MON 11:30am-12:20pm, WED 11:30am-12:20pm, FRI 11:30am-12:20pm",
                "timesFormatted": [
                    {
                        "weekday": "monday",
                        "start": 690,
                        "end": 740
                    },
                    {
                        "weekday": "wednesday",
                        "start": 690,
                        "end": 740
                    },
                    {
                        "weekday": "friday",
                        "start": 690,
                        "end": 740
                    }
                ],
                "instructor": "David B Davidian",
                "location": "Classroom 113W Paramaz Avedissian Building"
            },
            "460bef30460bef30460bef30460bef30": {
                "name": "Comparative Politics",
                "times": "MON 10:30am-11:20am, WED 10:30am-11:20am, FRI 10:30am-11:20am",
                "timesFormatted": [
                    {
                        "weekday": "monday",
                        "start": 630,
                        "end": 680
                    },
                    {
                        "weekday": "wednesday",
                        "start": 630,
                        "end": 680
                    },
                    {
                        "weekday": "friday",
                        "start": 630,
                        "end": 680
                    }
                ],
                "instructor": "Yevgenya Paturyan",
                "location": "Classroom 215E Paramaz Avedissian Building"
            }
        },
        {},
        {}
    ]


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

    // This function enables small icon window when the main window is closed
    function enableStickyClosedWindow() {
        const sticky = document.createElement('div');
        sticky.id = "sticky-window-aua-utils";
        sticky.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 40px;
        height: 40px;
        cursor: grab;
        z-index: 9999;
        user-select: none;
    `;

        const img = document.createElement('img');
        img.src = 'https://raw.githubusercontent.com/rezocrypt/aua-utils/refs/heads/main/resources/logos/logo.png';
        img.style.cssText = `
        width: 100%;
        height: 100%;
    `;
        img.draggable = false;
        sticky.appendChild(img);
        document.body.appendChild(sticky);

        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;
        let hasMoved = false; // track if element was moved

        sticky.onmousedown = e => {
            isDragging = true;
            hasMoved = false;
            const rect = sticky.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            sticky.style.cursor = 'grabbing';
            e.preventDefault();
        };

        document.onmousemove = e => {
            if (!isDragging) return;
            const newLeft = e.clientX - offsetX;
            const newTop = e.clientY - offsetY;
            if (sticky.offsetLeft !== newLeft || sticky.offsetTop !== newTop) hasMoved = true;
            sticky.style.left = `${newLeft}px`;
            sticky.style.top = `${newTop}px`;
        };

        document.onmouseup = () => {
            if (isDragging) sticky.style.cursor = 'grab';
            isDragging = false;
        };

        sticky.onclick = () => {
            if (!hasMoved) disableStickyClosedWindow();
        };
    }

    // Disables sticky window
    function disableStickyClosedWindow() {
        const sticky = document.getElementById('sticky-window-aua-utils');
        if (sticky) sticky.remove();

        // Also showing main window
        showMainWindow();
    }


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
            max-height: 90vh;
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
        image.src = "https://raw.githubusercontent.com/rezocrypt/aua-utils/refs/heads/main/resources/logos/logo.png";
        image.style.cssText = `
            width: 38px;
            height: 38px;
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


        // Calendar show hide button of header 
        const calendarShowButton = document.createElement("div");
        calendarShowButton.textContent = "";
        calendarShowButton.title = "Show/Hide Calendar";
        calendarShowButton.style.cssText = `
            background-image: url("https://cdn-icons-png.flaticon.com/512/9926/9926396.png");
            background-repeat: no-repeat;
            background-position: center;
            background-size: 25px 25px;
            position: absolute;
            top: 8px;
            left: 8px;
            width: 24px;
            height: 24px;
            border: none;
            color: #fff;
            font-weight: bold;
            font-size: 20px;
            border-radius: 4px;
            cursor: pointer;
            line-height: 20px;
            text-align: center;
            padding: 0;
            transition: 0.2s;
        `;

        // Adding event listeners to close button for hover effect and click action
        calendarShowButton.addEventListener("mouseenter", () => {
            calendarShowButton.style.opacity = "0.8";
        });
        calendarShowButton.addEventListener("mouseleave", () => {
            calendarShowButton.style.opacity = "1";
        });
        calendarShowButton.addEventListener("click", () => switchScheduleVisibility());

        // Appending close button to header
        header.appendChild(calendarShowButton);


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


        // ----- Schedule Section -----

        // Title (dropdown toggle)
        const scheduleTitle = document.createElement("div");
        scheduleTitle.style.cssText = `
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

        const scheduleArrow = document.createElement("span");
        scheduleArrow.textContent = "▸"; // closed by default
        scheduleArrow.style.fontSize = "12px";

        const scheduleTitleText = document.createElement("span");
        scheduleTitleText.textContent = "Schedule";

        scheduleTitle.appendChild(scheduleArrow);
        scheduleTitle.appendChild(scheduleTitleText);
        content.appendChild(scheduleTitle);

        // Container
        const scheduleContainer = document.createElement("div");
        scheduleContainer.style.cssText = `
            display: none; /* closed by default */
            grid-template-columns: repeat(2, 1fr);
            gap: 6px 12px;
            margin-bottom: 10px;
        `;
        content.appendChild(scheduleContainer);

        // Toggle logic
        let scheduleVisible = false; // closed by default
        scheduleTitle.addEventListener("click", () => {
            scheduleVisible = !scheduleVisible;
            scheduleContainer.style.display = scheduleVisible ? "grid" : "none";
            scheduleArrow.textContent = scheduleVisible ? "▾" : "▸";
        });

        // helper: small subtitle
        function createScheduleSubtitle(text) {
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

        // Only Schedule button part
        scheduleContainer.appendChild(createScheduleSubtitle("Fits the schedule"));

        const onlyScheduleLabel = document.createElement("label");
        onlyScheduleLabel.style.cssText = `
            grid-column: span 2;
            display: flex;
            align-items: center;
            font-size: 13px;
            cursor: pointer;
            color: ${AUA_BLUE};
        `;

        const onlyScheduleCheckbox = document.createElement("input");
        onlyScheduleCheckbox.type = "checkbox";
        onlyScheduleCheckbox.id = "fits-schedule-checkbox";
        onlyScheduleCheckbox.style.marginRight = "6px";
        onlyScheduleCheckbox.addEventListener("change", highlightRows);

        onlyScheduleLabel.appendChild(onlyScheduleCheckbox);
        onlyScheduleLabel.appendChild(document.createTextNode("Show only courses that fit the schedule"));
        scheduleContainer.appendChild(onlyScheduleLabel);



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


        // ---- Themes (1 ... 9)

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


        // ---- Themes Mode (or / and)

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


        // ---- Class Level selection (upper / lower)
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

        // Setupping all schedule things
        setupSchedule();

        // Calling some additional design things that must be applied before showing
        setupAdditionalDesign();

        // Highlighting rows after all is done
        highlightRows();

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

    // Function for showing window (when it is closed)
    function showMainWindow() {
        // Getting the window element
        const win = document.getElementById("aua-courses-plugin-window");
        if (win) {
            win.style.display = "block";
        }
    }

    // Function for closing the plugin window
    function closeWindow() {
        // Getting the window element
        const win = document.getElementById("aua-courses-plugin-window");
        if (win) {
            win.style.display = "none";
        }

        // Checking if already notified not to notify
        if (notificationShown === false) {
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


            // Changing state 
            notificationShown = true;

        }

        // Enabling sticky window
        enableStickyClosedWindow();
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

    // Function for making column with given index invisible
    function makeColumnInvisible(index) {
        document.querySelectorAll("table tr").forEach((row, rowIndex) => {
            const cells = row.querySelectorAll("th, td"); // get both th and td
            const cell = cells[index];
            if (cell) cell.style.display = "none";
        });

    }

    // Function for additional design setup
    function setupAdditionalDesign() {

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

            // Adding instructions
            header.title = "Click to remove column";

            // Hover effect
            header.addEventListener("mouseenter", () => {
                header.style.backgroundColor = "#ff4d4d";
                header.style.color = "#fff";
            });

            header.addEventListener("mouseleave", () => {
                header.style.backgroundColor = "";
                header.style.color = "";
            });

            // Click to remove column
            header.onclick = () => {
                makeColumnInvisible(index);
            };
        });

        // By default remove 2 columns
        makeColumnInvisible(9);
        makeColumnInvisible(10);

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

        // This array contains not clickable td indexes (like section or session)
        const notClickableIndexes = [1, 2, 3, 8, 9, 10];

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
            if (target.id === "course-controller-td") { return; }

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
            let bgColor;

            // Making background color if it is clickable
            if (notClickableIndexes.includes(index)) {
                bgColor = "#e9e9e9ff";
            }
            else {
                bgColor = stringToDistinctColor(text);
            }

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
                if (!notClickableIndexes.includes(index)) {
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

                }

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

            // Changing cursor to default (and not pointer)
            if (notClickableIndexes.includes(index)) {
                target.style.cursor = "default";
            }

            // If clickable doing search highlighting
            if (!notClickableIndexes.includes(index)) {

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

    // Function to get if current row matches for the schedule filter
    function getScheduleMatch(row) {

        // ----- Fits schedule -----

        // Getting if only schedule option is checked or not
        let fitsSchedule = document.getElementById("fits-schedule-checkbox");
        if (fitsSchedule) { fitsSchedule = fitsSchedule.checked }

        // Getting decision for only schedule option
        const doesCourseFitSchedule = row.classList.contains("course-fits-schedule");
        if (fitsSchedule) {
            if (doesCourseFitSchedule) {
                return true;
            }
            else {
                return false;
            }
        }

        // Finally returning true
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



            // ----- Schedule Matching

            // Defining scheduleMatch which is responsible for final decision of schedule part
            let scheduleMatch = getScheduleMatch(row);


            // ----- Final Decision -----

            // I think its best to check if all three matches are true. Also if you think it would 
            // be useful you can add option to choose AND/OR logic between these three filters but idk,
            // it will make everything more complicated.
            let finalMatch = searchMatches && (daysMatch && timesMatch) && genedMatch && scheduleMatch;

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


        // Scrolling to nearest matching row only if show only matching is not true
        if (!showOnly) {
            scrollToNearestMatching();
        }

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


    // ----- Schedule -----

    // Function for generating hash for string
    function generateHash(str) {
        // FNV-1a 32-bit
        let hash = 2166136261;
        for (let i = 0; i < str.length; i++) {
            hash ^= str.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }
        hash >>>= 0; // convert to unsigned

        // Convert to fixed-size hex string (8 chars) and expand to 32 chars
        let hex = hash.toString(16).padStart(8, '0');
        while (hex.length < 32) {
            hex += hex; // repeat until 32 chars
        }
        return hex.slice(0, 32);
    }


    // Function for generating ids for each course
    function generateIdsForCourses() {
        // Getting rows
        const rows = getRows();

        // Going through each row
        rows.forEach((row, index) => {
            // Defining main uniqueness variable for course
            let courseUniqueText = "";

            // Getting some identifiers for each course
            const courseName = row.children[indexes.indexOf('name')].textContent.split("(")[0];
            const courseSection = row.children[1].textContent;
            const courseInstructor = row.children[5].textContent;
            const courseTimes = row.children[6].textContent;

            // Combining to one variable for getting id from it
            courseUniqueText += courseName;
            courseUniqueText += courseSection;
            courseUniqueText += courseInstructor;
            courseUniqueText += courseTimes;

            // Getting id from course unique text
            const courseId = generateHash(courseUniqueText);

            // Adding class with id included
            row.classList.add(`course-${courseId}`)

            // Adding also some variable in row object
            row.dataset.courseId = courseId;
        })
    }

    // Function for import button
    function importButtonFunctionality() {
        // 1. Create a hidden file input
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json"; // only JSON files

        input.addEventListener("change", (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedSchedule = JSON.parse(e.target.result);

                    // Push into schedulesData.schedules
                    schedulesData.schedules.push(importedSchedule);

                    // Update activeScheduleIndex to the newly imported schedule
                    schedulesData.activeScheduleIndex = schedulesData.schedules.length - 1;

                    // Call loadSchedule function
                    if (typeof loadSchedule === "function") {
                        loadSchedule();
                    }
                } catch (err) {
                    console.error("Invalid JSON file", err);
                }
            };
            reader.readAsText(file);
        });

        // 2. Trigger file selector
        input.click();
    }


    // Function for export button
    function exportButtonFunctionality() {
        // Prevent multiple windows
        if (document.getElementById("export-window")) return;

        // Main window
        const overlay = document.createElement("div");
        overlay.id = "export-window";
        overlay.style.cssText = `
        position: fixed;
        top: 100px;
        left: 100px;
        width: 320px;
        background: #fff;
        border: 1px solid rgba(0,0,0,0.15);
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        z-index: 9999;
        font-family: system-ui, sans-serif;
    `;

        // Header (drag handle)
        const header = document.createElement("div");
        header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 12px;
        cursor: move;
        border-bottom: 1px solid rgba(0,0,0,0.1);
        user-select: none;
    `;

        // Title
        const title = document.createElement("span");
        title.textContent = "Export";
        title.style.cssText = `
        font-size: 14px;
        font-weight: 600;
    `;

        // Close button
        const closeBtn = document.createElement("button");
        closeBtn.textContent = "✕";
        closeBtn.style.cssText = `
        background: none;
        border: none;
        font-size: 16px;
        cursor: pointer;
        opacity: 0.6;
        border-radius: 4px;
        padding: 2px 6px;
    `;
        closeBtn.onmouseenter = () => {
            closeBtn.style.background = "rgba(255,0,0,0.12)";
            closeBtn.style.color = "#b00000";
            closeBtn.style.opacity = "1";
        };
        closeBtn.onmouseleave = () => {
            closeBtn.style.background = "none";
            closeBtn.style.color = "inherit";
            closeBtn.style.opacity = "0.6";
        };
        closeBtn.onclick = () => overlay.remove();

        header.appendChild(title);
        header.appendChild(closeBtn);

        // Content
        const content = document.createElement("div");
        content.style.cssText = `
        padding: 14px;
        display: flex;
        gap: 10px;
    `;

        // Helper to create option buttons
        function createOption(label, onClick) {
            const btn = document.createElement("button");
            btn.textContent = label;
            btn.style.cssText = `
            flex: 1;
            padding: 8px 0;
            border-radius: 6px;
            border: 1px solid rgba(0,0,0,0.15);
            background: #f9f9f9;
            cursor: pointer;
            font-size: 13px;
            transition: background 0.15s ease;
        `;
            btn.onmouseenter = () => {
                btn.style.background = "rgba(0,0,0,0.05)";
            };
            btn.onmouseleave = () => {
                btn.style.background = "#f9f9f9";
            };
            btn.onclick = onClick;
            return btn;
        }

        // Export options
        content.appendChild(createOption(".txt", exportAsTXT));
        content.appendChild(createOption(".ics", exportAsICS));
        content.appendChild(createOption(".csv", exportAsCSV));
        content.appendChild(createOption(".json", exportAsJSON));

        overlay.appendChild(header);
        overlay.appendChild(content);
        document.body.appendChild(overlay);

        // Drag logic
        let dragging = false, offsetX = 0, offsetY = 0;

        header.onmousedown = (e) => {
            dragging = true;
            offsetX = e.clientX - overlay.offsetLeft;
            offsetY = e.clientY - overlay.offsetTop;

            document.onmousemove = (e) => {
                if (!dragging) return;
                overlay.style.left = `${e.clientX - offsetX}px`;
                overlay.style.top = `${e.clientY - offsetY}px`;
            };

            document.onmouseup = () => {
                dragging = false;
                document.onmousemove = null;
                document.onmouseup = null;
            };
        };
    }

    // Function for making schedule visibility on or off
    function switchScheduleVisibility() {
        // Changing the opened state in data object
        schedulesData.isScheduleOpened = !schedulesData.isScheduleOpened;

        // Defining schedule container element to hide and show it
        const scheduleContainerElement = document.getElementById("schedule-container");

        // Hiding and showing it
        scheduleContainerElement.style.display = schedulesData.isScheduleOpened ? "grid" : "none";

        // Getting elements to change their style
        const belowScheduleOpenerButton = document.getElementById("schedule-opener-id");

        if (schedulesData.isScheduleOpened) {
            belowScheduleOpenerButton.textContent = 'Hide Schedule';
        }
        else {
            belowScheduleOpenerButton.textContent = 'Show My Schedule';
        }

        const offset = 200; // pixels from top
        const top = belowScheduleOpenerButton.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });

    }

    // Function for setupping schedule opener
    function setupScheduleOpener() {
        // Finding position to add after
        const scheduleToAddBefore = document.getElementById(`schedule-container`);
        // const scheduleToAddBefore = document.querySelector(`.table-responsive`);

        // Setupping button
        const scheduleOpenerButton = document.createElement("div");
        scheduleOpenerButton.id = 'schedule-opener-id';
        scheduleOpenerButton.textContent = "Hide"
        scheduleOpenerButton.style.cssText = `
            width: 100%;
            cursor: pointer;
            height: auto;
            text-align: center;
            font-size: 21px;
            color: white;
            background-color: #88c4ecff;
            margin-top: 15px;
            padding: 7px;
            margin-bottom: 15px;
            border-radius: 5px;
            font-family: system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", Arial, sans-serif !important;
        `

        scheduleToAddBefore.before(scheduleOpenerButton)

        scheduleOpenerButton.onclick = () => { switchScheduleVisibility() }
    }

    // Function for setupping schedule window
    function setupScheduleWindow() {
        // Checking if already exists then we need to exit
        if (document.getElementById("schedule-container")) {
            return;
        }

        // Finding element to add before it our schedule section
        const tableToAddBefore = document.querySelector(`.table-responsive`);

        // Creating main schedule container
        const scheduleContainer = document.createElement('div');
        scheduleContainer.id = "schedule-container";
        scheduleContainer.style.cssText = `
            display: block;
            width: 100%;
            height: auto;
            min-height: 60vh;
            background-color: #ffffffff;
            border: 1px solid #b1b1b1af;
            margin-bottom: 20px;
            display: grid;
            grid-template-columns: 80% 20%;
        `;
        tableToAddBefore.before(scheduleContainer);

        // Creating schedule calendar container
        const scheduleCalendar = document.createElement('div');
        scheduleCalendar.id = "schedule-calendar-container";
        scheduleCalendar.style.cssText = `
            display: grid;
            grid-template-rows: 47px minmax(0, 1fr);
            width: 100%;
            background-color: #F5F5F5;
        `;

        // Appending calendar part to main container
        scheduleContainer.appendChild(scheduleCalendar);


        // Creating wishlist container for classes that user preferred
        const wishlistContainer = document.createElement('div');
        wishlistContainer.id = "wishlist-container";
        wishlistContainer.style.cssText = `
            display: grid;
            grid-template-rows: 47px 1fr;
            width: 100%;
            height: 100%;
            background-color: #E0F7FA;
        `;

        // Appending wishlist part to main container
        scheduleContainer.appendChild(wishlistContainer);


        // Creating schedulesTab where user can select one of the saved schedules
        const schedulesTabContainer = document.createElement('div');
        schedulesTabContainer.id = "schedules-tab-container";
        schedulesTabContainer.style.cssText = `
            display: grid;
            grid-template-columns: 80% 20%;
            width: 100%;
            height: 100%;
            background-color: #d8ffffff;
        `;

        // Appending
        scheduleCalendar.appendChild(schedulesTabContainer);


        // Creating part where will be schedule tabs
        const schedulesSwitchesContainer = document.createElement('div');
        schedulesSwitchesContainer.id = "schedules-switches-container";
        schedulesSwitchesContainer.style.cssText = `
            display: flex;
            flex-direction: row;
            width: 100%;
            height: 100%;
            background-color: #d8d8d8ff;
            overflow-x: auto;
            align-items: center;
        `;
        schedulesTabContainer.appendChild(schedulesSwitchesContainer);

        // Creating section where will be export import and such buttons
        const schedulesToolsContainer = document.createElement('div');
        schedulesToolsContainer.id = "schedules-tools-container";
        schedulesToolsContainer.style.cssText = `
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            align-items: center;
            overflow-x: auto;
            overflow-y: hidden;
            width: 100%;
            height: 100%;
            justify-content: center;
            background-color: #dbdbdb;
            gap: 4px;
        `;
        schedulesTabContainer.appendChild(schedulesToolsContainer);


        // Adding export button
        const exportButton = document.createElement('div');
        exportButton.id = "export-button";
        exportButton.textContent = "Export";
        exportButton.style.cssText = `
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 70px;
            height: 24px;
            margin: 3px;
            color: #fff;
            background: #747474ff;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.2s;
        `;
        exportButton.onmouseover = () => exportButton.style.background = '#535353ff';
        exportButton.onmouseout = () => exportButton.style.background = '#747474ff';
        exportButton.onclick = () => { exportButtonFunctionality() };
        schedulesToolsContainer.appendChild(exportButton);

        // Adding import button
        const importButton = document.createElement('div');
        importButton.id = "import-button";
        importButton.textContent = "Import";
        importButton.style.cssText = `
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 70px;
            height: 24px;
            margin: 3px;
            color: #fff;
            background: #747474ff;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.2s;
        `;
        importButton.onmouseover = () => importButton.style.background = '#535353ff';
        importButton.onmouseout = () => importButton.style.background = '#747474ff';
        importButton.onclick = () => { importButtonFunctionality() };
        schedulesToolsContainer.appendChild(importButton);



        // Creating schedulesTab where user can select one of the saved schedules
        const activeSchedule = document.createElement('div');
        activeSchedule.id = "active-schedule-container";
        activeSchedule.style.cssText = `
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 5px;
            width: 100%;
            box-sizing: border-box;
            padding: 10px;
            height: auto;
            background-color: #bfbfbf;
        `;

        // Adding active schedule to schedule calendar
        scheduleCalendar.appendChild(activeSchedule);

        // IIFE to create weekdays and class containers
        (function () {
            const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
            const container = document.getElementById("active-schedule-container");

            weekdays.forEach(day => {
                // Create column for each day
                const dayColumn = document.createElement("div");
                dayColumn.style.cssText = `
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                `;

                // Weekday header
                const dayHeader = document.createElement("div");
                dayHeader.textContent = day;
                dayHeader.style.cssText = `
                    font-weight: bold;
                    margin-bottom: 4px;
                `;

                // Container for classes under this weekday
                const classesContainer = document.createElement("div");
                classesContainer.id = `classes-${day.toLowerCase()}`;
                classesContainer.style.cssText = `
                    flex: 1;
                    width: 100%;
                    border-radius: 5px;
                    background-color: #ffffffa6; /* optional */
                `;

                // Append header and classes container to column
                dayColumn.appendChild(dayHeader);
                dayColumn.appendChild(classesContainer);

                // Append day column to grid
                container.appendChild(dayColumn);

                // By default not showing the sunday because there must be no classes
                if (day === "Sunday" || day === "Saturday") {
                    dayColumn.style.display = "none";
                    dayColumn.id = `column-${day.toLowerCase()}`;
                }
            });
        })();


        // Creating wishlist content

        // Creating wishlist toolbar for showing what is it
        const wishlistToolbar = document.createElement('div');
        wishlistToolbar.id = "wishlist-toolbar";
        wishlistToolbar.style.cssText = `
            width: 100%;
            height: auto;
            background-color: #a1a1a1ff;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        // Adding to parent
        wishlistContainer.appendChild(wishlistToolbar);


        // Creating text "Wishlist" for toolbar section (now there are no any tools yet)
        const wishlistTitle = document.createElement('span');
        wishlistTitle.id = "wishlist-title";
        wishlistTitle.textContent = "Wishlist (?)"
        wishlistTitle.style.cssText = `
            display: block;
            color: #e0e0e0ff;
            font-size: 20px;
        `;
        wishlistTitle.title = "Here are stored the classes that you may add to your schedule."

        // Adding to toolbar
        wishlistToolbar.appendChild(wishlistTitle)


        // Creating wishlist courses container for adding courses there
        const wishlistCourses = document.createElement('div');
        wishlistCourses.id = "wishlist-courses";
        wishlistCourses.style.cssText = `
            display: block;
            width: 100%;
            height: auto;
            background-color: #e7e7e7;
        `;

        // Adding to parent
        wishlistContainer.appendChild(wishlistCourses);

        // Setupping scheudle opener button
        setupScheduleOpener();
    }

    // Setup section name in thead
    function setupScheduleThead() {
        // Appending thead to include also title for schedule row
        const thead = document.querySelector('#crsbysemester thead tr');
        if (thead) {
            const th = document.createElement('th');
            th.textContent = 'Schedule';
            thead.appendChild(th);
        }
    }

    // This function adds course adding and saving buttons in each course
    function setupScheduleButtonsInEachCourse() {
        const rows = getRows();

        rows.forEach((row, index) => {
            // Defining td element which is main controller
            const courseControllerTD = document.createElement('td');
            courseControllerTD.id = "course-controller-td";
            courseControllerTD.style.cssText = `
                border: 1px solid rgba(0, 0, 0, 0.3);
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100px;
            `;

            // Adding controller for adding to schedule
            const courseAddButton = document.createElement('div');
            courseAddButton.id = `course-add-button`;
            courseAddButton.style.cssText = `
                width: 28px;
                height: 28px;
                display: flex;
                justify-content: center;
                align-items: center;
                color: white;
                border-radius: 4px;
                cursor: pointer;
                font-size: 16px;
                margin-right: 7px;
            `;
            courseAddButton.textContent = `+`;
            courseAddButton.title = "Add course";

            // Adding button to td
            courseControllerTD.appendChild(courseAddButton);

            // Adding controller for saving to schedule
            const courseSaveButton = document.createElement('div');
            courseSaveButton.id = `course-save-button`;
            courseSaveButton.style.cssText = `
                width: 28px;
                height: 28px;
                display: flex;
                justify-content: center;
                align-items: center;
                color: white;
                border-radius: 4px;
                cursor: pointer;
                font-size: 20px;
            `;
            courseSaveButton.textContent = `♥`;

            // Adding button to td
            courseControllerTD.appendChild(courseSaveButton);

            // Adding td to row
            row.appendChild(courseControllerTD);
        });


    }

    // Function for removing course from calendar
    function removeCourseFromCalendar(id) {
        // Removing course from schedules database
        delete schedulesData.schedules[schedulesData.activeScheduleIndex][id];

        // Updating schedule controller buttons
        updateCoursesSchedulerContainerButtons();

        // Reloading schedule
        loadSchedule(schedulesData.activeScheduleIndex);

        // Reloading also highlighting
        highlightRows();
    }


    // Function for removing course from calendar
    function removeCourseFromWishlist(id) {
        // Removing course from wishlist database
        delete schedulesData.wishlist[id];

        // Updating schedule controller buttons
        updateCoursesSchedulerContainerButtons();

        // Reloading wishlist
        loadWishlist();
    }

    // Function which loads all wish lists
    function loadWishlist() {
        // Getting wishlist
        const wishlist = schedulesData.wishlist;

        // Cleraing wishlist
        const wishlistContainer = document.getElementById("wishlist-courses")
        while (wishlistContainer.firstChild) {
            wishlistContainer.removeChild(wishlistContainer.firstChild);
        }

        // Adding each course from wishlist to actual wishlist container
        for (const courseId in wishlist) {
            addCourseToWishlistVisual(courseId);
        }

        // Updating buttons of courses
        updateCoursesSchedulerContainerButtons()
    }

    // Function to get formatted course times for wishlist (to include all days and times)
    function formatCourseTimesForWishlistCourse(times) {
        const dayMap = {
            monday: 'Mon',
            tuesday: 'Tue',
            wednesday: 'Wed',
            thursday: 'Thu',
            friday: 'Fri',
            saturday: 'Sat',
            sunday: 'Sun'
        };

        const toTime = m =>
            String(Math.floor(m / 60)).padStart(2, '0') + ':' +
            String(m % 60).padStart(2, '0');

        const groups = {};

        for (const t of times) {
            const key = `${t.start}-${t.end}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(dayMap[t.weekday]);
        }

        return Object.entries(groups)
            .map(([key, days]) => {
                const [start, end] = key.split('-');
                return `${days.join('/')} ${toTime(+start)}-${toTime(+end)}`;
            })
            .join(', ');
    }

    // Function which generates a div for course in schedule
    function generateCourseDiv(id = null, formattedTime = null, forCalendar = true) {
        // Getting if there is row for that id
        const courseRow = document.querySelector(`.course-${id}`)

        // Extracting course data from calendar
        const extractedCourseData = extractCourseDataFromSchedules(id)

        // Creating main course div
        const courseDiv = document.createElement("div");
        courseDiv.classList.add("courseDiv");
        courseDiv.classList.add(`course-div-${id}`);

        // Trying to get old course formatted times
        let oldCourseFormattedTimes = (schedulesData.wishlist[id]) ? schedulesData.wishlist[id].timesFormatted : schedulesData.schedules[schedulesData.activeScheduleIndex][id].timesFormatted;

        // Giving style to course
        courseDiv.style.cssText = `
            width: auto;
            height: auto;
            margin: 10px;
            padding: 10px;
            border-radius: 5px;
            position: relative;
            max-width: 200px;
            transition: background-color 0.2s;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            justify-content: center;
        `;

        // If course with given id exists then it must be shown as disabled
        if (courseRow) {
            // Making existing background color
            courseDiv.style.backgroundColor = "#607D8B";
            // courseDiv.style.backgroundColor = "#4caf4fdc";

        }
        else {
            // Making disabled background color
            courseDiv.style.backgroundColor = "#757575";

            // Making cursor to be ? and to show help text when hovered
            courseDiv.style.cursor = "help";
            courseDiv.title = "The following course doesn't exist anymore, it is removed or one of the parameters is modified.";
        }


        // Generating title for name of that class
        const courseTitle = document.createElement("div");
        courseTitle.style.cssText = `
               color: white;
               font-weight: bolder;
               font-size: 15px; 
               margin-bottom: 10px;
            `;
        courseTitle.textContent = courseRow?.children[indexes.indexOf("name")].textContent.split("(")[0] ?? extractedCourseData.name;

        // Adding title to div
        courseDiv.appendChild(courseTitle);


        // Generating instructor name for that course
        const courseInstructorName = document.createElement("div");
        courseInstructorName.style.cssText = `
            color: white;
            font-size: 10px; 
            font-weight: bold;
            margin-bottom: 10px;
        `;
        courseInstructorName.textContent = courseRow?.children[indexes.indexOf("instructor")].textContent ?? extractedCourseData.instructor;

        // Adding title to div
        courseDiv.appendChild(courseInstructorName);


        // Generating location for that course
        const courseLocation = document.createElement("div");
        courseLocation.style.cssText = `
            color: white;
            font-size: 10px;
            margin-bottom: 10px;
        `;
        courseLocation.textContent = courseRow?.children[indexes.indexOf("location")].textContent ?? extractedCourseData.location;

        // Adding title to div
        courseDiv.appendChild(courseLocation);


        // Generating times for that course

        // Saving start and end in elements dataset
        if (formattedTime) {
            courseDiv.dataset.start = formattedTime.start;
            courseDiv.dataset.end = formattedTime.end;
        }


        // Top time
        const topTime = document.createElement("div");
        topTime.textContent = `${formattedTime ? minutesToTime(formattedTime.start) : formatCourseTimesForWishlistCourse(oldCourseFormattedTimes)}`;
        topTime.style.cssText = `
                font-size: 14px;
                margin-bottom: 10px;
                font-weight: bold;
                color: #f3f5bfff;
            `;

        // Bottom time
        const bottomTime = document.createElement("div");
        bottomTime.textContent = `${formattedTime ? minutesToTime(formattedTime.end) : formatCourseTimesForWishlistCourse(oldCourseFormattedTimes)}`;
        bottomTime.style.cssText = `
                font-size: 14px;
                font-weight: bold;
                color: #f3f5bfff;
                font-weight: bold;


            `;

        // Restore content in between
        courseDiv.prepend(topTime);
        courseDiv.appendChild(bottomTime);

        // Create remove button
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "×";
        removeBtn.style.cssText = `
                border: none;
                background-color: #ff4d4dcc;
                color: #eeeeeeff;
                font-size: 16px;
                padding: 0px 5px 0px 5px;
                border-radius: 3px;
                cursor: pointer;
                display: block;
                position: absolute;
                top: 5px;
                right: 5px;
                transition: background-color 0.2s;
            `;

        // Remove parent courseDiv on click
        if (forCalendar) {
            removeBtn.addEventListener("click", (event) => {
                // Prevent parent div click
                event.stopPropagation();

                removeCourseFromCalendar(id);
            });

            // Also add title for removing from calendar
            removeBtn.title = "Delete course from calendar."
        }
        else {
            removeBtn.addEventListener("click", (event) => {
                // Prevent parent div click
                event.stopPropagation();

                removeCourseFromWishlist(id);
            });

            // Also add title for removing from wishlist
            removeBtn.title = "Delete course from wishlist."
        }

        // Adding hover effect for highlighting all course divs that are same
        removeBtn.onmouseover = () => {
            removeBtn.style.backgroundColor = '#972b2bcc';
        }

        removeBtn.onmouseout = () => {
            removeBtn.style.backgroundColor = '#ff4d4dcc';
        };

        // Add button to courseDiv
        courseDiv.appendChild(removeBtn);

        // Adding button for adding from wishlist to calendar
        if (!forCalendar && courseRow && checkCourseCanBeAdded(id)) {
            // Create remove button
            const addFromWishlistToCalendarButton = document.createElement("button");
            addFromWishlistToCalendarButton.title = "Add to schedule."
            addFromWishlistToCalendarButton.textContent = "+"; // Minimalistic cross
            addFromWishlistToCalendarButton.style.cssText = `
                border: none;
                background-color: #1bad7d;
                border-radius: 5px;
                color: #ffffffff;
                font-size: 16px;
                cursor: pointer;
                margin-left: 8px;
                text-align: center;
                position: absolute;
                bottom: 5px;
                right: 5px;
            `;

            // Adding event listener
            addFromWishlistToCalendarButton.addEventListener("click", (event) => {
                // Prevent parent div click
                event.stopPropagation();

                // Adding course to calendar
                addCourseToCalendar(id);
            });

            // Add button to courseDiv
            courseDiv.appendChild(addFromWishlistToCalendarButton);
        }

        // Adding hover effect for highlighting all course divs that are same
        courseDiv.onmouseover = () => {
            if (courseRow) {
                const sameCourseElements = document.querySelectorAll(`#schedule-container .course-div-${id}`);
                sameCourseElements.forEach(courseElement => {
                    courseElement.style.backgroundColor = '#455b66ff';
                });
            }

        };
        courseDiv.onmouseout = () => {
            if (courseRow) {
                const sameCourseElements = document.querySelectorAll(`#schedule-container .course-div-${id}`);
                sameCourseElements.forEach(courseElement => {
                    courseElement.style.backgroundColor = '#607D8B';
                });
            }
        };

        // Adding click effect to search the course when clicked
        courseDiv.onclick = () => {
            if (courseRow) {
                // Defining search input element
                const searchInputElement = document.getElementById("searchInput");

                // Getting search text
                let searchText = "";
                searchText += `"${courseRow?.children[indexes.indexOf("name")].textContent.split("(")[0] ?? extractedCourseData.name}" ` // Adding course name
                searchText += `"${courseRow?.children[indexes.indexOf("instructor")].textContent ?? extractedCourseData.instructor}" ` // Adding instructor
                searchText += `"${courseRow?.children[indexes.indexOf("location")].textContent ?? extractedCourseData.location}" ` // Adding location
                searchText += `"${courseRow?.children[indexes.indexOf("times")].textContent ?? ""}" ` // Adding location

                // Changing the value
                searchInputElement.value = (searchInputElement.value === searchText) ? "" : searchText;

                // Calling highlight rows
                highlightRows();
            }
        }

        // Returning the div
        return courseDiv;
    }

    // Fuction to convert minutes to human readable times
    function minutesToTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    }

    // Function for adding class to wishlist (trigger funciton)
    function addCourseToWishlist(id) {
        // Adding also to global object (which is database where all is stored)
        schedulesData.wishlist[id] = getCourseData(id);

        // Reloading wishlist
        loadWishlist()
    }

    // Function for adding class to wishlist (only visual)
    function addCourseToWishlistVisual(id) {
        // Defining wishlist courses container
        const wishlistContainer = document.getElementById("wishlist-courses")

        // Checking if there is already that class
        if (wishlistContainer.querySelector(`.course-div-${id}`)) { return }

        // Generating course div
        const courseDiv = generateCourseDiv(id, null, false);

        // Adding that course to wishlist
        document.getElementById("wishlist-courses").appendChild(courseDiv)
    }

    // Function for parsing times to some understandable format for schedules
    function parseScheduleTimes(input) {
        // Return false if schedule is "TBD"
        if (input.trim().toLowerCase() === "tbd") return false;

        // Map 3-letter days to full lowercase names
        const dayMap = {
            MON: "monday",
            TUE: "tuesday",
            WED: "wednesday",
            THU: "thursday",
            FRI: "friday",
            SAT: "saturday",
            SUN: "sunday"
        };

        // Convert time string (e.g., "2:30 PM") to minutes past midnight
        const toMinutes = (time) => {
            const match = time.match(/(\d+):(\d+)\s*(am|pm)/i);
            if (!match) return null; // invalid time format
            let [, h, m, ap] = match;
            let hour = Number(h) % 12;
            if (ap.toLowerCase() === "pm") hour += 12;
            return hour * 60 + Number(m);
        };

        const results = [];

        // Split by commas in case of multiple schedule entries
        input.split(",").forEach(part => {
            part = part.trim();
            if (!part) return;

            // Split into day(s) and time range
            const spaceIndex = part.search(/\d/); // first digit of time
            if (spaceIndex === -1) return; // invalid format

            const daysPart = part.slice(0, spaceIndex).trim();
            const timePart = part.slice(spaceIndex).trim();

            // Split time into start and end
            const timeMatch = timePart.match(/(\d+:\d+\s*(?:am|pm))\s*-\s*(\d+:\d+\s*(?:am|pm))/i);
            if (!timeMatch) return; // invalid time range
            const [, startTime, endTime] = timeMatch;

            // Handle multiple days separated by "/"
            daysPart.split("/").forEach(dayAbbr => {
                const weekday = dayMap[dayAbbr.toUpperCase()];
                if (!weekday) return; // invalid day
                results.push({
                    weekday,
                    start: toMinutes(startTime),
                    end: toMinutes(endTime)
                });
            });
        });

        return results;
    }



    // Function for getting course data
    function getCourseData(id) {
        // Getting if there is row for that id
        const courseRow = document.querySelector(`.course-${id}`)

        // Generating final data
        const data = {
            name: courseRow.children[indexes.indexOf('name')].textContent.split("(")[0],
            times: courseRow.children[indexes.indexOf('times')].textContent,
            timesFormatted: parseScheduleTimes(courseRow.children[indexes.indexOf('times')].textContent),
            instructor: courseRow.children[indexes.indexOf('instructor')].textContent,
            location: courseRow.children[indexes.indexOf('location')].textContent,
        }

        // Returning data
        return data;
    }

    // Function for checking if course can be added to schedule calendar
    function checkCourseCanBeAdded(id) {
        // Getting schedule data
        const scheduleData = schedulesData.schedules[schedulesData.activeScheduleIndex];

        // Getting course data
        const courseData = getCourseData(id);

        // Extracting formatted times
        const formattedTimes = courseData["timesFormatted"];

        // Checking if can be added
        if (formattedTimes === false) { return false; };

        // Final decision is here
        let canBeAdded = true;

        // Going through each time to check
        formattedTimes.forEach((newCourseTime, index) => {
            // Returning if already can't be added
            if (!canBeAdded) { return };

            for (const oldCourseId in scheduleData) {
                // Breaking if already can't be added
                if (!canBeAdded) { break };

                // Getting old course times as formatted
                const oldCourseFormattedTimes = scheduleData[oldCourseId]["timesFormatted"];

                // Iterating each old course to check weather our new course will not make mistakes in schedule
                oldCourseFormattedTimes.forEach((oldCourseTime) => {
                    // If not same they then returns because there is no need for times to compare
                    if (oldCourseTime.weekday !== newCourseTime.weekday) {
                        return;
                    }

                    // Defining some contants for final time checking
                    const oldCourseTimeStart = oldCourseTime.start;
                    const oldCourseTimeEnd = oldCourseTime.end;
                    const newCourseTimeStart = newCourseTime.start;
                    const newCourseTimeEnd = newCourseTime.end;

                    // Checking if there is time problem
                    if ((newCourseTimeStart >= oldCourseTimeStart && newCourseTimeStart < oldCourseTimeEnd) ||
                        (newCourseTimeEnd > oldCourseTimeStart && newCourseTimeEnd < oldCourseTimeEnd)
                    ) {
                        canBeAdded = false
                    }
                })
            }
        })

        // Returning final decision
        return canBeAdded;
    }

    // Function for loading courses from the given index schedule to the activeschedule
    function loadSchedule(index = null) {
        // Default index value
        if (index === null) {
            index = schedulesData.activeScheduleIndex;
        }

        // Extracting schedule data
        const schedule = schedulesData.schedules[index];

        // Clearing schedule visually
        clearCalendarVisual();

        // Going through each course and adding to calendar
        for (const courseId in schedule) {
            const course = schedule[courseId];
            addCourseToCalendarVisual(courseId);
        }

        // Finally adding gaps
        setupGapsInCalendar();

        // Updating buttons of courses
        updateCoursesSchedulerContainerButtons();

        // Reloading switches
        loadSchedulesSwitches();

        // Reloading wishlist
        loadWishlist();
    }

    // Function for clearing current calendar (only visual)
    function clearCalendarVisual() {
        const weekdays = [
            "monday", "tuesday", "wednesday", "thursday",
            "friday", "saturday", "sunday"
        ];

        weekdays.forEach(day => {
            const div = document.getElementById(`classes-${day}`);
            if (div) {
                while (div.firstChild) {
                    div.removeChild(div.firstChild);
                }
            }
        });
    }

    // Functin for adding course to schedule by button trigger
    function addCourseToCalendar(id) {
        // Checking if we can add that course (is there free time)
        if (!checkCourseCanBeAdded(id)) { return };

        // Adding to global object (which is database where all is stored)
        schedulesData.schedules[schedulesData.activeScheduleIndex][id] = getCourseData(id);

        // Finally loading the schedule
        loadSchedule(schedulesData.activeScheduleIndex);

        // Reloading also highlighting
        highlightRows();
    }

    // This function extracts course data from saved schedules if it is unavailable or modified in jenzabar
    function extractCourseDataFromSchedules(courseId) {
        // This variable contains matching course
        let matchingCourse = null;

        // Finding in all schedules
        schedulesData.schedules.forEach((schedule) => {
            if (schedule[courseId]) {
                matchingCourse = schedule[courseId]
            }
        })

        // Finding in wishlist
        for (const wishlistCourseId in schedulesData.wishlist) {
            if (wishlistCourseId === courseId) {
                matchingCourse = schedulesData.wishlist[courseId];
            }
        }

        return matchingCourse;
    }

    // This function updates the visible days count
    function updateGridColumnsByVisibleDivs() {
        // 1. Hide columns if corresponding classes containers are empty
        const saturdayClasses = document.getElementById("classes-saturday");
        const sundayClasses = document.getElementById("classes-sunday");

        const saturdayColumn = document.getElementById("column-saturday");
        const sundayColumn = document.getElementById("column-sunday");

        if (saturdayClasses && saturdayColumn && saturdayClasses.querySelectorAll("div").length === 0) {
            saturdayColumn.style.display = "none";
        }

        if (sundayClasses && sundayColumn && sundayClasses.querySelectorAll("div").length === 0) {
            sundayColumn.style.display = "none";
        }

        // 2. Update grid columns based on visible children
        const container = document.getElementById("active-schedule-container");
        const visibleCount = [...container.children]
            .filter(el => el.style.display !== "none")
            .length;

        container.style.gridTemplateColumns = `repeat(${visibleCount}, 1fr)`;
    }




    // Function for adding course to schedule calendar
    function addCourseToCalendarVisual(id) {
        // Getting if there is row for that id
        const courseRow = document.querySelector(`.course-${id}`)

        // Extracting course data from calendar
        const extractedCourseData = extractCourseDataFromSchedules(id)

        // Getting RAW content of time
        const timeRAWContent = courseRow?.children[indexes.indexOf('times')].textContent.trim() ?? extractedCourseData.times;

        // Checking if time is available
        if (timeRAWContent.trim() === "TBD") { return false; }

        // Parsing times
        const times = parseScheduleTimes(timeRAWContent);

        // Calling for each time (like one time for MONDAY and one time for TUESDAY)
        times.forEach((time) => {
            const weekdayDivToAdd = document.getElementById(`classes-${time["weekday"]}`)
            const courseDiv = generateCourseDiv(id, time);

            // If time is sunday\
            if (time["weekday"] === "sunday" || time["weekday"] === "saturday") {
                document.getElementById(`column-${time["weekday"]}`).style.display = 'flex';
            }

            // Trying to add the courseDiv in RIGHT position (in right times)
            for (const child of weekdayDivToAdd.children) {
                if (+courseDiv.dataset.start < +child.dataset.start) {
                    weekdayDivToAdd.insertBefore(courseDiv, child);
                    return;
                }
            }

            // Adding in case if it hasn't returned and is the last time
            weekdayDivToAdd.appendChild(courseDiv);

        })

        // Updating columns count (if saturday or sunday was added)
        updateGridColumnsByVisibleDivs();
    }

    // Function for setupping gaps in calendar
    function setupGapsInCalendar() {
        const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

        for (const day of weekdays) {
            const weekdayDiv = document.getElementById(`classes-${day}`);
            if (!weekdayDiv) continue;

            const courses = Array.from(weekdayDiv.getElementsByClassName("courseDiv"));

            for (let i = 0; i < courses.length - 1; i++) {
                const first = courses[i];
                const second = courses[i + 1];

                const gapMinutes = +second.dataset.start - +first.dataset.end;
                if (gapMinutes <= 0) continue;

                const gapDiv = document.createElement("div");

                // show gap in hours if >60
                if (gapMinutes >= 60) {
                    const hours = Math.floor(gapMinutes / 60);
                    const minutes = gapMinutes % 60;
                    gapDiv.textContent = `Gap: ${hours}h ${minutes}m`;
                } else {
                    gapDiv.textContent = `Gap: ${gapMinutes} min`;
                }

                // proportional height (e.g., 1px per minute)
                const heightPx = gapMinutes; // adjust factor if needed
                gapDiv.style.cssText = `
            background-color: #FFCDD2;
            color: #721c24;
            text-align: center;
            margin: 10px;
            padding-top: 5px;
            padding-bottom: 5px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            height: ${heightPx}px;
            line-height: ${heightPx}px;
        `;

                first.insertAdjacentElement("afterend", gapDiv);
            }
        }
    }

    // Function for updating schedule controller buttons in each course
    function updateCoursesSchedulerContainerButtons() {
        // Getting all rows
        const rows = getRows()

        rows.forEach((row) => {
            const courseId = row.dataset.courseId;

            const saveButton = row.querySelector("#course-save-button");
            const addButton = row.querySelector("#course-add-button");

            // Making cursor default (if it was not allowed)
            addButton.style.cursor = "pointer";

            // Clearing classlist fits data
            row.classList.remove("course-fits-schedule")

            // Checking if already course is in schedule
            if (schedulesData.schedules[schedulesData.activeScheduleIndex][courseId]) {
                // Making - as button text
                addButton.textContent = '-';

                // Updating title info
                addButton.title = 'Remove course from schedule';

                // Changin background color
                addButton.style.backgroundColor = "#b94545fa";

                // Event listener for when clicked
                addButton.onclick = () => {
                    removeCourseFromCalendar(`${row.dataset.courseId}`);
                }
            }
            else {
                // Making + as button text
                addButton.textContent = '+';

                if (checkCourseCanBeAdded(courseId)) {
                    addButton.style.backgroundColor = "#3e913eef";
                    addButton.title = `Click to add the course to Schedule ${schedulesData.activeScheduleIndex + 1}`

                    // Event listener for when clicked
                    addButton.onclick = () => {
                        addCourseToCalendar(`${row.dataset.courseId}`);
                    }

                    // Adding class to row for making clear that this course fits
                    row.classList.add("course-fits-schedule")

                }
                else {
                    addButton.style.backgroundColor = "#cfceceff";
                    addButton.style.cursor = "not-allowed";
                    addButton.title = `This course doesn't fit in Schedule ${schedulesData.activeScheduleIndex + 1}`

                    // Event listener for when clicked
                    addButton.onclick = () => {
                    }
                }
            }

            // Checking if already course is in wishlist
            if (schedulesData.wishlist[courseId]) {
                saveButton.style.backgroundColor = "#ff0000";
                saveButton.style.color = "#ffffff";
                saveButton.title = "Remove from Wishlist";

                // Event listener for when clicked
                saveButton.onclick = () => {
                    removeCourseFromWishlist(`${row.dataset.courseId}`);
                }
            }
            else {
                saveButton.style.backgroundColor = "#e4e4e4ff";
                saveButton.style.color = "#ff0000";
                saveButton.title = "Add to Wishlist";

                // Event listener for when clicked
                saveButton.onclick = () => {
                    addCourseToWishlist(`${row.dataset.courseId}`);
                }
            }
        })
    }

    // Funciton for setupping schedules switches
    function loadSchedulesSwitches() {
        // Finding container where switches must be added
        const switchesContainer = document.getElementById('schedules-switches-container');

        // Clearing container
        while (switchesContainer.firstChild) {
            switchesContainer.removeChild(switchesContainer.firstChild);
        }

        // Adding switch for each schedule
        schedulesData.schedules.forEach((schedule, scheduleIndex) => {

            // Creating switch for each calendar
            const scheduleSwitchElement = document.createElement('div');
            scheduleSwitchElement.style.cssText = `
                min-width: 120px;
                padding: 5px;
                max-height: 40%;
                height: auto;
                text-elign: center;
                background-color: #a7a6a6ff;
                margin-left: 10px;
                margin-right: 10px;
                color: white;
                border-radius: 5px;
                cursor: pointer;
                transition: background-color 0.2s;
            `;

            // Highlighting the active one
            if (scheduleIndex === schedulesData.activeScheduleIndex) {
                scheduleSwitchElement.style.backgroundColor = '#3f5688ff'
            }

            // Adding hover effect to schedule switch
            if (scheduleIndex !== schedulesData.activeScheduleIndex) {
                scheduleSwitchElement.onmouseover = () => {
                    scheduleSwitchElement.style.backgroundColor = '#888686ff'; // darker red
                };

                scheduleSwitchElement.onmouseout = () => {
                    scheduleSwitchElement.style.backgroundColor = '#a7a6a6ff'; // original red
                };
            }

            // Text is just Schedule INDEX
            scheduleSwitchElement.textContent = `Schedule ${scheduleIndex + 1}`

            // Logic for switching to other schedule
            scheduleSwitchElement.onclick = () => {
                // Changing global active schedule variable
                schedulesData.activeScheduleIndex = scheduleIndex;

                // Reloading schedule
                loadSchedule();
            }

            // Creating delete button for each schedule switch
            const scheduleSwitchDeleteButton = document.createElement('div');
            scheduleSwitchDeleteButton.textContent = 'x';
            scheduleSwitchDeleteButton.title = 'Delete this schedule.';
            scheduleSwitchDeleteButton.style.cssText = `
                width: 20px;
                height: 20px;
                background-color: #c74d4dff;
                color: white;
                position: relative;
                text-align: center;
                left: 100px;
                bottom: 19px;
                border-radius: 3px;
                cursor: pointer;
                transition: background-color 0.3s;
            `;

            // Adding hover effect to remove button
            scheduleSwitchDeleteButton.onmouseover = () => {
                scheduleSwitchDeleteButton.style.backgroundColor = '#a82f2fff'; // darker red
            };

            scheduleSwitchDeleteButton.onmouseout = () => {
                scheduleSwitchDeleteButton.style.backgroundColor = '#c74d4dff'; // original red
            };


            // Adding event when clicked
            scheduleSwitchDeleteButton.onclick = (e) => {
                if (schedulesData.schedules.length === 1) { return };

                // Stopping div click
                e.stopPropagation();

                // Deleting from global object
                schedulesData.schedules.splice(scheduleIndex, 1);

                // Changing active schedule index
                schedulesData.activeScheduleIndex = 0;

                // Reloading schedules
                loadSchedule();
            }

            // Adding delete button
            scheduleSwitchElement.appendChild(scheduleSwitchDeleteButton);

            // Appending to container
            switchesContainer.appendChild(scheduleSwitchElement);
        })

        // Adding plus button for new calendar
        const addNewSwitchButton = document.createElement('div')
        addNewSwitchButton.textContent = "+";
        addNewSwitchButton.style.cssText = `
            background-color: #4470a8ff;
            color: white;
            font-size: 20px;
            border-radius: 2px;
            padding: 0px 6px 0px 6px;
            height: auto;
            cursor: pointer;
            transition: background-color 0.3s;
        `;


        // Adding hover effect to add new calendar button
        addNewSwitchButton.onmouseover = () => {
            addNewSwitchButton.style.backgroundColor = '#38649cff'; // darker
        };

        addNewSwitchButton.onmouseout = () => {
            addNewSwitchButton.style.backgroundColor = '#4470a8ff'; // original
        };

        // Adding event listener for creating new calendar
        addNewSwitchButton.onclick = () => {
            // Creating empty schedule
            schedulesData.schedules.push({});

            // Reloading schedule
            loadSchedule();
        }


        // Adding plus button in the end
        switchesContainer.appendChild(addNewSwitchButton);
    }



    // ----- Export Functions -----

    // Function for exporting as TXT
    function exportAsTXT() {
        // 1. Get active schedule
        const schedule =
            schedulesData.schedules[schedulesData.activeScheduleIndex];

        if (!schedule || Object.keys(schedule).length === 0) return;

        // 2. Helper: minutes -> HH:MM
        function minutesToTime(min) {
            const h = String(Math.floor(min / 60)).padStart(2, "0");
            const m = String(min % 60).padStart(2, "0");
            return `${h}:${m}`;
        }

        // 3. Build TXT content
        let txt = "SCHEDULE\n";
        txt += "========\n\n";

        for (const courseId in schedule) {
            const course = schedule[courseId];

            txt += `${course.name}\n`;
            txt += `Instructor: ${course.instructor}\n`;
            txt += `Location: ${course.location}\n`;
            txt += `Times:\n`;

            course.timesFormatted.forEach(t => {
                txt += `  - ${t.weekday} ${minutesToTime(t.start)}-${minutesToTime(t.end)}\n`;
            });

            txt += "\n";
        }

        // 4. Create downloadable file
        const blob = new Blob([txt], { type: "text/plain" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "schedule.txt";
        document.body.appendChild(a);
        a.click();

        // 5. Cleanup
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Function for exporting as CSV
    function exportAsCSV() {
        // 1. Get active schedule
        const schedule =
            schedulesData.schedules[schedulesData.activeScheduleIndex];

        if (!schedule || Object.keys(schedule).length === 0) return;

        const weekdays = [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
        ];

        // 2. Helper: minutes -> HH:MM
        function minutesToTime(min) {
            const h = String(Math.floor(min / 60)).padStart(2, "0");
            const m = String(min % 60).padStart(2, "0");
            return `${h}:${m}`;
        }

        // 3. Collect rows by time range
        const rows = {}; // key: "HH:MM-HH:MM"

        for (const id in schedule) {
            const course = schedule[id];

            course.timesFormatted.forEach(t => {
                const timeKey =
                    `${minutesToTime(t.start)}-${minutesToTime(t.end)}`;

                if (!rows[timeKey]) {
                    rows[timeKey] = {};
                }

                rows[timeKey][t.weekday] =
                    `${course.name} (${course.location})`;
            });
        }

        // 4. CSV header
        let csv = "Time," + weekdays.join(",") + "\n";

        // 5. Build CSV body (sorted by time)
        Object.keys(rows)
            .sort()
            .forEach(timeKey => {
                let line = `"${timeKey}"`;

                weekdays.forEach(day => {
                    line += ",";
                    line += rows[timeKey][day]
                        ? `"${rows[timeKey][day]}"`
                        : "";
                });

                csv += line + "\n";
            });

        // 6. Download file
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "schedule_weekview.csv";
        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Function for exporting as ICS
    function exportAsICS() {
        const schedule =
            schedulesData.schedules[schedulesData.activeScheduleIndex];
        if (!schedule || Object.keys(schedule).length === 0) return;

        // Helper: format date in GMT+4 for ICS (YYYYMMDDTHHMMSS)
        function formatDateGMT4(date) {
            const pad = n => String(n).padStart(2, "0");
            const d = new Date(date.getTime() + 4 * 60 * 60 * 1000); // add 4 hours
            const YYYY = d.getUTCFullYear();
            const MM = pad(d.getUTCMonth() + 1);
            const DD = pad(d.getUTCDate());
            const HH = pad(d.getUTCHours());
            const mm = pad(d.getUTCMinutes());
            const ss = pad(d.getUTCSeconds());
            return `${YYYY}${MM}${DD}T${HH}${mm}${ss}`;
        }

        // Very early start date
        const semesterStart = new Date("2000-01-03T00:00:00");

        const weekdayMap = {
            sunday: 0,
            monday: 1,
            tuesday: 2,
            wednesday: 3,
            thursday: 4,
            friday: 5,
            saturday: 6
        };

        // Far future (50 years) for recurrence
        const farFuture = new Date();
        farFuture.setFullYear(farFuture.getFullYear() + 50);
        const untilDate = formatDateGMT4(farFuture) + "Z";

        let ics = `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
PRODID:-//YourApp//ScheduleExport//EN
`;

        for (const id in schedule) {
            const course = schedule[id];
            course.timesFormatted.forEach(t => {
                // Calculate first occurrence
                const firstDate = new Date(semesterStart);
                const diff = (weekdayMap[t.weekday] - firstDate.getDay() + 7) % 7;
                firstDate.setDate(firstDate.getDate() + diff);

                const startHour = Math.floor(t.start / 60);
                const startMin = t.start % 60;
                const endHour = Math.floor(t.end / 60);
                const endMin = t.end % 60;

                const startDate = new Date(firstDate);
                startDate.setHours(startHour, startMin, 0);

                const endDate = new Date(firstDate);
                endDate.setHours(endHour, endMin, 0);

                ics += `BEGIN:VEVENT
SUMMARY:${course.name}
DTSTART:${formatDateGMT4(startDate)}
DTEND:${formatDateGMT4(endDate)}
LOCATION:${course.location}
DESCRIPTION:Instructor: ${course.instructor}
RRULE:FREQ=WEEKLY;UNTIL=${untilDate}
END:VEVENT
`;
            });
        }

        ics += "END:VCALENDAR";

        // Download ICS file
        const blob = new Blob([ics], { type: "text/calendar" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "schedule.ics";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Function for exporting as JSON
    function exportAsJSON() {
        const schedule =
            schedulesData.schedules[schedulesData.activeScheduleIndex];
        if (!schedule || Object.keys(schedule).length === 0) return;

        // Convert schedule object to JSON string with indentation
        const jsonStr = JSON.stringify(schedule, null, 2);

        // Create downloadable file
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "schedule.json";
        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }


    // ----- Export Functions -----



    // Function for setupping all that schedule things
    function setupSchedule() {

        // Generating special id and making it as class for each course
        generateIdsForCourses();

        // Finally calling setup schedule window
        setupScheduleWindow();

        // Setupping schedule field in thead
        setupScheduleThead();

        // Adding button on each course
        setupScheduleButtonsInEachCourse();

        // Updating schedule controller buttons
        updateCoursesSchedulerContainerButtons();

        // Loading schedule first time
        loadSchedule();

        // Loading wishlist first time
        loadWishlist();
    }
})();
