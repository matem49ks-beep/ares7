const game = {
    day: 1,
    maxDays: 20,
    lastDayCompleted: false,

    energy: 100,
    oxygen: 100,
    water: 100,
    food: 100,
    materials: 20,

    health: 100,
    protection: 100,

    ice: 0,
    regolith: 0,

    powerRestored: false,
    oxygenSystemRestored: false,
    greenhouseRestored: false,
    protectionRestored: false,
    miningRestored: false,
    radioRestored: false,

    signalSent: false,
    stormActive: false,

    vitamins: 2,
    morale: 100,
    activeCrop: null,
    filterDirt: 0,
    ecoMode: false,
    emergencyVentUsed: false,
    vitaminHunger: 0,

    score: 0,

    currentRoom: "command",
    selectedSpaceMission: null,

    gameStarted: false,
    gameOver: false,
    victory: false,

    log: [],
    message: ""
};

const moduleState = new Proxy(game, {
    get(target, property) {
        if (property === "parts") return target.materials;
        if (property === "farm") return target.greenhouseRestored;
        if (property === "life") return target.oxygenSystemRestored;
        if (property === "storm") return target.stormActive ? 1 : 0;

        return target[property];
    },

    set(target, property, value) {
        if (property === "parts") {
            target.materials = value;
            return true;
        }

        if (property === "farm") {
            target.greenhouseRestored = value;
            return true;
        }

        if (property === "life") {
            target.oxygenSystemRestored = value;
            return true;
        }

        if (property === "storm") {
            target.stormActive = Boolean(value);
            return true;
        }

        target[property] = value;
        return true;
    }
});

function clamp(value, min = 0, max = 100) {
    return Math.max(min, Math.min(max, value));
}

function normalizeCost(cost = {}) {
    const result = {};

    for (const key in cost) {
        const resource = key === "parts" ? "materials" : key;
        result[resource] = cost[key];
    }

    return result;
}

function can(cost = {}) {
    const normalized = normalizeCost(cost);

    for (const key in normalized) {
        if (game[key] === undefined || game[key] < normalized[key]) {
            return false;
        }
    }

    return true;
}

function spend(cost = {}) {
    if (!game.gameStarted || game.gameOver) return false;
    const beforeCost = ARESScore.snapshot();
    const normalized = normalizeCost(cost);

    if (!can(normalized)) {
        return false;
    }

    for (const key in normalized) {
        game[key] -= normalized[key];
    }

    ARESScore.trace("Action Cost", beforeCost);
    return true;
}

function resourceName(key) {
    const names = {
        energy: "energy",
        oxygen: "oxygen",
        water: "water",
        food: "food",
        materials: "materials",
        ice: "ice",
        regolith: "regolith", health:"health", protection:"protection", morale:"morale"
    };

    return names[key] || key;
}

function formatCost(cost = {}) {
    const normalized = normalizeCost(cost);

    return Object.entries(normalized)
        .map(([key, value]) => `${value} ${resourceName(key)}`)
        .join(", ");
}

function logEvent(message) {
    game.log.unshift({
        day: game.day,
        message: message
    });

    if (game.log.length > 30) {
        game.log.pop();
    }

    const logElement = document.getElementById("log");

    if (logElement) {
        Game.renderLog();
    }
}

function notice(message) {
    logEvent(message);
}

function act(message, cost = {}, callback) {
    if (!game.gameStarted || game.gameOver) return false;
    if (!can(cost)) {
        logEvent("Not enough resources to perform this action.");
        Game.render();
        return false;
    }

    if (!spend(cost)) {
        return false;
    }

    const beforeEffect = ARESScore.snapshot();
    if (typeof callback === "function") {
        callback();
    }

    ARESScore.trace(message, beforeEffect);
    logEvent(message);
    nextTurn();

    return true;
}

function nextTurn() {
    if (game.gameOver || !game.gameStarted) return;

    Game.nextDay();
}

