function getFarmChoices(s) {
    const a = [];

    a.push({
        label: '🌱 Restore Greenhouse',
        cost: { parts: 1, water: 8 },
        enabled: !s.farm,
        run: () => act('Greenhouse is operational. You can now grow crops.', { parts: 1, water: 8 }, () => {
            s.farm = true;
            ARESScore.award("repair", {key:"repair:farm",reason:"Greenhouse restored"});
            s.food = clamp(s.food + 8);
        }),
        help: 'Unlocks the growing minigame'
    });

    a.push({
        label: '🥔 Grow Potatoes (Minigame)',
        cost: { water: 3, energy: 2 },
        enabled: s.farm && can({ water: 3, energy: 2 }),
        run: () => {
            if (!s.gameStarted || s.gameOver) return;
            if (!can({ water: 3, energy: 2 })) return;
            spend({ water: 3, energy: 2 });
            openPlantMiniGame(s, {
                name: 'Martian Potatoes',
                stages: ['🌱', '🌿', '🪴', '🥔', '🥔'],
                rewardFood: 15
            });
        },
        help: 'Harvest up to +15 food; mistakes reduce the harvest and score'
    });

    a.push({
        label: '🍅 Grow Tomatoes (Minigame)',
        cost: { water: 2, energy: 2 },
        enabled: s.farm && can({ water: 2, energy: 2 }),
        run: () => {
            if (!s.gameStarted || s.gameOver) return;
            if (!can({ water: 2, energy: 2 })) return;
            spend({ water: 2, energy: 2 });
            openPlantMiniGame(s, {
                name: 'Hydroponic Tomatoes',
                stages: ['🌱', '🌿', '🌼', '🍅', '🍅'],
                rewardFood: 11
            });
        },
        help: 'Harvest up to +11 food; points follow the current scoring rubric'
    });

    a.push({
        label: '💊 Take Vitamin Supplement',
        cost: { energy: 2 },
        enabled: (s.vitamins || 0) > 0 && s.health < 100 && can({ energy: 2 }),
        run: () => {
            if (!s.gameStarted || s.gameOver) return;
            if (!can({ energy: 2 })) return;
            spend({ energy: 2 });
            openConsumeModal(s, {
                title: 'Vitamin Complex',
                desc: 'Illustrative nutritional support: +10 to the in-game health meter. This is not medical advice.',
                icon: '💊',
                effect: () => {
                    s.vitamins = (s.vitamins || 0) - 1;
                    s.health = clamp(s.health + 10);
                    s.vitaminHunger = 0;
                    if (typeof notice === 'function') {
                        notice('The crew took vitamins: the in-game health meter increased (+10 health).');
                    }
                }
            });
        },
        help: 'Uses 1 vitamin, +10 health'
    });

    a.push({
        label: '🧪 Synthesize Vitamins from Algae',
        cost: { water: 5, energy: 6 },
        enabled: s.farm && (s.vitamins || 0) < 5 && can({ water: 5, energy: 6 }),
        run: () => act('A new set of vitamins has been synthesized (+2).', { water: 5, energy: 6 }, () => {
            s.vitamins = Math.min(5, (s.vitamins || 0) + 2);
        }),
        help: 'Creates vitamins (max. 5)'
    });

    a.push({
        label: '🥫 Unpack Emergency Rations',
        cost: { parts: 1 },
        enabled: can({ parts: 1 }),
        run: () => {
            if (!s.gameStarted || s.gameOver) return;
            if (!can({ parts: 1 })) return;
            spend({ parts: 1 });
            openConsumeModal(s, {
                title: 'Emergency Space Rations',
                desc: 'High-calorie concentrated food to restore energy.',
                icon: '🍱',
                effect: () => {
                    s.food = clamp(s.food + 22);
                    if (typeof notice === 'function') {
                        notice('Additional food rations found (+22 food).');
                    }
                }
            });
        },
        help: '+22 food'
    });

    return a;
}

