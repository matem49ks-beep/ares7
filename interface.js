// ARES-7 internal module comment

function updateInterface(gameState) {
    if (!gameState) return;
    const dayEl = document.getElementById('turnInfo');
    if (dayEl && gameState.day !== undefined) {
        dayEl.textContent = `Day ${gameState.day} / 20`;
    }
    for (const name of ['energy', 'oxygen', 'water', 'food', 'health', 'protection']) {
        if (gameState[name] !== undefined) updateStat(name, gameState[name]);
    }
    const materials = document.getElementById('materials-count');
    if (materials && gameState.materials !== undefined) {
        materials.textContent = gameState.materials;
    }
}

function updateStat(name, value) {
    const textEl = document.getElementById(`${name}-val`);
    const barEl = document.getElementById(`${name}-bar`);
    const number = Number(value);
    if (textEl) textEl.textContent = `${value}%`;
    if (barEl && Number.isFinite(number)) {
        barEl.style.width = `${Math.max(0, Math.min(100, number))}%`;
        barEl.classList.add('progress-bar');
        barEl.classList.toggle('danger', number < 30);
        barEl.classList.toggle('warning', number >= 30 && number < 60);
    }
}

function switchModule(moduleName, title, description, clickedButton) {
    const titleEl = document.getElementById('sceneTitle');
    const descEl = document.getElementById('desc');
    if (titleEl) titleEl.textContent = title || moduleName || '';
    if (descEl) descEl.textContent = description || '';
    const buttons = document.querySelectorAll('#rooms .nav-btn, #rooms button');
    buttons.forEach(btn => btn.classList.remove('active'));
    if (clickedButton instanceof Element) clickedButton.classList.add('active');
    addLog(`Entered compartment: ${title || moduleName}`);
}

function addLog(message) {
    const logList = document.getElementById('log');
    if (!logList) return;
    const item = document.createElement('div');
    item.className = 'log-item';
    item.textContent = `▶ ${message}`;
    logList.prepend(item);
}