const Game = {
    rooms: {
        command: {
            name: "Command Center",
            subtitle: "Martian Station Control",
            description: "Manage the mission, check system status, and send a distress signal."
        },

        power: {
            name: "Power Module",
            subtitle: "Power Supply System",
            description: "The power module supplies electricity to the station. Without it, most systems will not work."
        },

        life: {
            name: "Life Support",
            subtitle: "Oxygen, Water, and Ventilation",
            description: "This compartment contains the water purification, oxygen production, and ventilation systems."
        },

        farm: {
            name: "Greenhouse",
            subtitle: "Food Production",
            description: "The greenhouse grows food and maintains the crew’s supplies."
        },

        shield: {
            name: "Shield Compartment",
            subtitle: "Station Hull Protection",
            description: "This compartment contains the systems that protect the station’s outer hull."
        },

        mine: {
            name: "Mining Module",
            subtitle: "Exploring the Surface of Mars",
            description: "Mine ice and regolith here to support the station."
        },

        emergency: {
            name: "Emergency Center",
            subtitle: "RESOURCE PROTECT",
            description: "Emergency response center."
        }
    },

    getState() {
        return moduleState;
    },

    clamp(value, min = 0, max = 100) {
        return clamp(value, min, max);
    },

    logEvent(message) {
        logEvent(message);
    },

    normalizeCost(cost) {
        return normalizeCost(cost);
    },

    canAfford(cost) {
        return can(cost);
    },

    spendResources(cost) {
        return spend(cost);
    },

    resourceName(key) {
        return resourceName(key);
    },

    formatCost(cost) {
        return formatCost(cost);
    },

    performAction(message, cost = {}, callback) {
        return act(message, cost, callback);
    },

    updateProtection(health, hull) {
        game.health = clamp(health);
        game.protection = clamp(hull);

        this.renderHeader();
        this.renderMeters();
    },

    start() {
        if (game.gameOver || game.gameStarted) return;

        game.gameStarted = true;
        this.syncSpaceMapDay();

        const overlay = document.getElementById("overlay");

        if (overlay) {
            overlay.style.display = "none";
        }

        if (window.ARESProtection) {
            window.ARESProtection.start();
        }

        logEvent("ARES-7 mission started.");
        this.render();
    },

    restart() {
        if (window.ARESProtection) {
            window.ARESProtection.stop();

            if (typeof window.ARESProtection.reset === "function") {
                window.ARESProtection.reset();
            }
        }

        const initialState = {
            day: 1,
            maxDays: 20,
            lastDayCompleted: false,

            energy: 100,
            oxygen: 100,
            water: 100,
            food: 100,
            materials: 20,

            health: 100,
            protection: 100,

            ice: 0,
            regolith: 0,

            powerRestored: false,
            oxygenSystemRestored: false,
            greenhouseRestored: false,
            protectionRestored: false,
            miningRestored: false,
            radioRestored: false,

            signalSent: false,
            stormActive: false,

            vitamins: 2,
            morale: 100,
            activeCrop: null,
            filterDirt: 0,
            ecoMode: false,
            emergencyVentUsed: false,
            vitaminHunger: 0,

            score: 0,

            currentRoom: "command",
            selectedSpaceMission: null,

            gameStarted: false,
            gameOver: false,
            victory: false,

            log: [],
            message: ""
        };

        Object.assign(game, initialState);
        ARESScore.reset();
        window.ARESMissions?.reset();
        window.SpaceMap?.reset();
        this.syncSpaceMapDay();

        this.closeSpaceMap();
        this.render();

        this.showModal(
            "Station Restarted",
            "All systems have been restored to their initial state.",
            "You can now start a new mission.",
            "▶ Start Game",
            () => this.start()
        );
    },

    syncSpaceMapDay() {
        if (window.SpaceMap && typeof window.SpaceMap.setDay === "function") {
            window.SpaceMap.setDay(game.day);
        }
    },

    openSpaceMap() {
        const layout = document.querySelector(".layout");
        const mapRoot = document.getElementById("space-map-root");

        if (!layout || !mapRoot || !window.SpaceMap) {
            logEvent("Could not open the space map. Check that space-map.js is connected.");
            return;
        }

        layout.style.display = "none";
        mapRoot.style.display = "block";

        if (!document.getElementById("return-to-ares")) {
            const button = document.createElement("button");

            button.id = "return-to-ares";
            button.type = "button";
            button.textContent = "← Return to ARES-7";

            button.onclick = () => {
                this.closeSpaceMap();
            };

            mapRoot.prepend(button);
        }

        window.scrollTo(0, 0);
    },

    closeSpaceMap() {
        const layout = document.querySelector(".layout");
        const mapRoot = document.getElementById("space-map-root");

        if (layout) {
            layout.style.display = "";
        }

        if (mapRoot) {
            mapRoot.style.display = "none";
        }

        const button = document.getElementById("return-to-ares");

        if (button) {
            button.remove();
        }

        this.render();
        window.scrollTo(0, 0);
    },

    startSpaceMission(detail) {
    if (!detail || !detail.id) return;

    game.selectedSpaceMission = detail.id;

    if (window.ARESMissions) {
        window.ARESMissions.start(detail);
    } else {
        logEvent("Could not load the space mission system.");
    }
},

    selectRoom(room) {
        if (!this.rooms[room] || game.gameOver) return;

        game.currentRoom = room;

        const protectionRoot = document.getElementById("protection-root");

        if (protectionRoot) {
            protectionRoot.style.display =
                room === "emergency" ? "block" : "none";
        }

        this.render();
    },

    nextDay() {
        if (game.gameOver || !game.gameStarted) return;
        const beforeDay = ARESScore.snapshot();

        // Day 20 remains playable. The next station action closes that day;
        // never display a fictitious day 21 or schedule another day’s events.
        const closingLastDay = game.day >= game.maxDays;
        if (closingLastDay) game.lastDayCompleted = true;
        else game.day++;
        this.syncSpaceMapDay();
        window.ARESAdventure?.beforeDay();

        if (game.powerRestored) {
            game.energy = clamp(game.energy - 2);
        } else {
            game.energy = clamp(game.energy - 5);
        }

        if (typeof updateLifeTurn === "function") {
            updateLifeTurn(moduleState);
        } else {
            game.oxygen = clamp(game.oxygen - 5);
            game.water = clamp(game.water - 3);
            game.food = clamp(game.food - 2);
        }

        if (typeof updateFarmTurn === "function") {
            updateFarmTurn(moduleState);
        } else {
            game.food = clamp(game.food - 2);
        }

        if (!closingLastDay) this.checkEvents();

        if (
            !closingLastDay && window.ARESProtection &&
            typeof window.ARESProtection.onDayPassed === "function"
        ) {
            window.ARESProtection.onDayPassed(game.day);
        }

        ARESScore.trace("Daily Consumption and Events", beforeDay);
        this.checkGameOver();
        window.ARESAdventure?.record();
        this.render();
    },

    checkEvents() {
        if (game.adventure && window.ARESAdventure) { window.ARESAdventure.events(); return; }
        if (game.day === 5 || game.day === 12) {
            game.stormActive = true;

            game.energy = clamp(game.energy - 8);
            game.protection = clamp(game.protection - 5);

            logEvent("A dust storm has begun on Mars. Check the station.");
        }

        if (game.day === 8 || game.day === 15) {
            game.stormActive = false;

            logEvent("The dust storm has ended.");
        }

        if (game.day === 9) {
            game.water = clamp(game.water - 12);

            logEvent("A water leak was detected. Supplies decreased by 12 units.");
        }

        if (game.day === 15) {
            game.energy = clamp(game.energy - 10);

            logEvent("The power module has lost some capacity.");
        }

        if (game.day === 10) {
            game.food = clamp(game.food + 5);

            logEvent("A backup food container was found (+5 food).");
        }

        if (game.day === 18) {
            logEvent("Two days remain until the mission ends.");
        }
    },

    checkGameOver() {
        if (game.gameOver) return;

        if (
            game.health <= 0 ||
            game.oxygen <= 0 ||
            game.water <= 0 ||
            game.food <= 0 ||
            game.protection <= 0
        ) {
            this.finish(
                false,
                "The station can no longer sustain the crew."
            );

            return;
        }

        if (game.lastDayCompleted) {
            if (game.signalSent) {
                this.finish(
                    true,
                    "Distress signal transmitted. The ARES-7 mission was successfully completed!"
                );
            } else {
                this.finish(
                    false,
                    "20 days have passed, but the distress signal was never sent."
                );
            }
        }
    },

    finish(victory, message) {
        if (game.gameOver) return;

        game.gameOver = true;
        game.victory = victory;
        game.message = message;

        if (window.ARESProtection) {
            window.ARESProtection.stop();
        }

        const repaired = [
            game.powerRestored,
            game.oxygenSystemRestored,
            game.greenhouseRestored,
            game.protectionRestored,
            game.miningRestored,
            game.radioRestored
        ].filter(Boolean).length;

        const result = victory ? "MISSION COMPLETED" : "MISSION FAILED";

        this.showModal(
            result,
            message,
            `Systems restored: ${repaired}/6. Score: ${game.score}.`,
            "↻ New Game",
            () => this.restart()
        );

        logEvent(message);
    },

    showModal(title, description, extra, buttonText, callback) {
        const overlay = document.getElementById("overlay");
        const modal = document.getElementById("modal");

        if (!overlay || !modal) return;

        modal.innerHTML = `
            <div class="sub">ARES-7 // MISSION CONTROL</div>

            <h1>${title}</h1>

            <p>${description}</p>

            <p>${extra}</p>

            <button id="modalAction"
                style="width:100%; margin-top:15px;">
                ${buttonText}
            </button>
        `;

        const button = document.getElementById("modalAction");

        if (button) {
            button.onclick = () => {
                overlay.style.display = "none";

                if (typeof callback === "function") {
                    callback();
                }
            };
        }

        overlay.style.display = "flex";
    },

    getActions() {
        const actions = [];

        const add = (label, cost, condition, callback, help, id) => {
            actions.push({
                id,
                label,
                cost,
                enabled: condition && can(cost),
                run: callback,
                help
            });
        };

        if (game.currentRoom === "power") {
            add(
                "🔌 Restore Power Module",
                { materials: 3, energy: 5 },
                !game.powerRestored,
                () => act(
                    "Power module restored.",
                    { materials: 3, energy: 5 },
                    () => {
                        game.powerRestored = true;
                        game.energy = clamp(game.energy + 20);
                        ARESScore.award("repair", {key:"repair:power",reason:"Restoration: Power Systems"});
                    }
                ),
                "Restores the station’s power supply."
            );

            add(
                "⚡ Recharge Batteries",
                { energy: 5 },
                game.powerRestored,
                () => act(
                    "Batteries recharged (+20 energy).",
                    { energy: 5 },
                    () => {
                        game.energy = clamp(game.energy + 20);
                    }
                ),
                "Replenishes the energy supply."
            );
        }

        if (game.currentRoom === "life") {
            if (typeof getLifeChoices === "function") {
                return getLifeChoices(moduleState);
            }
        }

        if (game.currentRoom === "farm") {
            if (typeof getFarmChoices === "function") {
                return getFarmChoices(moduleState);
            }
        }

        if (game.currentRoom === "shield") {
            add(
                "🛡️ Restore Protective Shield",
                { materials: 4, energy: 8 },
                !game.protectionRestored,
                () => act(
                    "Protective shield restored.",
                    { materials: 4, energy: 8 },
                    () => {
                        game.protectionRestored = true;
                        game.protection = clamp(game.protection + 30);
                        ARESScore.award("repair", {key:"repair:shield",reason:"Restoration: protection"});
                    }
                ),
                "Improves hull protection.", "shieldRepair"
            );

            add(
                "🔧 Repair Hull",
                { materials: 3, energy: 5 },
                game.protection < 100,
                () => act(
                    "Station hull repaired.",
                    { materials: 3, energy: 5 },
                    () => {
                        game.protection = clamp(game.protection + 20);
                    }
                ),
                "Restores hull integrity.", "hullRepair"
            );
        }

        if (game.currentRoom === "mine") {
            add("🔧 Restore Mining Module", {materials:2,energy:4}, !game.miningRestored,
              () => act("Mining module restored",{materials:2,energy:4},()=>{game.miningRestored=true;ARESScore.award("repair",{key:"repair:mine",reason:"Mining module restoration"});}),"Required for extracting ice and regolith.", "mineRepair");
            add(
                "⛏️ Extract Ice",
                { energy: 5 },
                game.miningRestored && game.energy >= 5,
                () => act(
                    "10 units of ice extracted.",
                    { energy: 5 },
                    () => {
                        game.ice += 10;
                        game.water = clamp(game.water + 5);
                        ARESScore.award("mining", {key:ARESScore.id("mine"),group:"mine:ice",reason:"Mining: ice"});
                    }
                ),
                "Obtain ice and partially replenish water.", "ice"
            );

            add(
                "🪨 Extract Regolith",
                { energy: 4 },
                game.miningRestored && game.energy >= 4,
                () => act(
                    "5 units of regolith extracted.",
                    { energy: 4 },
                    () => {
                        game.regolith += 5;
                        game.materials += 2;
                        ARESScore.award("mining", {key:ARESScore.id("mine"),group:"mine:regolith",reason:"Mining: regolith"});
                    }
                ),
                "Obtain materials for repairs.", "regolith"
            );

            add(
                "📦 Process Regolith",
                { regolith: 5, energy: 3 },
                game.regolith >= 5,
                () => act(
                    "Regolith processed. 3 materials obtained.",
                    { regolith: 5, energy: 3 },
                    () => {
                        game.materials += 3;
                    }
                ),
                "Converts regolith into materials."
            );
        }

        if (game.currentRoom === "command") {
            add(
                "📡 Restore Radio Communications",
                { materials: 3, energy: 8 },
                !game.radioRestored,
                () => act(
                    "Radio system restored.",
                    { materials: 3, energy: 8 },
                    () => {
                        game.radioRestored = true;
                        ARESScore.award("repair", {key:"repair:radio",reason:"Restoration: Radio Communications"});
                    }
                ),
                "Allows the distress signal to be prepared."
            );

            add(
                "🚀 Send Distress Signal",
                { energy: 10 },
                game.radioRestored && !game.signalSent,
                () => act(
                    "Distress signal transmitted!",
                    { energy: 10 },
                    () => {
                        game.signalSent = true;
                        ARESScore.award("signal", {key:"signal",reason:"Distress signal transmitted"});
                    }
                ),
                "Radio communications must be restored first."
            );

            add(
                "📊 Check Station Status",
                {},
                true,
                () => {
                    logEvent("Station systems have been checked.");
                    this.render();
                },
                "Check current readings."
            );
        }

        return actions;
    },

    render() {
        window.ARESProtection?.refresh();
        this.renderHeader();
        this.renderRooms();
        this.renderScene();
        this.renderActions();
        this.renderMeters();
        this.renderInventory();
        this.renderObjectives();
        this.renderLog();
    },

    renderHeader() {
        const element = document.getElementById("turnInfo");

        if (element) {
            element.textContent =
                `DAY ${game.day}/${game.maxDays}`;
        }
    },

    renderRooms() {
        const element = document.getElementById("rooms");

        if (!element) return;

        element.innerHTML = Object.entries(this.rooms).map(([id, room]) => `
            <button
                class="room-button ${game.currentRoom === id ? "active" : ""}"
                data-room="${id}">
                ${room.name}
            </button>
        `).join("");

        element.querySelectorAll("[data-room]").forEach(button => {
            button.onclick = () => {
                this.selectRoom(button.dataset.room);
            };
        });
    },

    renderScene() {
        const room = this.rooms[game.currentRoom];

        if (!room) return;

        const title = document.getElementById("sceneTitle");
        const subtitle = document.getElementById("sceneSub");
        const tag = document.getElementById("roomTag");
        const description = document.getElementById("desc");
        const weather = document.getElementById("weatherTag");
        const supply = document.getElementById("supplyTag");

        if (title) title.textContent = room.name;
        if (subtitle) subtitle.textContent = room.subtitle;
        if (tag) tag.textContent = game.currentRoom.toUpperCase();
        if (description) description.textContent = room.description;

        if (weather) {
            weather.textContent = game.stormActive
                ? "DUST STORM"
                : "WEATHER: STABLE";
        }

        if (supply) {
            supply.textContent = game.powerRestored
                ? "ENERGY: STABLE"
                : "ENERGY: LIMITED";
        }

        const eventBox = document.getElementById("eventBox");

        if (eventBox) {
            eventBox.textContent = game.message || "";
        }

        const protectionRoot = document.getElementById("protection-root");

        if (protectionRoot) {
            protectionRoot.style.display =
                game.currentRoom === "emergency" ? "block" : "none";
        }
    },

    actionBlockReason(action) {
        if (!game.gameStarted) return 'Press “Start Game” first.';
        if (game.gameOver) return 'Mission completed. Start a new game.';
        if (!can(action.cost)) return 'Not enough resources. Required: ' + formatCost(action.cost);
        const label=action.label;
        if (/Send Distress Signal/i.test(label)) return game.signalSent?'The signal has already been transmitted.':'Restore radio communications first.';
        if (/Restore|Start Oxygen Module/i.test(label)) return 'This system has already been restored.';
        if (/Recharge/i.test(label)) return 'Restore the power module first.';
        if (/Grow|Synthesize/i.test(label)&&!game.greenhouseRestored) return 'Restore the greenhouse first.';
        if (/Extract/i.test(label)&&!game.miningRestored) return 'Restore the mining module first.';
        if (/tanks|filters|condensate|saving mode/i.test(label)&&!game.oxygenSystemRestored) return 'Start the oxygen module first.';
        if (/filters/i.test(label)) return 'The filters are already clean; no maintenance is needed now.';
        if (/Crew Rest/i.test(label)) return 'Crew morale is already at maximum.';
        if (/Take Vitamin/i.test(label)) return game.vitamins<=0?'No vitamin packs available.':'The health meter is already full.';
        if (/Synthesize/i.test(label)) return 'The supply of packs is already at its maximum (5).';
        if (/hull/i.test(label)) return 'The hull is already at full integrity.';
        if (/saving mode/i.test(label)) return 'Economy mode is already active for the next turn.';
        return 'This action is currently unavailable: check resources and system status.';
    },

    renderActions() {
        const element = document.getElementById("actions");

        if (!element) return;

        if (game.currentRoom === "emergency") {
            element.innerHTML = `
                <p>The emergency module is available in this compartment.</p>
            `;
            return;
        }

        const actions = this.getActions();

        if (actions.length === 0) {
            element.innerHTML = "<p>No actions available.</p>";
            return;
        }

        element.innerHTML = actions.map((action, index) => `
            <article class="action-card">
            <button
                class="action-button ${action.enabled && game.gameStarted && !game.gameOver ? "" : "unavailable"}"
                data-action-index="${index}">
                ${action.label}${action.enabled && game.gameStarted && !game.gameOver ? "" : " · ⓘ"}
            </button>
            <small class="action-help">Cost: ${formatCost(action.cost) || "no cost"}</small>

            ${action.help ? `<div class="action-help">${action.help}</div>` : ""}
            ${action.enabled && game.gameStarted && !game.gameOver ? "" : `<p class="blocked-reason">${this.actionBlockReason(action)}</p>`}
            </article>
        `).join("");

        element.querySelectorAll("[data-action-index]").forEach(button => {
            button.onclick = () => {
                const action = actions[Number(button.dataset.actionIndex)];

                if (!action) return;
                if (!action.enabled || !game.gameStarted || game.gameOver) {
                    logEvent(this.actionBlockReason(action));
                    const reason = button.closest('.action-card')?.querySelector('.blocked-reason');
                    if (reason) reason.textContent = this.actionBlockReason(action);
                    return;
                }

                const callback = action.run || action.callback;

                if (typeof callback === "function") {
                    callback();
                }

                this.render();
            };
        });
    },

    renderMeters() {
        const element = document.getElementById("meters");

        if (!element) return;

        const meters = [
            ["Health", game.health],
            ["Energy", game.energy],
            ["Oxygen", game.oxygen],
            ["Water", game.water],
            ["Food", game.food],
            ["Protection", game.protection],
            ["Morale", game.morale]
        ];

        element.innerHTML = meters.map(([name, value]) => `
            <div class="meter">
                <div class="meter-heading">
                    <span>${name}</span>
                    <strong>${Math.round(value)}%</strong>
                </div>

                <div class="meter-track">
                    <div class="meter-fill"
                        style="width:${clamp(value)}%">
                    </div>
                </div>
            </div>
        `).join("");
    },

    renderInventory() {
        const element = document.getElementById("inventory");

        if (!element) return;

        const resources = [
            ["⚡ Energy", game.energy],
            ["🫁 Oxygen", game.oxygen],
            ["💧 Water", game.water],
            ["🍎 Food", game.food],
            ["🔩 Materials", game.materials],
            ["🧊 Ice", game.ice],
            ["🪨 Regolith", game.regolith],
            ["💊 Vitamins", game.vitamins]
        ];

        element.innerHTML = resources.map(([name, value]) => `
            <div class="inventory-item">
                <span>${name}</span>
                <strong>${value}</strong>
            </div>
        `).join("");
    },

    renderObjectives() {
        const element = document.getElementById("objectives");

        if (!element) return;

        const objectives = [
            ["Restore Power Module", game.powerRestored],
            ["Start Oxygen Module", game.oxygenSystemRestored],
            ["Restore Greenhouse", game.greenhouseRestored],
            ["Restore Protective Shield", game.protectionRestored],
            ["Restore Mining Module", game.miningRestored],
            ["Restore Radio Communications", game.radioRestored],
            ["Send Distress Signal", game.signalSent]
        ];

        element.innerHTML = objectives.map(([name, completed]) => `
            <div class="objective ${completed ? "completed" : ""}">
                <span>${completed ? "✓" : "○"}</span>
                ${name}
            </div>
        `).join("");
    },

    renderLog() {
        const element = document.getElementById("log");

        if (!element) return;

        element.innerHTML = game.log.map(item => `
            <div class="log-entry">
                <strong>Day ${item.day}:</strong>
                ${item.message}
            </div>
        `).join("");
    }
};

window.ARESGame = Game;

window.start = () => Game.start();
window.restart = () => Game.restart();

window.clamp = clamp;
window.can = can;
window.spend = spend;
window.act = act;
window.nextTurn = nextTurn;
window.render = () => Game.render();
window.notice = notice;

document.addEventListener("DOMContentLoaded", () => {
    Game.render();
    Game.syncSpaceMapDay();

    const mapButton = document.getElementById("open-space-map");

    if (mapButton) {
        mapButton.addEventListener("click", () => {
            Game.openSpaceMap();
        });
    }

    if (window.SpaceMap) {
        window.SpaceMap.onMissionSelect(detail => {
            Game.startSpaceMission(detail);
        });
    }

    Game.showModal(
        "Welcome to ARES-7 Station",
        "Your mission is to restore the station and save the crew.",
        "You have 20 days. Use your resources wisely.",
        "▶ Start Game",
        () => Game.start()
    );
});