function openConsumeModal(s, item) {
    const overlay = document.getElementById('overlay');
    const modal = document.getElementById('modal');

    if (!overlay || !modal) {
        ARESScore.effect(item.title, item.effect);
        if (typeof nextTurn === 'function') nextTurn();
        return;
    }

    modal.innerHTML = `
        <div class="sub">GREENHOUSE // SUPPLIES</div>
        <h1 style="font-size:24px; margin-bottom:6px">${item.title}</h1>
        <p style="margin-bottom:14px">${item.desc}</p>

        <div style="background:#0c1724; border:1px solid #3c5166; border-radius:14px; padding:28px; text-align:center; margin-bottom:16px">
            <div style="font-size:72px; line-height:1.2">${item.icon}</div>
        </div>

        <button id="btnEat" style="width:100%; text-align:center; background:#3d876b; border-color:#72d7a4">
            🍽️ Eat
        </button>
    `;

    document.getElementById('btnEat').onclick = () => {
        overlay.style.display = 'none';
        ARESScore.effect(item.title, item.effect);
        if (typeof nextTurn === 'function') {
            nextTurn();
        } else if (typeof render === 'function') {
            render();
        }
    };

    overlay.style.display = 'flex';
}

function openPlantMiniGame(s, crop) {
 if(!s.gameStarted||s.gameOver)return;
 const key=ARESScore.id('crop'),care=new Set(),wrong=new Set();let finished=false,feedback='Water, minerals, light, and a plant health check are required.';
 const overlay=document.getElementById('overlay'),modal=document.getElementById('modal');if(!overlay||!modal)return;
 const options=[['water','Moderate Watering','Plants need water, but excess watering restricts air access to their roots.'],['fertilizer','Measured Nutrients','Mineral nutrients support growth.'],['sun','Turn On Grow Lights','Light is essential for photosynthesis.'],['pests','Inspect and Protect the Plant','Inspection helps detect damage early.'],['flood','Flood the Roots','Overwatering disrupts the balance of water and air around the roots. Return to moderate watering.'],['dark','Turn Off the Lights for the Entire Cycle','Without light, photosynthesis is limited. Restore lighting.']];
 function draw(){const yieldFood=Math.max(1,crop.rewardFood-5*wrong.size);
 modal.innerHTML=`<div class="sub">GREENHOUSE · DECISIONS AND CONSEQUENCES</div><h1>${crop.name}</h1><div style="font-size:64px;text-align:center">${crop.stages[care.size]}</div><p>Prepare 4 growth conditions. Some suggested actions will harm the plant. In this model, each mistake reduces the harvest by 5 units.</p><div class="mini-options">${options.map(([id,label])=>`<button id="care-${id}" ${care.has(id)||wrong.has(id)?'disabled':''}>${label}</button>`).join('')}</div><p role="status">${feedback}</p><p>Expected harvest: ${yieldFood}; completed ${care.size}/4 conditions. This is an accelerated training model of plant growth.</p><button id="btnHarvest" ${care.size===4?'':'disabled'}>Harvest Crops</button>`;
 options.forEach(([id,label,why],i)=>document.getElementById('care-'+id).onclick=()=>{
 if(finished||s.gameOver||care.has(id)||wrong.has(id))return;
 if(i<4){care.add(id);feedback=why;}else{wrong.add(id);const e=ARESScore.award('farmError',{key:key+':'+id,reason:crop.name+': '+why,section:'Greenhouse'});if(id==='flood')ARESScore.effects('Overwatering',{water:-3});feedback=`${e.delta} points; harvest −5${id==='flood'?'; water −3':''}. ${why}`;}draw();});
 document.getElementById('btnHarvest').onclick=()=>{if(finished||care.size!==4||s.gameOver)return;finished=true;ARESScore.effects('Harvest: '+crop.name,{food:yieldFood});ARESScore.award(wrong.size?'harvestFixed':'harvest',{key:key+':done',group:'crop:'+crop.name,reason:crop.name+(wrong.size?' — harvest after mistakes':' — correct care'),section:'Greenhouse'});overlay.style.display='none';nextTurn();};
 }
 draw();overlay.style.display='flex';
}

function updateFarmTurn(s) {
    if (s.farm && !s.adventure?.farmPaused) {
        if (s.energy > 0) {
            s.water = clamp(s.water - 2);
            s.food = clamp(s.food + 4);
        } else {
            s.food = clamp(s.food - 2);
        }
    } else {
        s.food = clamp(s.food - 2);
    }

    if (s.vitaminHunger === undefined) {
        s.vitaminHunger = 0;
    }

    s.vitaminHunger++;

    if (s.vitaminHunger >= 5) {
        s.health = clamp(s.health - 5);
        if (typeof notice === 'function') {
            notice('⚠️ Warning: the illustrative food support reserve is depleted. Health is decreasing.');
        }
        s.vitaminHunger = 3;
    }
}