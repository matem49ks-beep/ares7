function getLifeChoices(s) {
    const a = [];

    a.push({
        id: 'lifeRepair',
        label: '🔧 Start Oxygen Module (Minigame)',
        cost: { parts: 2, energy: 8 },
        enabled: !s.life && can({ parts: 2, energy: 8 }),
        run: () => {
            if (!s.gameStarted || s.gameOver) return;
            if (!can({ parts: 2, energy: 8 })) return;
            spend({ parts: 2, energy: 8 });
            openLifeMiniGame(s, {
                title: 'Oxygen Generator Startup',
                desc: 'Follow the oxygen reactor startup sequence:',
                icon: '🫁',
                steps: [
                    { id: 's1', icon: '🔌', label: 'Apply Power', sub: 'Circuit A' },
                    { id: 's2', icon: '🌡️', label: 'Check Water Circuit', sub: 'Electrolysis — Training Diagram' },
                    { id: 's3', icon: '🌀', label: 'Open Valves', sub: 'O2 Supply' }
                ],
                btnFinish: '✅ Start System (+12 oxygen)',
                effect: () => {
                    s.life = true;
                    s.oxygen = clamp(s.oxygen + 12);
                    if (typeof notice === 'function') notice('Oxygen module activated. Oxygen consumption has decreased.');
                }
            });
        },
        help: 'Interactive System Startup'
    });

    a.push({
        id: 'oxygen',
        label: '💨 Fill Oxygen Tanks (Minigame)',
        cost: { energy: 12 },
        enabled: s.life && can({ energy: 12 }),
        run: () => {
            if (!s.gameStarted || s.gameOver) return;
            if (!can({ energy: 12 })) return;
            spend({ energy: 12 });
            openLifeMiniGame(s, {
                title: 'Oxygen Tank Refilling',
                desc: 'Training sequence for preparing the reserve (not a technical procedure):',
                icon: '💨',
                steps: [
                    { id: 's1', icon: '🛢️', label: 'Check for Leaks', sub: 'Diagnostics First' },
                    { id: 's2', icon: '🛢️', label: 'Turn On Supply', sub: 'After Inspection' },
                    { id: 's3', icon: '🛢️', label: 'Check the Reserve', sub: 'Verify the Result' }
                ],
                btnFinish: '✅ Finish Refilling (+24 oxygen)',
                effect: () => {
                    s.oxygen = clamp(s.oxygen + 24);
                    if (typeof notice === 'function') notice('Tanks filled: +24 oxygen.');
                }
            });
        },
        help: 'Interactive Refilling (+24 oxygen)'
    });

    a.push({
        id: 'water',
        label: '♻️ Purify Water (Minigame)',
        cost: { energy: 8 },
        enabled: can({ energy: 8 }),
        run: () => {
            if (!s.gameStarted || s.gameOver) return;
            if (!can({ energy: 8 })) return;
            spend({ energy: 8 });
            openLifeMiniGame(s, {
                title: 'Water Regeneration Station',
                desc: 'Run the water through all purification stages:',
                icon: '💧',
                steps: [
                    { id: 's1', icon: '🕸️', label: 'Coarse Filtration', sub: 'Dust Removal' },
                    { id: 's2', icon: '🧪', label: 'Chemical Treatment', sub: 'Disinfection' },
                    { id: 's3', icon: '💎', label: 'Quality Check', sub: 'Ready for Use' }
                ],
                btnFinish: '✅ Collect Clean Water (+22 water)',
                effect: () => {
                    s.water = clamp(s.water + 22);
                    if (typeof notice === 'function') notice('Water purified: +22 units.');
                }
            });
        },
        help: 'Interactive Filtration (+22 water)'
    });

    a.push({
        id: 'filters',
        label: '🧹 Clean Air Filters (Minigame)',
        cost: { energy: 4 },
        enabled: s.life && (s.filterDirt || 0) > 0 && can({ energy: 4 }),
        run: () => {
            if (!s.gameStarted || s.gameOver) return;
            if (!can({ energy: 4 })) return;
            spend({ energy: 4 });
            openLifeMiniGame(s, {
                title: 'Ventilation Maintenance',
                desc: 'Clean 3 filter cartridges of Martian dust:',
                icon: '🧹',
                steps: [
                    { id: 's1', icon: '🌫️', label: 'Intake Filter', sub: 'Blow Out' },
                    { id: 's2', icon: '🦠', label: 'HEPA Cartridge', sub: 'Replace' },
                    { id: 's3', icon: '💨', label: 'Exhaust Valve', sub: 'Inspect' }
                ],
                btnFinish: '✅ Install Clean Filters',
                effect: () => {
                    s.filterDirt = 0;
                    if (typeof notice === 'function') notice('Filters cleaned. Ventilation system is operating at 100%.');
                }
            });
        },
        help: 'Reduces oxygen consumption during a storm'
    });

    a.push({
        id: 'condensate',
        label: '💧 Collect Condensate (Minigame)',
        cost: { energy: 3 },
        enabled: s.life && can({ energy: 3 }),
        run: () => {
            if (!s.gameStarted || s.gameOver) return;
            if (!can({ energy: 3 })) return;
            spend({ energy: 3 });
            openLifeMiniGame(s, {
                title: 'Atmospheric Condensate Collection',
                desc: 'Collect moisture from the coolers in the compartments:',
                icon: '💦',
                steps: [
                    { id: 's1', icon: '❄️', label: 'Cool the Tubes', sub: 'Condensation' },
                    { id: 's2', icon: '🪣', label: 'Drain into Tank', sub: 'Collect Drops' }
                ],
                btnFinish: '✅ Transfer to Reservoir (+7 water)',
                effect: () => {
                    s.water = clamp(s.water + 7);
                    if (typeof notice === 'function') notice('Condensate collected from recovery systems: +7 water.');
                }
            });
        },
        help: '+7 water (quick bonus)'
    });

    a.push({
        id: 'eco',
        label: '🌑 Oxygen-Saving Mode (Minigame)',
        cost: { energy: 2 },
        enabled: s.life && !s.ecoMode && can({ energy: 2 }),
        run: () => {
            if (!s.gameStarted || s.gameOver) return;
            if (!can({ energy: 2 })) return;
            spend({ energy: 2 });
            openLifeMiniGame(s, {
                title: 'Switch to Economy Mode',
                desc: 'Switch the station to energy-saving mode:',
                icon: '🌑',
                steps: [
                    { id: 's1', icon: '💡', label: 'Dim the Lights', sub: 'Living Quarters' },
                    { id: 's2', icon: '📉', label: 'Isolate Empty Compartment', sub: 'Reduce Serviced Area' }
                ],
                btnFinish: '✅ Activate Economy Mode',
                effect: () => {
                    s.ecoMode = true;
                    if (typeof notice === 'function') notice('Economy mode activated: oxygen consumption is reduced, but crew morale decreases.');
                }
            });
        },
        help: 'Reduces air consumption but lowers morale'
    });

    a.push({
        id: 'rest',
        label: '☕ Crew Rest (Minigame)',
        cost: { water: 2, food: 2 },
        enabled: (s.morale !== undefined && s.morale < 100) && can({ water: 2, food: 2 }),
        run: () => {
            if (!s.gameStarted || s.gameOver) return;
            if (!can({ water: 2, food: 2 })) return;
            spend({ water: 2, food: 2 });
            openLifeMiniGame(s, {
                title: 'Psychological Recovery',
                desc: 'Arrange a break for the astronaut crew:',
                icon: '☕',
                steps: [
                    { id: 's1', icon: '🍵', label: 'Brew Hot Tea', sub: 'Comfort' },
                    { id: 's2', icon: '🎵', label: 'Play Sounds of Earth', sub: 'Relaxation' },
                    { id: 's3', icon: '🌍', label: 'Video Call with Family', sub: 'Support' }
                ],
                btnFinish: '✅ Finish Rest (+20 morale)',
                effect: () => {
                    s.morale = clamp((s.morale || 100) + 20);
                    if (typeof notice === 'function') notice('The crew has rested and recovered psychologically (+20 morale).');
                }
            });
        },
        help: 'Restores crew morale'
    });

    return a;
}

