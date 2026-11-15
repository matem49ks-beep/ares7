const protectionIncidents = [
    {
        id: "fire",
        name: "STATION FIRE",
        severity: "HIGH",
        cause: "A short circuit has occurred in the power module.",
        description: "Smoke has appeared in the technical compartment. The temperature is rising rapidly.",
        instructions: [
            "Locate the source of the fire.",
            "Shut off power to the damaged module.",
            "Activate the fire suppression system.",
            "Check adjacent compartments."
        ],
        time: 45,
        scores: { fire: 100, seal: 70, repair: 35, computer: 45, shield: 20, medical: 15 },
        feedback: {
            fire: "The fire is out! The compartment is safe.",
            seal: "The compartment is isolated, but the fire still needs to be extinguished.",
            repair: "Repairs do not put out the fire.",
            computer: "Restarting the system did not eliminate the short circuit.",
            shield: "The external shield does not protect against an internal fire.",
            medical: "The fire must be extinguished first."
        }
    },
    {
        id: "oxygen",
        name: "OXYGEN LEAK",
        severity: "CRITICAL",
        cause: "The oxygen pipeline is damaged.",
        description: "Pressure is dropping and the oxygen supply is decreasing rapidly.",
        instructions: [
            "Use the emergency oxygen tank.",
            "Isolate the damaged compartment.",
            "Shut off the damaged pipeline.",
            "Perform repairs."
        ],
        time: 35,
        scores: { fire: 0, seal: 100, repair: 75, computer: 25, shield: 20, medical: 60 },
        feedback: {
            fire: "Fire suppression does not stop an oxygen leak.",
            seal: "The compartment is sealed! The pressure drop has stopped.",
            repair: "The repair helped, but the compartment should have been isolated first.",
            computer: "Restarting the computer will not fix a damaged pipe.",
            shield: "The external shield does not stop the leak.",
            medical: "Assistance was provided, but oxygen is still leaking."
        }
    },
    {
        id: "hull",
        name: "HULL DAMAGE",
        severity: "CRITICAL",
        cause: "A space fragment has damaged the outer hull.",
        description: "A crack has formed in the hull. The station is no longer airtight.",
        instructions: [
            "Identify the damaged area.",
            "Isolate the compartment.",
            "Activate emergency protection.",
            "Repair the outer hull."
        ],
        time: 40,
        scores: { fire: 0, seal: 85, repair: 100, computer: 20, shield: 65, medical: 10 },
        feedback: {
            fire: "There is no fire. Fire suppression will not fix the breach.",
            seal: "The compartment is isolated, but the hull is still damaged.",
            repair: "The hull has been successfully repaired!",
            computer: "Restarting the computer will not fix mechanical damage.",
            shield: "The shield reduced the risk of additional impacts.",
            medical: "Medical assistance does not repair hull damage."
        }
    },
    {
        id: "computer",
        name: "COMPUTER SYSTEM FAILURE",
        severity: "MEDIUM",
        cause: "Processor overheating caused a control error.",
        description: "The navigation computer is not responding.",
        instructions: [
            "Check the temperature.",
            "Switch to manual mode.",
            "Restart the damaged module.",
            "Check navigation operation."
        ],
        time: 55,
        scores: { fire: 15, seal: 10, repair: 45, computer: 100, shield: 25, medical: 0 },
        feedback: {
            fire: "There is no fire.",
            seal: "Sealing does not restore the computer.",
            repair: "Mechanical repairs do not fix a software failure.",
            computer: "The system has restarted! Navigation is operational.",
            shield: "The shield does not fix an internal error.",
            medical: "Medical assistance does not affect the computer."
        }
    },
    {
        id: "threat",
        name: "EXTERNAL THREAT",
        severity: "HIGH",
        cause: "A group of space debris has been detected near the station.",
        description: "Several fragments are approaching the station.",
        instructions: [
            "Determine the direction of debris movement.",
            "Activate the protective shield.",
            "Check the external sensors.",
            "Inspect the hull after the threat has passed."
        ],
        time: 45,
        scores: { fire: 0, seal: 20, repair: 25, computer: 60, shield: 100, medical: 0 },
        feedback: {
            fire: "Fire suppression does not protect against debris.",
            seal: "Sealing does not stop debris.",
            repair: "The shield must be activated first.",
            computer: "The sensors helped assess the threat, but the shield was not activated.",
            shield: "The protective shield is active! The debris has been deflected.",
            medical: "Medical assistance does not affect an external threat."
        }
    },
    {
        id: "injury",
        name: "ASTRONAUT INJURY",
        severity: "HIGH",
        cause: "An astronaut was injured during an emergency maneuver.",
        description: "The astronaut cannot work normally and needs medical assistance.",
        instructions: [
            "Check the astronaut’s condition.",
            "Assess the type of injury.",
            "Use the medical kit.",
            "Immobilize the injured limb."
        ],
        time: 55,
        scores: { fire: 0, seal: 10, repair: 5, computer: 15, shield: 10, medical: 100 },
        feedback: {
            fire: "Fire suppression does not help the astronaut.",
            seal: "Sealing does not treat an injury.",
            repair: "Hull repairs will not treat an injury.",
            computer: "Restarting the computer does not affect the astronaut’s condition.",
            shield: "The shield does not treat the injury.",
            medical: "Medical assistance provided! The astronaut’s condition is stable."
        }
    }
];

