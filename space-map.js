(() => {
    "use strict";

    const missions = [
        {
            id: "moon",
            name: "LUNAR BASE",
            subtitle: "Earth’s Moon",
            icon: "☾",
            color: "#b8c8df",
            description: "Explore the lunar base and find the source of the mysterious signal.",
            unlockDay: 1
        },
        {
            id: "mars",
            name: "PLANET MARS",
            subtitle: "The Red Planet",
            icon: "♂",
            color: "#f07852",
            description: "Explore the surface of Mars and locate hidden resources.",
            unlockDay: 3
        },
        {
            id: "station",
            name: "STATION ALPHA",
            subtitle: "Orbital Station",
            icon: "✦",
            color: "#49c9e8",
            description: "Visit the orbital station and complete a special task.",
            unlockDay: 5
        },
        {
            id: "ice",
            name: "ICE PLANET",
            subtitle: "Frost Sector",
            icon: "❄",
            color: "#8de5f5",
            description: "Explore the frozen world and help the lost expedition.",
            unlockDay: 8
        },
        {
            id: "lab",
            name: "ALIEN LABORATORY",
            subtitle: "Unknown Sector",
            icon: "⌬",
            color: "#b78cff",
            description: "Enter the abandoned laboratory and uncover its secrets.",
            unlockDay: 11
        },
        {
            id: "galaxy",
            name: "MYSTERIOUS GALAXY",
            subtitle: "Lost World",
            icon: "✧",
            color: "#e6a8ff",
            description: "Find an ancient artifact in a distant galaxy.",
            unlockDay: 15
        },
        {
            id: "neptune",
            name: "NEPTUNE",
            subtitle: "Ice Giant",
            icon: "♆",
            color: "#4d83ff",
            description: "Explore the distant ice giant and complete the mission prepared for Neptune.",
            unlockDay: 18
        }
    ];

    const positions = [
        [15, 23],
        [43, 45],
        [77, 23],
        [20, 77],
        [59, 81],
        [87, 65],
        [47, 12]
    ];

    const root = document.getElementById("space-map-root");

    if (!root) {
        console.error("Could not find the space-map-root element!");
        return;
    }

    let selectedMission = null;
    let currentDay = 1;
    const completedMissions = new Set();

    /* ======================================
       STYLES
    ====================================== */

    const style = document.createElement("style");

    style.textContent = `
        #space-map-root {
            font-family: Arial, sans-serif;
            color: #f2f7ff;
            background: #071426;
            min-height: 100vh;
            padding: 22px;
            box-sizing: border-box;
        }

        #space-map-root * {
            box-sizing: border-box;
        }

        .sm-shell {
            max-width: 1200px;
            margin: auto;
        }

        .sm-head {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 14px;
            margin-bottom: 16px;
        }

        .sm-title {
            font-size: 30px;
            font-weight: 800;
            color: #37ddf5;
        }

        .sm-layout {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 290px;
            gap: 16px;
        }

        .sm-map {
            position: relative;
            min-height: 570px;
            overflow: hidden;
            border: 1px solid #244866;
            border-radius: 18px;
            background:
                radial-gradient(
                    ellipse at center,
                    #172b4c,
                    #071426
                );
        }

        .sm-stars {
            position: absolute;
            inset: 0;
            pointer-events: none;
        }

        .sm-star {
            position: absolute;
            width: 2px;
            height: 2px;
            border-radius: 50%;
            background: white;
        }

        .sm-sun {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 78px;
            height: 78px;
            border-radius: 50%;
            display: grid;
            place-items: center;
            background: radial-gradient(
                circle,
                #fff4b0,
                #f7c65e,
                #d88736
            );
            box-shadow: 0 0 45px #f5b94b;
            color: #5c3915;
            font-size: 36px;
            z-index: 1;
        }

        .sm-sun-label {
            position: absolute;
            left: 50%;
            top: calc(50% + 49px);
            transform: translateX(-50%);
            font-size: 10px;
            color: #ffd166;
            white-space: nowrap;
        }

        .sm-routes {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
        }

        .sm-routes path {
            fill: none;
            stroke: #47749b;
            stroke-width: 2;
            stroke-dasharray: 7 8;
        }

        .sm-nodes {
            position: absolute;
            inset: 0;
            z-index: 2;
        }

        .sm-node {
            position: absolute;
            transform: translate(-50%, -50%);
            border: none;
            background: transparent;
            color: white;
            cursor: pointer;
            text-align: center;
            width: 145px;
            padding: 0;
        }

        .sm-orb {
            width: 58px;
            height: 58px;
            margin: 0 auto 8px;
            border-radius: 50%;
            display: grid;
            place-items: center;
            font-size: 28px;
            color: #071426;
            border: 2px solid white;
            box-shadow: 0 0 0 7px #ffffff12,
                        0 0 25px currentColor;
            transition: transform 0.2s;
        }

        .sm-node:hover .sm-orb {
            transform: scale(1.15);
        }

        .sm-node.active .sm-orb {
            outline: 3px solid #37ddf5;
            outline-offset: 5px;
        }

        .sm-node-name {
            display: block;
            font-size: 10px;
            font-weight: bold;
            line-height: 1.3;
        }

        .sm-node-status {
            display: inline-block;
            margin-top: 4px;
            padding: 3px 7px;
            border-radius: 20px;
            background: #102b43;
            color: #37ddf5;
            font-size: 9px;
        }

        .sm-node.done .sm-node-status {
            background: #164536;
            color: #48e0a4;
        }

        .sm-node.locked {
            opacity: 0.42;
            cursor: not-allowed;
        }

        .sm-node.locked .sm-orb {
            filter: grayscale(0.8);
            box-shadow: 0 0 0 5px #ffffff08;
        }

        .sm-side {
            background: #10243d;
            border: 1px solid #244866;
            border-radius: 18px;
            padding: 20px;
        }

        .sm-side h2 {
            font-size: 15px;
            color: #37ddf5;
        }

        .sm-kicker {
            font-size: 11px;
            color: #91a9c4;
        }

        .sm-location {
            font-size: 21px;
            font-weight: bold;
            margin: 10px 0;
        }

        .sm-desc {
            font-size: 14px;
            line-height: 1.5;
            min-height: 90px;
        }

        .sm-btn {
            width: 100%;
            border: none;
            border-radius: 10px;
            padding: 13px;
            font-weight: bold;
            cursor: pointer;
            background: #167b9a;
            color: white;
            margin-top: 12px;
        }

        .sm-btn:hover:not(:disabled) {
            background: #21a6c8;
        }

        .sm-btn:disabled {
            opacity: 0.45;
            cursor: not-allowed;
        }

        .sm-btn.secondary {
            background: #203d5b;
        }

        .sm-progress {
            height: 9px;
            background: #263e58;
            border-radius: 20px;
            overflow: hidden;
            margin: 10px 0;
        }

        .sm-progress span {
            display: block;
            height: 100%;
            width: 0;
            background: #48e0a4;
            transition: width 0.2s;
        }

        .sm-progress-text {
            font-size: 13px;
            color: #48e0a4;
        }

        .sm-toast {
            position: fixed;
            left: 50%;
            bottom: 22px;
            transform: translateX(-50%);
            background: #163b54;
            border: 1px solid #37ddf5;
            color: white;
            padding: 12px 18px;
            border-radius: 10px;
            display: none;
            z-index: 9999;
            max-width: 90%;
        }

        @media (max-width: 850px) {
            .sm-layout {
                grid-template-columns: 1fr;
            }

            .sm-map {
                min-height: 520px;
            }
        }

        @media (max-width: 520px) {
            .sm-map {
                min-height: 480px;
            }

            .sm-node {
                width: 105px;
            }

            .sm-orb {
                width: 48px;
                height: 48px;
                font-size: 23px;
            }

            .sm-node-name {
                font-size: 9px;
            }
        }
    `;

    document.head.appendChild(style);

    /* ======================================
       HTML
    ====================================== */

    root.innerHTML = `
        <div class="sm-shell">

            <header class="sm-head">
                <div class="sm-title">
                    ✦ SPACE EXPLORER ✦
                </div>

                <div>
                    SPACE MISSION MAP
                </div>
            </header>

            <main class="sm-layout">

                <section class="sm-map">

                    <svg class="sm-routes"
                         viewBox="0 0 800 570"
                         preserveAspectRatio="none">

                        <path d="
                            M120 125
                            Q260 250 350 250
                            T610 125
                            Q710 260 690 370
                            Q570 460 470 475
                            Q280 500 160 430
                            Q60 280 120 125
                        "/>

                        <path d="
                            M400 285 L120 125
                            M400 285 L350 250
                            M400 285 L610 125
                            M400 285 L160 430
                            M400 285 L470 475
                            M400 285 L690 370
                        "/>

                    </svg>

                    <div class="sm-stars"></div>

                    <div class="sm-sun">☀</div>

                    <div class="sm-sun-label">
                        SOLAR SYSTEM
                    </div>

                    <div class="sm-nodes"></div>

                </section>

                <aside class="sm-side">

                    <h2>COMMAND CENTER</h2>

                    <div class="sm-kicker">
                        EXPLORATION PROGRESS
                    </div>

                    <div class="sm-progress">
                        <span class="sm-progress-fill"></span>
                    </div>

                    <div class="sm-progress-text">
                        0 of 7 missions completed
                    </div>

                    <hr style="
                        border:0;
                        border-top:1px solid #31516e;
                        margin:20px 0;
                    ">

                    <div class="sm-kicker">
                        SELECTED LOCATION
                    </div>

                    <div class="sm-location">
                        None selected
                    </div>

                    <div class="sm-desc">
                        Select a planet or station,
                        to view its mission.
                    </div>

                    <button class="sm-btn sm-launch" disabled>
                        SELECT A LOCATION
                    </button>

                    <button class="sm-btn secondary sm-reset">
                        RESET MARKERS
                    </button>

                </aside>

            </main>

        </div>

        <div class="sm-toast"></div>
    `;

    /* ======================================
       LEGEND
    ====================================== */

    const map = root.querySelector(".sm-map");
    const nodes = root.querySelector(".sm-nodes");

    const title = root.querySelector(".sm-location");
    const description = root.querySelector(".sm-desc");

    const launchButton = root.querySelector(".sm-launch");
    const resetButton = root.querySelector(".sm-reset");

    const progressFill = root.querySelector(
        ".sm-progress-fill"
    );

    const progressText = root.querySelector(
        ".sm-progress-text"
    );

    const toast = root.querySelector(".sm-toast");

    /* ======================================
       MESSAGES
    ====================================== */

    function notify(message) {
        toast.textContent = message;
        toast.style.display = "block";

        clearTimeout(notify.timer);

        notify.timer = setTimeout(() => {
            toast.style.display = "none";
        }, 2800);
    }

    /* ======================================
       STARS
    ====================================== */

    function createStars() {
        const stars = root.querySelector(".sm-stars");

        for (let i = 0; i < 100; i++) {
            const star = document.createElement("i");

            star.className = "sm-star";

            star.style.left =
                ((i * 73) % 997) / 10 + "%";

            star.style.top =
                ((i * 137) % 991) / 10 + "%";

            star.style.opacity =
                0.25 + (i % 7) / 10;

            stars.appendChild(star);
        }
    }

    /* ======================================
       PROGRESS
    ====================================== */

    function updateProgress() {
        const count = completedMissions.size;

        progressFill.style.width =
            (count / missions.length * 100) + "%";

        progressText.textContent =
            count + " of " + missions.length + " missions completed";
    }

    /* ======================================
       RENDERING MAP
    ====================================== */

    function drawMap() {
        nodes.innerHTML = "";

        missions.forEach((mission, index) => {

            const done =
                completedMissions.has(mission.id);
            const locked = currentDay < mission.unlockDay;

            const button =
                document.createElement("button");

            button.type = "button";

            button.className =
                "sm-node" +
                (done ? " done" : "") +
                (locked ? " locked" : "") +
                (selectedMission === mission.id
                    ? " active"
                    : "");

            button.style.left =
                positions[index][0] + "%";

            button.style.top =
                positions[index][1] + "%";
            button.disabled = locked;

            button.setAttribute(
                "aria-label",
                mission.name
            );

            button.innerHTML = `
                <span class="sm-orb"
                      style="background:${mission.color}">
                    ${done ? "✓" : mission.icon}
                </span>

                <span class="sm-node-name">
                    ${mission.name}
                </span>

                <span class="sm-node-status">
                    ${done ? "COMPLETED" : locked ? "UNLOCKS: DAY " + mission.unlockDay : "AVAILABLE"}
                </span>
            `;

            button.addEventListener("click", () => {
                if (locked) {
                    notify("This location unlocks on Day " + mission.unlockDay + " .");
                    return;
                }
                selectMission(mission.id);
            });

            nodes.appendChild(button);
        });
    }

    /* ======================================
       MISSION SELECTION
    ====================================== */

    function selectMission(id) {

        const mission = missions.find(
            item => item.id === id
        );

        if (!mission) return;
        if (currentDay < mission.unlockDay) {
            notify("Location unlocks on Day " + mission.unlockDay + " .");
            return;
        }

        selectedMission = id;

        title.textContent = mission.name;

        title.style.color = mission.color;

        description.textContent =
            mission.subtitle + " — " +
            mission.description;

        launchButton.disabled = false;

        launchButton.textContent =
            completedMissions.has(id)
                ? "REPLAY MISSION"
                : "START MISSION";

        drawMap();
    }

    /* ======================================
       LAUNCH MISSION
    ====================================== */

    launchButton.addEventListener("click", () => {

        if (!selectedMission) {
            notify("Select a location first!");
            return;
        }

        const mission = missions.find(
            item => item.id === selectedMission
        );

        if (!mission || currentDay < mission.unlockDay) {
            notify("This location is still locked.");
            return;
        }

        const detail = {
            id: mission.id,
            name: mission.name,
            mission: mission
        };

        window.dispatchEvent(
            new CustomEvent(
                "space:missionSelected",
                { detail }
            )
        );

        if (typeof SpaceMap.onSelect === "function") {
            SpaceMap.onSelect(detail);
        } else {
            notify(
                "Selected mission: " + mission.name +
                ". Your mission needs to be connected."
            );
        }
    });

    /* ======================================
       RESET PROGRESS
    ====================================== */

    resetButton.textContent = "DECISION LOG";
    resetButton.addEventListener("click", () => window.ARESLearning?.journal());

    /* ======================================
       API FOR CONNECTING YOUR MISSIONS
    ====================================== */

    window.SpaceMap = {
        reset() {completedMissions.clear();selectedMission=null;currentDay=1;drawMap();updateProgress();},

        missions: missions,

        onSelect: null,

        setDay(day) {
            const nextDay = Math.max(1, Number(day) || 1);
            currentDay = nextDay;

            if (selectedMission) {
                const selected = missions.find(item => item.id === selectedMission);
                if (!selected || currentDay < selected.unlockDay) {
                    selectedMission = null;
                    title.textContent = "None selected";
                    title.style.color = "";
                    description.textContent = "Select an available planet or station to view its mission.";
                    launchButton.disabled = true;
                    launchButton.textContent = "SELECT A LOCATION";
                }
            }

            drawMap();
            updateProgress();
        },

        getDay() {
            return currentDay;
        },

        onMissionSelect(callback) {

            if (typeof callback !== "function") {
                throw new TypeError(
                    "A function must be provided."
                );
            }

            this.onSelect = callback;
        },

        setMissionStatus(id, status) {

            const exists = missions.some(
                mission => mission.id === id
            );

            if (!exists) {
                throw new Error(
                    "Unknown mission: " + id
                );
            }

            if (status === "completed") {
                completedMissions.add(id);
            } else if (status === "available") {
                completedMissions.delete(id);
            } else {
                throw new Error(
                    'Status must be "available" or "completed".'
                );
            }

            updateProgress();
            drawMap();

            if (selectedMission) {
                selectMission(selectedMission);
            }
        },

        returnToMap() {
            root.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        },

        getCompletedMissions() {
            return [...completedMissions];
        },

        getSelectedMission() {
            return selectedMission;
        }
    };

    /* ======================================
       LAUNCH
    ====================================== */

    createStars();
    drawMap();
    updateProgress();

})();