function openLifeMiniGame(s, config) {
    if (!s.gameStarted || s.gameOver) return;
    const key=ARESScore.id('life'), wrong=new Set(), wasLife=s.life;
    let done=0,finished=false,feedback='Read the sequence before acting.';
    const overlay=document.getElementById('overlay'), modal=document.getElementById('modal');
    if(!overlay||!modal)return;
    const ordered=!['Psychological Recovery','Ventilation Maintenance','Switch to Economy Mode'].includes(config.title);
    const completed=new Set();
    function draw(){
      modal.innerHTML=`<div class="sub">LIFE SUPPORT · TRAINING PROCEDURE</div><h1>${config.icon} ${config.title}</h1><p>${config.desc}</p>
      <p>${ordered?'Sequence: '+config.steps.map(t=>t.label).join(' → '):'These preparatory actions can be performed in any order.'}</p>
      <p class="learn-muted">Simplified model, not an equipment operating procedure. Skipping a check is an error.</p>
      <div class="mini-options">${config.steps.map((st,i)=>`<button id="life_step_${st.id}" ${completed.has(i)?'disabled':''}>${st.icon} ${st.label}<small>${completed.has(i)?'✓ Completed':st.sub}</small></button>`).join('')}
      <button id="life-bypass" ${wrong.has('bypass')?'disabled':''}>Start without completing checks</button></div>
      <p role="status">${feedback}</p><button id="btnLifeFinish" ${done<config.steps.length?'disabled':''}>${config.btnFinish}</button>`;
      function error(id,reason){if(wrong.has(id)){feedback='This error has already been counted. '+reason;draw();return;}
        wrong.add(id);const e=ARESScore.award('orderError',{key:key+':wrong:'+id,reason:config.title+': '+reason,section:'Life Support'});
        ARESScore.effects('Repeat Preparation After Mistake',{energy:-2});feedback=`${e.delta} points; −2 energy. ${reason}`;draw();}
      config.steps.forEach((st,i)=>document.getElementById('life_step_'+st.id).onclick=()=>{
        if(finished||s.gameOver||completed.has(i))return;
        if(ordered&&i!==done){error(st.id,'First: '+config.steps[done].label+'. The next operation requires the previous one to be completed.');return;}
        completed.add(i);done++;feedback='Stage completed: '+st.label+'.';draw();
      });
      document.getElementById('life-bypass').onclick=()=>{if(!finished&&!s.gameOver)error('bypass','Skipped checks leave a risk of an undetected fault. Complete preparation and verification.');};
      document.getElementById('btnLifeFinish').onclick=()=>{
        if(done!==config.steps.length||finished||s.gameOver)return;finished=true;
        ARESScore.effect(config.title,config.effect);
        if(!wasLife&&s.life)ARESScore.award('repair',{key:'repair:life',reason:'Oxygen module restored',section:'Life Support'});
        else ARESScore.award(wrong.size?'procedureFixed':'procedure',{key:key+':done',group:'life:'+config.title,reason:config.title+(wrong.size?' — after correction':' — error-free'),section:'Life Support'});
        overlay.style.display='none';nextTurn();
      };
    }
    draw();overlay.style.display='flex';
}

