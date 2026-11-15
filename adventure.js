(() => {
  'use strict';
  const G=window.ARESGame,S=window.ARESScore,C=window.ARESAdventureCore;
  const state=()=>G.getState();
  let selected='standard',guided=true,decisionDialog=null;
  const labels={energy:'Energy',oxygen:'Oxygen',water:'Water',food:'Food',materials:'Materials',protection:'Hull',morale:'Morale'};
  const deltaText=effects=>Object.entries(effects).map(([k,v])=>`${labels[k]||k} ${v>0?'+':''}${v}`).join(' · ');
  const choices={
    farmPause:{room:'farm',title:'Pause Greenhouse',cost:{},effects:{},enabled:s=>s.greenhouseRestored&&!s.adventure.farmPaused,
      consequence:'While the greenhouse is paused, save up to 2 energy per turn (maximum 100) and avoid the 2-water growing cost; food decreases by 2 instead of increasing by 4. Switching costs one day.',apply:s=>s.adventure.farmPaused=true},
    farmResume:{room:'farm',title:'Resume Greenhouse',cost:{energy:2},effects:{},enabled:s=>s.greenhouseRestored&&s.adventure.farmPaused,
      consequence:'The normal +4 food and −2 water per turn resume when energy is available. The +2 energy saving ends. Switching costs one day.',apply:s=>s.adventure.farmPaused=false},
    salvage:{room:'command',title:'Dismantle Backup Airlock',cost:{},effects:{materials:5,protection:-12},enabled:s=>!s.adventure.salvaged&&s.protection>12,
      consequence:'One-time: +5 materials but −12 protection. This decision is irreversible during this session. Regular daily costs still apply.',apply:s=>s.adventure.salvaged=true},
    supplies:{room:'command',title:'Convert Food Reserves to Water',cost:{food:8,energy:2},effects:{water:12,morale:-4},enabled:s=>s.water<100,
      consequence:'Gain 12 water at the cost of 8 food, 2 energy, and 4 morale. The meter is capped at 100. Regular daily costs still apply.'},
    brace:{room:'shield',title:'Reinforce Hull with Spare Parts',cost:{materials:4,energy:3},effects:{protection:18},enabled:s=>s.protection<100,
      consequence:'Gain up to 18 protection, leaving fewer spare parts for other repairs. This reinforces the hull but does not activate an offline shield. Regular daily costs still apply.'}
  };
  function chooseScenario(id) {
    if(state().gameStarted||!C.scenarios[id])return false;
    selected=id;window.ARESStationMap?.refresh();return true;
  }
  function preview(){return state().gameStarted?state():{...state(),...C.scenarios[selected].start,adventure:C.create(selected,guided)};}
  function record() {
    const a=state().adventure;if(!a)return;
    a.history.push({day:state().day,...S.snapshot()});if(a.history.length>21)a.history.shift();
  }
  function consequence(id) {
    const a=state().adventure;if(!a)return '';
    const link=C.links(a,id);
    if(['ice','regolith'].includes(id))return `Preparation: ${10+link.extraCuts} drilling actions, ${3+link.extraScans} scans. Calibration grants +2 drilling actions; flight data grants +1 scan. The bonus is consumed only at launch.`;
    if(id==='flight')return link.armor?'A prepared shield absorbs 2 protection damage from the first collision. Collisions and points still count. One charge is consumed at launch.':'A precise shield repair prepares protection for the next flight. A successful flight grants +1 scan for the next mining run.';
    if(['mineRepair','lifeRepair','shieldRepair','hullRepair'].includes(id))return 'Quality of 80% or higher provides a reliable repair. Below 80%, the repair is temporary: the system will need repairs again after 3 day changes. The deadline appears on the map.';
    return '';
  }
  function consume(id){const a=state().adventure;if(!a)return;const l=C.links(a,id);if(l.extraCuts)a.calibration--;if(l.extraScans)a.surveys--;if(l.armor)a.flightArmor--;}
  function miniResult(id,result) {
    const s=state(),a=s.adventure;if(!a)return '';
    a.miniHistory.push({day:s.day,id,won:result.won,quality:result.quality||0});
    let message='';
    const room={mineRepair:'mine',lifeRepair:'life',shieldRepair:'shield',hullRepair:'shield'}[id];
    if(result.won&&room){
      if(result.quality>=.8){delete a.temporary[room];message='Reliable repair: no repeat failure is scheduled.';
        if(room==='mine'){a.calibration=2;message+=' The next 2 mining runs receive +2 drilling actions.';}
        if(room==='shield'){a.flightArmor=2;message+=' The next 2 flights will be protected from their first damage event.';}
      }else{a.temporary[room]={expires:s.day+3};message=`Temporary repair. Failure will recur at the start of Day ${s.day+3}. Secure it in this compartment for 3 materials and 2 energy, or repair the system again after failure.`;}
    }
    if(id==='flight'&&result.won){a.surveys=Math.min(3,a.surveys+1);message='Deposit map acquired: +1 scan in the next mining run (up to 3 maps in reserve).';}
    if(id==='mineRepair'&&result.won&&a.tutorial>=0&&a.tutorial<3){a.tutorial=3;a.tutorialMessage='You restored the drill. The cost was deducted and the station survived another day. Compare supplies with their starting values.';}
    if(message){a.lastConsequence=message;G.logEvent(message);}
    return message;
  }
  function beforeDay(){
    const s=state(),a=s.adventure;if(!a)return;
    for(const [room,repair] of Object.entries(a.temporary))if(s.day>=repair.expires){
      delete a.temporary[room];s[C.roomFlags[room]]=false;
      if(room==='shield')S.effects('Temporary Shield Failure Recurrence',{protection:-8});
      a.lastConsequence='The temporary repair has expired: '+({mine:'mining drill',life:'oxygen module',shield:'shield'}[room])+'. Restoration required.';G.logEvent(a.lastConsequence);
    }
    if(a.farmPaused&&s.greenhouseRestored)S.effects('Paused Greenhouse Savings',{energy:2});
  }
  function events(){const s=state();if(!s.adventure)return;
    for(const e of C.events(s)){s.adventure.eventsSeen.push(e.day);if(typeof e.storm==='boolean')s.stormActive=e.storm;S.effects(e.text,e.effects);G.logEvent(e.text+(e.protected?' The prepared system reduced losses.':'')+' '+deltaText(e.effects));}
    if(s.day===20)G.logEvent('Final day. The mission will end after the next management action.');
  }
  function commit(id,day){
    const s=state(),a=s.adventure,c=choices[id];
    if(!a||!c||!s.gameStarted||s.gameOver||s.day!==day||!c.enabled(s)||!can(c.cost))return false;
    if(!spend(c.cost))return false;
    S.effects(c.title,c.effects);c.apply?.(s);a.decisions.push({day,id,title:c.title,cost:{...c.cost},effects:{...c.effects},explanation:c.consequence});a.lastConsequence=c.title+'. '+c.consequence;G.logEvent(a.lastConsequence);G.nextDay();return true;
  }
  function openDecision(id){
    const s=state(),c=choices[id];if(!c||!s.gameStarted||s.gameOver||window.ARESMinigames.busy)return;
    const day=s.day;
    if(!decisionDialog){decisionDialog=document.createElement('dialog');decisionDialog.id='decision-dialog';decisionDialog.className='adventure-dialog';document.body.append(decisionDialog);}
    decisionDialog.innerHTML=`<span class="deck-eyebrow">TEAM DECISION</span><h2>${c.title}</h2><p>${c.consequence}</p><div class="decision-effects">Cost: ${formatCost(c.cost)||'no initial cost'}<br>Immediate changes: ${deltaText(c.effects)||'operating mode change'}</div><p>This decision awards no separate points. Its consequences affect survival. Confirming costs 1 day.</p><button id="decision-commit">Accept Consequences and Proceed</button><button id="decision-cancel">Return Without Changes</button><p id="decision-error" role="status"></p>`;
    document.getElementById('decision-commit').onclick=()=>{if(commit(id,day))decisionDialog.close();else document.getElementById('decision-error').textContent='The state has changed or resources are insufficient. Close the window and review supplies.';};
    document.getElementById('decision-cancel').onclick=()=>decisionDialog.close();decisionDialog.showModal();
  }
  function reinforce(room){
    const s=state(),a=s.adventure;if(!a?.temporary[room]||!s.gameStarted||s.gameOver||!can({materials:3,energy:2}))return;
    if(!spend({materials:3,energy:2}))return;
    delete a.temporary[room];a.decisions.push({day:s.day,id:'reinforce:'+room,title:'Secure Temporary Repair',cost:{materials:3,energy:2}});G.logEvent('Temporary repair secured: −3 materials, −2 energy; recurring failure cancelled.');G.nextDay();
  }
  const oldActions=G.getActions;
  G.getActions=function(){const base=oldActions.call(this),s=state();if(!s.adventure)return base;
    if(s.adventure.farmPaused&&s.currentRoom==='farm')for(const action of base)if(/Grow/i.test(action.label)){action.enabled=false;action.help='The greenhouse is paused. Resume it before growing crops.';}
    for(const [id,c]of Object.entries(choices))if(c.room===s.currentRoom)base.push({id:'decision:'+id,label:'⇄ '+c.title,cost:c.cost,enabled:c.enabled(s)&&can(c.cost),help:c.consequence,run:()=>openDecision(id)});
    if(s.adventure.temporary[s.currentRoom])base.push({id:'reinforce',label:'Secure Temporary Repair',cost:{materials:3,energy:2},enabled:can({materials:3,energy:2}),help:'Prevents repeat failure. Costs one day and spare parts; no additional points.',run:()=>reinforce(s.currentRoom)});
    return base;
  };
  function tutorialAnswer(resource){const a=state().adventure;if(!a||a.tutorial!==0)return;const fields=['energy','oxygen','water'],min=Math.min(...fields.map(k=>state()[k]));if(state()[resource]===min){a.tutorial=1;a.tutorialMessage='Correct. Equally low supplies have equal priority.';}else a.tutorialMessage='Compare the three values and choose the lowest supply. This is a tutorial; there is no penalty.';render();}
  function render(){
    const s=state(),a=s.adventure,el=document.getElementById('adventure-panel');if(!el)return;
    if(!a||!s.gameStarted||s.gameOver){el.hidden=true;return;}el.hidden=false;
    let tutorial='';
    if(a.tutorial>=0){const step=a.tutorial;
      tutorial=`<section class="tutorial-card"><span class="deck-eyebrow">GUIDED INTRODUCTION · ${Math.min(step+1,4)}/4</span><h3>${['Assess Supplies','Find the Damaged Module','Perform the First Repair','Review the Consequences'][step]}</h3><p>${a.tutorialMessage||''}</p>`;
      if(step===0)tutorial+=`<p>Which of these supplies is lowest? If values are equal, choose either one.</p>${['energy','oxygen','water'].map(k=>`<button data-tutorial-resource="${k}">${labels[k]}: ${s[k]}</button>`).join('')}`;
      if(step===1)tutorial+='<p>The map marks the drill as damaged. Open the mining compartment.</p><button id="tutorial-mine">Go to Mining →</button>';
      if(step===2)tutorial+='<p>Select “Restore Mining Module.” In the training circuit, rotate tiles 11 and 12 to connect the path, then send a test pulse. This is a real action: −2 materials, −4 energy, and 1 day.</p><button id="tutorial-mine">Go to Repair Action →</button>';
      if(step===3)tutorial+=`<p>Before: energy ${a.history[0]?.energy}, materials ${a.history[0]?.materials}. Now: energy ${s.energy}, materials ${s.materials}. Daily costs are calculated separately from repairs. The next decision is yours.</p><button id="tutorial-done">Understood. I’ll Take Control</button><button id="tutorial-map">View Live Map</button>`;
      tutorial+='<button id="tutorial-skip" class="subtle">Finish Tutorial</button></section>';
    }
    const temporary=Object.entries(a.temporary).map(([room,r])=>`${G.rooms[room].name}: until Day ${r.expires}`).join(' · ');
    el.innerHTML=`${tutorial}${a.lastConsequence?`<p class="adventure-consequence" role="status">${a.lastConsequence}</p>`:''}<div class="adventure-status"><span>${C.scenarios[a.scenario].name}</span><span>Calibration: ${a.calibration}</span><span>Deposit Maps: ${a.surveys}</span><span>Shield Charges: ${a.flightArmor}</span>${a.farmPaused?'<span>Ⅱ Greenhouse Paused</span>':''}</div>${temporary?`<p class="temporary-warning">△ Temporary Repairs: ${temporary}. Secure them in the appropriate compartment.</p>`:''}`;
    el.querySelectorAll('[data-tutorial-resource]').forEach(b=>b.onclick=()=>tutorialAnswer(b.dataset.tutorialResource));
    const bind=(id,fn)=>{const b=document.getElementById(id);if(b)b.onclick=fn;};
    bind('tutorial-mine',()=>{if(a.tutorial===1)a.tutorial=2;G.selectRoom('mine');});
    for(const id of ['tutorial-done','tutorial-skip'])bind(id,()=>{a.tutorial=-1;G.logEvent('Tutorial completed.');render();});
    bind('tutorial-map',()=>window.ARESStationMap.open());
    window.ARESStationMap?.refresh();
  }
  const start=G.start;G.start=function(){if(!state().gameStarted&&!state().gameOver){Object.assign(state(),C.scenarios[selected].start);state().adventure=C.create(selected,guided);record();}const wasStarted=state().gameStarted;start.call(this);if(!wasStarted&&state().adventure)G.logEvent('Scenario: '+C.scenarios[state().adventure.scenario].name);};
  const restart=G.restart;G.restart=function(){decisionDialog?.close();state().adventure=null;restart.call(this);render();};
  const oldRender=G.render;G.render=function(){oldRender.call(this);render();};
  const oldSelect=G.selectRoom;G.selectRoom=function(room){if(room==='mine'&&state().adventure?.tutorial===1)state().adventure.tutorial=2;oldSelect.call(this,room);};
  const oldReason=G.actionBlockReason;G.actionBlockReason=function(action){if(action.id?.startsWith('decision:'))return 'Decision unavailable: check supplies, greenhouse status, or whether the backup airlock has already been dismantled.';if(state().adventure?.farmPaused&&/Grow/i.test(action.label))return 'The greenhouse is paused. Resume it first.';return oldReason.call(this,action);};
  const report=S.report;S.report=function(){return {...report.call(this),adventure:state().adventure?JSON.parse(JSON.stringify(state().adventure)):null};};
  window.ARESAdventure={chooseScenario,preview,events,beforeDay,record,miniResult,consume,consequence,render,commit,
    get selected(){return selected;},get guided(){return guided;},setGuided(value){if(!state().gameStarted)guided=!!value;},
    links:id=>state().adventure?C.links(state().adventure,id):{},
    guidedRepair:id=>id==='mineRepair'&&state().adventure?.tutorial===2,
    status:room=>C.status(preview(),room,window.ARESProtection?.status?.().active)};
  document.addEventListener('DOMContentLoaded',()=>{
    const panel=document.createElement('section');panel.id='adventure-panel';panel.hidden=true;
    document.querySelector('.main-screen').prepend(panel);render();
  });
})();