const protectionActions = [
    ["Fire Suppression", "fire"],
    ["Seal Compartment", "seal"],
    ["Repair Hull", "repair"],
    ["Restart Computer", "computer"],
    ["Activate Shield", "shield"],
    ["Medical Assistance", "medical"]
];

const protectionState = {
    health: 100,
    hull: 100,
    shield: 100,
    score: 0,
    level: 1,
    incident: null,
    timeLeft: 0,
    timer: null,
    nextTimer: null,
    nextIncidentDay: null,
    active: false,
    gameOver: false,
    started: false,
    usedActions: [],
    lastResult: null,
    page: "Emergencies"
};

const protectionRoot = document.getElementById("protection-root");

if (protectionRoot) {
    protectionRoot.innerHTML = `
        <div class="rp-game">
            <header class="rp-header">
                <div class="rp-logo">RESOURCE PROTECT</div>
                <div class="rp-stats" id="rp-stats"></div>
            </header>

            <div class="rp-layout">
                <aside class="rp-sidebar">
                    <div class="rp-menu-title">MENU</div>
                    <button class="rp-nav active" data-page="Emergencies">Emergencies</button>
                    <button class="rp-nav" data-page="Protection">Protection</button>
                    <div class="rp-sidebar-bottom">
                        EMERGENCY<br>MANAGEMENT<br>SYSTEM
                    </div>
                </aside>

                <main class="rp-main" id="rp-main">
                    <h1 class="rp-title">PROTECTION SYSTEM</h1>
                    <div class="rp-panel">
                        <p>The emergency module is waiting for the main mission to start.</p>
                    </div>
                </main>
            </div>
        </div>
    `;

    const rpStyle = document.createElement("style");

    rpStyle.textContent = `
        .rp-game {
            background: #081522;
            color: #EAF4FF;
            min-height: 700px;
            font-family: Arial, sans-serif;
            border-radius: 12px;
            overflow: hidden;
        }

        .rp-header {
            background: #0B1C2C;
            min-height: 85px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            padding: 15px 25px;
            flex-wrap: wrap;
        }

        .rp-logo {
            color: #36D6D0;
            font-size: 23px;
            font-weight: bold;
        }

        .rp-stats {
            font-size: 12px;
            font-weight: bold;
            line-height: 1.8;
        }

        .rp-layout {
            display: flex;
            min-height: 610px;
        }

        .rp-sidebar {
            width: 190px;
            flex-shrink: 0;
            background: #0C2032;
            padding: 25px 12px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .rp-menu-title {
            color: #9BB1C5;
            font-size: 12px;
            font-weight: bold;
            padding: 0 8px 10px;
        }

        .rp-nav {
            border: 0;
            padding: 14px;
            color: #EAF4FF;
            background: #102438;
            border-radius: 5px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
        }

        .rp-nav.active {
            color: #081522;
            background: #36D6D0;
        }

        .rp-sidebar-bottom {
            color: #52728C;
            font-size: 11px;
            font-weight: bold;
            line-height: 1.6;
            margin-top: auto;
            padding: 15px 8px;
        }

        .rp-main {
            flex: 1;
            min-width: 0;
            padding: 25px;
        }

        .rp-title {
            font-size: 25px;
            margin: 0 0 8px;
        }

        .rp-subtitle {
            color: #9BB1C5;
            font-size: 13px;
            margin-bottom: 20px;
        }

        .rp-panel {
            background: #102438;
            border-radius: 8px;
            padding: 18px;
            margin-bottom: 12px;
        }

        .rp-panel h3 {
            color: #36D6D0;
            font-size: 13px;
            margin: 0 0 8px;
        }

        .rp-panel p {
            margin: 0 0 13px;
            line-height: 1.5;
            font-size: 14px;
        }

        .rp-incident-name {
            color: #FF647C;
            font-size: 19px;
            font-weight: bold;
        }

        .rp-severity {
            font-size: 12px;
            font-weight: bold;
        }

        .rp-timer {
            color: #FFC857;
            font-size: 19px;
            font-weight: bold;
            margin: 15px 0;
        }

        .rp-instructions {
            line-height: 1.9;
            font-size: 14px;
        }

        .rp-actions {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
        }

        .rp-action {
            border: 0;
            background: #163149;
            color: #EAF4FF;
            padding: 15px 10px;
            border-radius: 5px;
            font-size: 13px;
            font-weight: bold;
            cursor: pointer;
        }

        .rp-action:hover:not(:disabled) {
            background: #36D6D0;
            color: #081522;
        }

        .rp-action:disabled {
            opacity: 0.35;
            cursor: not-allowed;
        }

        .rp-result-percent {
            font-size: 34px;
            font-weight: bold;
            margin: 8px 0;
        }

        .rp-advice {
            color: #9BB1C5;
            margin-top: 10px !important;
        }

        .rp-empty {
            color: #42D392;
            font-size: 15px;
        }

        @media (max-width: 700px) {
            .rp-layout {
                flex-direction: column;
            }

            .rp-sidebar {
                width: auto;
                flex-direction: row;
                flex-wrap: wrap;
            }

            .rp-menu-title,
            .rp-sidebar-bottom {
                display: none;
            }

            .rp-nav {
                flex: 1;
            }

            .rp-main {
                padding: 15px;
            }

            .rp-actions {
                grid-template-columns: 1fr;
            }

            .rp-stats {
                font-size: 10px;
            }
        }
    `;

    document.head.appendChild(rpStyle);

    const rpMain = document.getElementById("rp-main");
    const rpStats = document.getElementById("rp-stats");

    function syncProtection() {
        if (window.ARESGame) {
            window.ARESGame.updateProtection(
                protectionState.health,
                protectionState.hull
            );

            window.ARESGame.logEvent(
                `Emergency system: health ${protectionState.health}%, hull ${protectionState.hull}%.`
            );
        }

        updateProtectionStats();
    }

    function updateProtectionStats() {
        const current=window.ARESGame?.getState();
        if(current){protectionState.health=current.health;protectionState.hull=current.protection;}
        rpStats.textContent =
            `HEALTH: ${protectionState.health}% | ` +
            `HULL: ${protectionState.hull}% | ` +
            `SHIELD: ${protectionState.shield}% | ` +
            `TOTAL SCORE: ${ARESScore.total} | ` +
            `LEVEL: ${protectionState.level}`;
        updateEmergencyNotice();
    }

    function updateEmergencyNotice() {
        const banner = document.getElementById('emergency-notice');
        if (!banner) return;
        const active = protectionState.active && protectionState.incident &&
            !protectionState.gameOver && !window.ARESGame?.getState().gameOver;
        banner.hidden = !active;
        if (!active) return;
        document.getElementById('emergency-notice-text').textContent =
            'Emergency: ' + protectionState.incident.name +
            (ARESScore.config.timed ? '. The timer runs only while the emergency compartment is open.' : '. Training mode — no timer.');
        document.getElementById('emergency-notice-open').onclick = () => {
            window.ARESMissions?.returnToMap();
            window.ARESGame.closeSpaceMap();
            window.ARESGame.selectRoom('emergency');
        };
    }

    function getCurrentGameDay() {
        if (window.ARESGame) {
            const state = window.ARESGame.getState();

            if (state && typeof state.day === "number") {
                return state.day;
            }
        }

        return 1;
    }

    function scheduleNextIncident() {
        const delay = Math.floor(ARESScore.random() * 3) + 3;

        protectionState.nextIncidentDay = getCurrentGameDay() + delay;
    }

    function renderProtectionWaiting() {
        const daysLeft = protectionState.nextIncidentDay === null
            ? 0
            : Math.max(0, protectionState.nextIncidentDay - getCurrentGameDay());

        rpMain.innerHTML = `
            <h1 class="rp-title">PROTECTION SYSTEM</h1>

            <div class="rp-panel">
                <p class="rp-empty">No active emergencies.</p>
                ${protectionState.lastResult?`<p>${protectionState.lastResult.feedback}</p><p>${protectionState.lastResult.advice}</p>`:""}
                <p>The station is operating normally.</p>
                <p>The next emergency is expected in ${daysLeft} game days.</p>
            </div>
        `;
    }

    function switchProtectionPage(page) {
        if (protectionState.gameOver || !protectionState.started) return;

        protectionState.page = page;

        document.querySelectorAll(".rp-nav").forEach(button => {
            button.classList.toggle("active", button.dataset.page === page);
        });

        renderProtectionPage();
    }

    function renderProtectionPage() {
        updateEmergencyNotice();
        if (!protectionState.started) {
            rpMain.innerHTML = `
                <h1 class="rp-title">PROTECTION SYSTEM</h1>
                <div class="rp-panel">
                    <p>The emergency module is waiting for the main mission to start.</p>
                </div>
            `;
            return;
        }

        if (protectionState.gameOver) {
            renderProtectionGameOver();
            return;
        }

        if (!protectionState.active || !protectionState.incident) {
            renderProtectionWaiting();
            return;
        }

        if (protectionState.page === "Emergencies") {
            renderProtectionIncident();
        } else {
            renderProtectionActions();
        }
    }

    function renderProtectionIncident() {
        const incident = protectionState.incident;

        if (!incident) {
            renderProtectionWaiting();
            return;
        }

        let severityColor = "#FF647C";

        if (incident.severity === "MEDIUM") severityColor = "#FFC857";
        if (incident.severity === "HIGH") severityColor = "#FF9D55";

        rpMain.innerHTML = `
            <h1 class="rp-title">EMERGENCY CENTER</h1>

            <div class="rp-subtitle">
                Monitor the station situation and read the instructions carefully.
            </div>

            <div class="rp-panel">
                <div class="rp-incident-name">${incident.name}</div>

                <div class="rp-severity" style="color:${severityColor}">
                    DANGER: ${incident.severity}
                </div>

                <div class="rp-timer" id="rp-timer">
                    ${ARESScore.config.timed?"TIME LEFT: "+protectionState.timeLeft+" sec.":"TRAINING MODE: NO TIMER"}
                </div>

                <h3>WHAT HAPPENED?</h3>
                <p>${incident.description}</p>

                <h3>CAUSE OF EMERGENCY:</h3>
                <p>${incident.cause}</p>
            </div>

            <div class="rp-panel">
                <h3>ASTRONAUT INSTRUCTIONS</h3>

                <div class="rp-instructions">
                    ${incident.instructions.map((item, i) =>
                        `${i + 1}. ${item}`
                    ).join("<br>")}
                </div>
            </div>

            <div class="rp-panel">
                <h3>LATEST SYSTEM RESPONSE</h3>
                <p id="rp-status">${protectionState.lastResult?.feedback || "Waiting for astronaut action..."}</p>
                <button class="rp-action" data-page="Protection">Choose an action to resolve the emergency →</button>
            </div>
        `;
    }

    function renderProtectionActions() {
        if (!protectionState.active) {
            renderProtectionWaiting();
            return;
        }

        rpMain.innerHTML = `
            <h1 class="rp-title">PROTECTION SYSTEM</h1>

            <div class="rp-subtitle">
                Choose an action according to the instructions.
            </div>

            <div class="rp-panel">
                <div class="rp-incident-name">${protectionState.incident.name}</div>
                <div class="rp-timer" id="rp-timer">${ARESScore.config.timed ? 'TIME LEFT: '+protectionState.timeLeft+' sec.' : 'TRAINING MODE: NO TIMER'}</div>
                <p>${protectionState.incident.description}</p>
                <p><strong>Cause:</strong> ${protectionState.incident.cause}</p>
                <h3>ASTRONAUT INSTRUCTIONS</h3>
                <ol class="rp-instructions">${protectionState.incident.instructions.map(item => `<li>${item}</li>`).join('')}</ol>
            </div>

            <div class="rp-panel">
                <h3>CHOOSE A PROTECTIVE ACTION</h3>

                <div class="rp-actions">
                    ${protectionActions.map(([name, id]) => `
                        <button class="rp-action"
                            data-action="${id}"
                            ${protectionState.usedActions.includes(id) ? "disabled" : ""}>
                            ${name}
                        </button>
                    `).join("")}
                </div>
            </div>

            <div class="rp-panel">
                <h3>RESULT OF YOUR DECISION</h3>
                <div class="rp-result-percent" id="rp-percent">— / 100</div>
                <p id="rp-result">Press a button to perform an action.</p>
                <p class="rp-advice" id="rp-advice"></p>
            </div>
        `;

        if (protectionState.lastResult) {
            showProtectionResult(
                protectionState.lastResult.percent,
                protectionState.lastResult.type,
                protectionState.lastResult.feedback,
                protectionState.lastResult.color,
                protectionState.lastResult.advice
            );
        }
    }

    function showProtectionResult(percent, type, feedback, color, advice) {
        const percentElement = document.getElementById("rp-percent");
        const resultElement = document.getElementById("rp-result");
        const adviceElement = document.getElementById("rp-advice");

        if (!percentElement || !resultElement || !adviceElement) return;

        percentElement.textContent = `Index: ${percent}/100`;
        percentElement.style.color = color;
        resultElement.textContent = `${type}: ${feedback}`;
        adviceElement.textContent = advice;
    }

    function performProtectionAction(actionId) {
        if (!protectionState.active || protectionState.gameOver || !window.ARESGame.getState().gameStarted || window.ARESGame.getState().gameOver) return;
        const before = ARESScore.snapshot();
        protectionState.health=before.health;protectionState.hull=before.protection;
        if (protectionState.usedActions.includes(actionId)) return;

        const incident = protectionState.incident;

        if (!incident || incident.scores[actionId] === undefined) return;

        protectionState.usedActions.push(actionId);

        const percent = incident.scores[actionId];
        const feedback = incident.feedback[actionId];

        let color;
        let resultType;
        let advice;

        if (percent >= 90) {
            color = "#42D392";
            resultType = "EXCELLENT DECISION";
        } else if (percent >= 60) {
            color = "#FFC857";
            resultType = "PARTIALLY CORRECT DECISION";
        } else if (percent >= 30) {
            color = "#FF9D55";
            resultType = "INEFFECTIVE DECISION";
        } else {
            color = "#FF647C";
            resultType = "INCORRECT DECISION";
        }

        const rule=percent>=90?(protectionState.usedActions.length===1?'emergencyCorrect':'emergencyFixed'):percent>=60?'emergencyPartial':percent>=30?'emergencyWeak':'emergencyWrong';
        const scoreEntry=ARESScore.award(rule,{key:protectionState.scoreKey+':'+actionId,group:rule==='emergencyPartial'?protectionState.scoreKey+':partial':undefined,limit:1,reason:incident.name+': '+feedback,section:'Emergencies'});
        const scoreNote=`Score ${scoreEntry.delta>0?'+':''}${scoreEntry.delta}. Index ${percent}/100 — a custom relevance score, not a probability.`;
        protectionState.score=ARESScore.total;

        if (percent >= 90) {
            protectionState.health = Math.min(100, protectionState.health + 5);
            protectionState.hull = Math.min(100, protectionState.hull + 5);
            protectionState.shield = Math.min(100, protectionState.shield + 5);

            protectionState.active = false;
            protectionState.incident = null;

            protectionState.level++;

            advice = "Emergency resolved. Health and hull: up to +5 (maximum 100). " + scoreNote;

            protectionState.lastResult = {
                percent,
                type: resultType,
                feedback,
                color,
                advice
            };

            clearInterval(protectionState.timer);
            protectionState.timer = null;

            scheduleNextIncident();
            syncProtection();
            ARESScore.trace("Emergency Resolution",before);
            renderProtectionPage();

            return;
        }

        if (percent >= 60) {
            protectionState.timeLeft = Math.max(0, protectionState.timeLeft - 3);
            protectionState.health = Math.max(0, protectionState.health - 2);
            advice = "This action helped, but the emergency is not resolved yet. Choose another action.";
        } else if (percent >= 30) {
            protectionState.timeLeft = Math.max(0, protectionState.timeLeft - 7);
            protectionState.health = Math.max(0, protectionState.health - 5);
            advice = "You lost time. Review the instructions and try another approach.";
        } else {
            protectionState.timeLeft = Math.max(0, protectionState.timeLeft - 10);
            protectionState.health = Math.max(0, protectionState.health - 8);
            protectionState.hull = Math.max(0, protectionState.hull - 3);
            advice = "The incorrect action made the situation worse.";
        }

        advice += " " + scoreNote + " Actual resource changes have been recorded in the report.";
        protectionState.lastResult = {
            percent,
            type: resultType,
            feedback,
            color,
            advice
        };

        syncProtection();
        ARESScore.trace("Consequence of Emergency Decision",before);
        renderProtectionPage();

        if (protectionState.health <= 0 || protectionState.hull <= 0) {
            setTimeout(endProtectionGame, 700);
            return;
        }

        if (ARESScore.config.timed && protectionState.timeLeft <= 0) {
            protectionTimeout();
        }
    }

    function newProtectionIncident() {
        if (protectionState.gameOver || !protectionState.started) return;

        clearInterval(protectionState.timer);
        clearTimeout(protectionState.nextTimer);

        const randomIndex = Math.floor(ARESScore.random() * protectionIncidents.length);

        protectionState.incident = protectionIncidents[randomIndex];
        protectionState.scoreKey=ARESScore.id("incident");

        protectionState.timeLeft = Math.max(
            20,
            protectionState.incident.time - (protectionState.level - 1) * 3
        );

        protectionState.nextIncidentDay = null;
        protectionState.active = true;
        protectionState.usedActions = [];
        protectionState.lastResult = null;
        protectionState.page = "Emergencies";

        document.querySelectorAll(".rp-nav").forEach(button => {
            button.classList.toggle("active", button.dataset.page === "Emergencies");
        });

        renderProtectionPage();
        startProtectionTimer();

        if (window.ARESGame) {
            window.ARESGame.logEvent(
                `Emergency detected: ${protectionState.incident.name}.`
            );
        }
    }

    function startProtectionTimer() {
        clearInterval(protectionState.timer);

        if(!ARESScore.config.timed)return;
        protectionState.timer = setInterval(() => {
            const st=window.ARESGame.getState();
            if (!protectionState.active || protectionState.gameOver || st.gameOver || st.currentRoom!=='emergency' || document.hidden || document.getElementById('learning-dialog')?.open || document.getElementById('station-dialog')?.open || document.getElementById('minigame-dialog')?.open || document.getElementById('decision-dialog')?.open || document.getElementById('overlay')?.style.display!=='none') return;

            protectionState.timeLeft--;

            const timerElement = document.getElementById("rp-timer");

            if (timerElement) {
                timerElement.textContent =
                    `${ARESScore.config.timed?"TIME LEFT: "+protectionState.timeLeft+" sec.":"TRAINING MODE: NO TIMER"}`;
            }

            if (protectionState.timeLeft <= 0) {
                protectionTimeout();
            }
        }, 1000);
    }

    function protectionTimeout() {
        if (!protectionState.active || window.ARESGame.getState().gameOver) return;
        const before=ARESScore.snapshot();protectionState.health=before.health;protectionState.hull=before.protection;
        const entry=ARESScore.award('emergencyTimeout',{key:protectionState.scoreKey+':timeout',reason:'Emergency was not resolved within the allotted time',section:'Emergencies'});
        protectionState.lastResult={feedback:'Time expired: health −15, hull −12.',advice:`${entry.delta} points. Analyze the cause of the emergency before trying again.`};

        protectionState.active = false;
        protectionState.incident = null;

        clearInterval(protectionState.timer);
        protectionState.timer = null;

        protectionState.health = Math.max(0, protectionState.health - 15);
        protectionState.hull = Math.max(0, protectionState.hull - 12);

        syncProtection();
        ARESScore.trace("Emergency time expired",before);

        if (protectionState.health <= 0 || protectionState.hull <= 0) {
            endProtectionGame();
            return;
        }

        scheduleNextIncident();
        renderProtectionPage();

        if (window.ARESGame) {
            window.ARESGame.logEvent(
                "The time to resolve the emergency has expired. The next emergency is scheduled."
            );
        }
    }

    function endProtectionGame() {
        if (protectionState.gameOver) return;

        protectionState.gameOver = true;
        protectionState.active = false;
        protectionState.incident = null;
        protectionState.nextIncidentDay = null;

        clearInterval(protectionState.timer);
        clearTimeout(protectionState.nextTimer);

        protectionState.timer = null;
        protectionState.nextTimer = null;

        syncProtection();

        if (window.ARESGame) {
            window.ARESGame.finish(
                false,
                "The emergency has brought the station to a critical state."
            );
        }

        renderProtectionGameOver();
    }

    function renderProtectionGameOver() {
        rpMain.innerHTML = `
            <div style="text-align:center; padding:80px 10px;">
                <h1 style="color:#FF647C; font-size:30px;">
                    EMERGENCY STATE
                </h1>

                <p>
                    The station has reached a critical state.<br>
                    The main mission has ended.
                </p>

                <h2 style="color:#36D6D0; margin-top:30px;">
                    FINAL SCORE: ${ARESScore.total}
                </h2>
            </div>
        `;
    }

    function resetProtectionState() {
        clearInterval(protectionState.timer);
        clearTimeout(protectionState.nextTimer);

        protectionState.health = 100;
        protectionState.hull = 100;
        protectionState.shield = 100;
        protectionState.score = 0;
        protectionState.level = 1;
        protectionState.incident = null;
        protectionState.timeLeft = 0;
        protectionState.timer = null;
        protectionState.nextTimer = null;
        protectionState.nextIncidentDay = null;
        protectionState.active = false;
        protectionState.gameOver = false;
        protectionState.started = false;
        protectionState.usedActions = [];
        protectionState.lastResult = null;
        protectionState.page = "Emergencies";

        document.querySelectorAll(".rp-nav").forEach(button => {
            button.classList.toggle("active", button.dataset.page === "Emergencies");
        });

        updateProtectionStats();
        renderProtectionPage();
    }

    protectionRoot.addEventListener("click", event => {
        const pageButton = event.target.closest("[data-page]");

        if (pageButton) {
            switchProtectionPage(pageButton.dataset.page);
            return;
        }

        const actionButton = event.target.closest("[data-action]");

        if (actionButton) {
            performProtectionAction(actionButton.dataset.action);
        }
    });

    window.ARESProtection = {
        status: () => ({active: protectionState.active, name: protectionState.incident?.name || null}),
        refresh: updateProtectionStats,
        start() {
            if (protectionState.started && !protectionState.gameOver) return;

            protectionState.health = window.ARESGame
                ? window.ARESGame.getState().health
                : 100;

            protectionState.hull = window.ARESGame
                ? window.ARESGame.getState().protection
                : 100;

            protectionState.started = true;
            protectionState.gameOver = false;
            protectionState.active = false;

            scheduleNextIncident();
            updateProtectionStats();
            renderProtectionPage();
        },

        onDayPassed(day) {
            if (!protectionState.started || protectionState.gameOver) return;

            if (
                !protectionState.active &&
                protectionState.nextIncidentDay !== null &&
                day >= protectionState.nextIncidentDay
            ) {
                newProtectionIncident();
            } else if (!protectionState.active) {
                renderProtectionWaiting();
            }
        },

        stop() {
            clearInterval(protectionState.timer);
            clearTimeout(protectionState.nextTimer);

            protectionState.timer = null;
            protectionState.nextTimer = null;
            protectionState.nextIncidentDay = null;
            protectionState.active = false;
            protectionState.started = false;
            updateEmergencyNotice();
        },

        reset() {
            resetProtectionState();
        }
    };

    updateProtectionStats();
}