function updateLifeTurn(s) {
    if (s.morale === undefined) s.morale = 100;
    if (s.filterDirt === undefined) s.filterDirt = 0;

    if (s.storm > 0) {
        s.filterDirt = clamp(s.filterDirt + 25);
    } else {
        s.filterDirt = clamp(s.filterDirt + 5);
    }

    let filterPenalty = s.filterDirt > 50 ? 1.5 : 1;
    let baseConsumption = ((s.life && s.energy > 1) ? 0.5 : 5) * filterPenalty;

    if (s.ecoMode) {
        baseConsumption = Math.max(0.2, baseConsumption * 0.5);
        s.morale = clamp(s.morale - 15);
        s.ecoMode = false;
    } else if (s.oxygen < 30 || s.water < 20) {
        s.morale = clamp(s.morale - 8);
    } else {
        s.morale = clamp(s.morale + 2);
    }

    s.oxygen = clamp(s.oxygen - baseConsumption);
    s.water = clamp(s.water - 3);

    if (s.oxygen < 15 && s.energy >= 15 && !s.emergencyVentUsed) {
        s.energy = clamp(s.energy - 15);
        s.oxygen = clamp(s.oxygen + 20);
        s.emergencyVentUsed = true;
        if (typeof notice === 'function') {
            notice('🚨 AUTO-VENTILATION: Critical oxygen level! Emergency release activated (+20 oxygen, -15 energy).');
        }
    }

    if (s.morale < 25) {
        s.health = clamp(s.health - 4);
        if (typeof notice === 'function') {
            notice('⚠️ Low crew morale! Fatigue and stress reduce health.');
        }
    }

    if (s.oxygen < 18 || s.water < 12 || s.food < 10 || s.energy < 2) {
        s.health = clamp(s.health - 11);
    } else if (s.life && s.health < 100 && s.morale >= 50) {
        s.health = clamp(s.health + 2);
    }
}
