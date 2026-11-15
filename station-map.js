/* Game component notes. */
(()=>{
 const rooms=[
 ['power','01','Power Systems','⚡','Restore power and charge the batteries.','powerRestored'],
 ['life','02','Life Support','◉','Start the oxygen module and clean the water and filters.','oxygenSystemRestored'],
 ['farm','03','Greenhouse','♧','Restore the greenhouse and grow food for the crew.','greenhouseRestored'],
 ['mine','04','Mining','⬡','Restore the mining unit and extract ice and regolith.','miningRestored'],
 ['command','00','Command Center','⌖','Restore communications and transmit a distress signal.','radioRestored'],
 ['shield','05','Shield Compartment','◇','Restore the shield and repair the hull.','protectionRestored'],
 ['emergency','06','Emergency Center','△','Read the cause of the emergency and choose the appropriate response.',null],
 ['expeditions','07','Expedition Airlock','↗','Choose an exploration mission. New routes unlock as the game progresses.',null]
 ];
 let selected='power',target=null,dialog;
 const game=()=>window.ARESAdventure?.preview()||window.ARESGame.getState();
 const roomStatus=r=>window.ARESAdventure?.status(r[0])||{kind:r[5]&&game()[r[5]]?"ready":"offline",text:r[5]?(game()[r[5]]?"● Online":"○ Requires repair"):"Navigation"};
 function open(){
  if(game().gameOver){window.ARESLearning.journal();return;}
  document.getElementById('overlay').style.display='none';
  if(!dialog.open)dialog.showModal();draw();
 }
 function draw(){
  const s=game(),room=rooms.find(r=>r[0]===selected),ready=rooms.filter(r=>r[5]&&s[r[5]]).length;
  dialog.innerHTML=`<header class="deck-header"><div><span class="deck-eyebrow">ARES–7 / STATION PLAN</span><h1>Choose Your Mission</h1><p>Select a compartment → read the task → start the activity.</p></div><button id="deck-close" ${s.gameStarted?'':'hidden'} aria-label="Close station plan">✕</button></header>
  ${!s.gameStarted&&window.ARESAdventure?`<section class="scenario-picker" aria-label="Scenario selection"><div class="scenario-options">${Object.entries(ARESAdventureCore.scenarios).map(([id,c])=>`<button data-scenario="${id}" aria-pressed="${ARESAdventure.selected===id}"><small>${c.tag}</small><strong>${c.name}</strong></button>`).join('')}</div><p>${ARESAdventureCore.scenarios[ARESAdventure.selected].description}</p><label><input type="checkbox" id="guided-intro" ${ARESAdventure.guided?'checked':''}> Guided introduction: review supplies → first repair → consequences</label><p class="deck-hint">The scenario is locked after starting. Training repair is simplified; the rest of the game uses standard rules.</p></section>`:''}
  <div class="deck-meta"><span>DAY ${s.day} / 20</span><span>${ready} / 6 SYSTEMS RESTORED</span><span>${s.signalSent?'SOS TRANSMITTED':'COMMUNICATION WITH EARTH LOST'}</span></div>
  <div class="deck-content"><section class="deck-plan" aria-label="Station compartment layout"><div class="deck-grid-lines" aria-hidden="true"></div><div class="deck-spine ${s.powerRestored?'flowing':''}" aria-hidden="true"></div>
  ${rooms.map(r=>`<button class="deck-room room-${r[0]} ${r[0]===selected?'selected':''} ${r[5]&&s[r[5]]?'repaired':''} status-${roomStatus(r).kind}" data-deck-room="${r[0]}" aria-pressed="${r[0]===selected}"><span class="deck-code">SECTOR ${r[1]}</span><b class="deck-icon" aria-hidden="true">${r[3]}</b><strong>${r[2]}</strong><small>${roomStatus(r).text}</small></button>`).join('')}
  <span class="deck-caption">TOP VIEW · ILLUSTRATIVE DIAGRAM</span></section>
  <aside class="deck-brief"><div class="live-readings"><span>ENERGY <b>${Math.round(s.energy)}</b></span><span>OXYGEN <b>${Math.round(s.oxygen)}</b></span><span>HULL <b>${Math.round(s.protection)}</b></span></div><p class="deck-hint">● Online · ○ Offline · △ Temporary · ! Critical · Ⅱ Pause</p><span class="deck-eyebrow">TASK / ${room[1]}</span><h2>${room[2]}</h2><p>${room[4]}</p>
  ${selected==='expeditions'?`<div class="deck-missions">${Object.entries(missionData).map(([id,m])=>`<button data-deck-mission="${id}" class="${target===id?'chosen':''}" ${s.day<m.unlockDay?'disabled':''}>${m.icon} ${m.name}<small>${s.day<m.unlockDay?'Available from Day '+m.unlockDay:window.ARESMissions.completed.includes(id)?'✓ Completed':'Mission available'}</small></button>`).join('')}</div>`:`<div class="deck-task"><b>${room[5]&&s[room[5]]?'Next step':'Your task'}</b><p>${room[5]&&s[room[5]]?'The system is operational. Check supplies and choose a maintenance action.':room[4]}</p></div><p class="deck-hint">Entering a compartment costs no days or resources. The cost of each action is shown before it is performed.</p>`}
  ${s.adventure?`<div class="scenario-forecast"><b>Event forecast</b>${ARESAdventureCore.scenarios[s.adventure.scenario].events.filter(e=>e.day>s.day).slice(0,2).map(e=>`<p>Day ${e.day}: ${e.text}${e.guard?' A restored system will reduce losses.':''}</p>`).join('')||'<p>No more scheduled events. Monitor your supplies.</p>'}</div>`:''}
  <button id="deck-launch" class="deck-launch" ${selected==='expeditions'&&!target?'disabled':''}>${s.gameStarted?'Go to mission':'Start game in this compartment'} →</button>
  <button id="deck-settings" class="deck-secondary">${s.gameStarted?'Scoring rules':'Configure scoring before start'}</button><p class="deck-hint">Goal: send an SOS and keep the crew alive through Day 20.</p></aside></div>`;
  dialog.querySelectorAll('[data-scenario]').forEach(b=>b.onclick=()=>window.ARESAdventure.chooseScenario(b.dataset.scenario));
  const guided=document.getElementById('guided-intro');if(guided)guided.onchange=()=>window.ARESAdventure.setGuided(guided.checked);
  dialog.querySelectorAll('[data-deck-room]').forEach(b=>b.onclick=()=>{selected=b.dataset.deckRoom;target=null;draw();});
  dialog.querySelectorAll('[data-deck-mission]').forEach(b=>b.onclick=()=>{target=b.dataset.deckMission;draw();});
  document.getElementById('deck-settings').onclick=()=>s.gameStarted?window.ARESLearning.rubric():window.ARESLearning.settings();
  document.getElementById('deck-close').onclick=()=>dialog.close();
  document.getElementById('deck-launch').onclick=()=>{
   if(selected==='expeditions'&&(!target||game().day<missionData[target].unlockDay))return;
   dialog.close();if(!s.gameStarted)window.ARESGame.start();
   const missionRoot=document.getElementById('mission-root');missionRoot.style.display='none';
   if(selected==='expeditions'){window.ARESGame.openSpaceMap();window.ARESMissions.start({id:target});}
   else{window.ARESGame.closeSpaceMap();window.ARESGame.selectRoom(selected);}
  };
 }
 document.addEventListener('DOMContentLoaded',()=>{
  dialog=document.createElement('dialog');dialog.id='station-dialog';document.body.append(dialog);
  dialog.addEventListener('cancel',e=>{if(!game().gameStarted)e.preventDefault();});
  const nav=document.querySelector('.learning-nav'),b=document.createElement('button');b.id='open-station-plan';b.textContent='⌖ Station Plan';b.onclick=open;nav.prepend(b);
  const restart=window.ARESGame.restart;window.ARESGame.restart=function(){restart.call(this);selected='power';target=null;open();};
  window.ARESStationMap={open,refresh(){if(dialog.open)draw();}};open();
 });
})();
