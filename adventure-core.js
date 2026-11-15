(function (root) {
  'use strict';
  const scenarios = {
    standard: {
      name: 'First Signal', tag: 'BASIC',
      description: 'All main modules are offline, but supplies are full. Restore the station and transmit an SOS.',
      start: {},
      events: [
        {day:5,text:'Dust storm: power generation drops and the hull takes damage.',storm:true,effects:{energy:-8,protection:-5}},
        {day:8,text:'The storm has ended.',storm:false,effects:{}},
        {day:9,text:'Leak in the water reservoir.',effects:{water:-12}},
        {day:10,text:'A food container has been found.',effects:{food:5}},
        {day:12,text:'Second dust storm.',storm:true,effects:{energy:-8,protection:-5}},
        {day:15,text:'The storm has passed; a power cable is damaged.',storm:false,effects:{energy:-10}}
      ]
    },
    impact: {
      name: 'After the Impact', tag: 'HULL',
      description: 'A fragment damaged the hull. Protection 45, materials 14. Power is working: prioritize airtightness.',
      start:{protection:45,health:85,energy:80,materials:14,powerRestored:true},
      events:[
        {day:4,text:'A new wave of debris is approaching the station.',effects:{protection:-12},guard:'protectionRestored',mitigated:{protection:-3}},
        {day:8,text:'Emergency repair parts depot unlocked.',effects:{materials:4}},
        {day:12,text:'Outer circuit depressurization.',effects:{oxygen:-12},guard:'protectionRestored',mitigated:{oxygen:-3}},
        {day:16,text:'Thermal stress on the hull.',effects:{protection:-10},guard:'protectionRestored',mitigated:{protection:-2}}
      ]
    },
    blackout: {
      name: 'Last Charge', tag: 'ENERGY',
      description: 'Only 45 energy remains. The oxygen module and greenhouse are running. Choose what to power and restore the power module.',
      start:{energy:45,oxygen:85,water:75,food:70,oxygenSystemRestored:true,greenhouseRestored:true},
      events:[
        {day:4,text:'Voltage drop on the main bus.',effects:{energy:-12},guard:'powerRestored',mitigated:{energy:-3}},
        {day:8,text:'Solar panels temporarily receive no sunlight.',storm:true,effects:{energy:-6}},
        {day:11,text:'The panels are receiving sunlight again.',storm:false,effects:{energy:8}},
        {day:15,text:'Backup battery overheating.',effects:{energy:-10},guard:'powerRestored',mitigated:{energy:-2}}
      ]
    },
    air: {
      name: 'Right to Breathe', tag: 'LIFE SUPPORT',
      description: 'Oxygen 48, water 55. The power module is operational. Restore the air circuit and monitor water.',
      start:{oxygen:48,water:55,energy:85,powerRestored:true,filterDirt:35},
      events:[
        {day:4,text:'Ventilation load is increasing.',effects:{oxygen:-10},guard:'oxygenSystemRestored',mitigated:{oxygen:-2}},
        {day:7,text:'A reserve of clean water has been found.',effects:{water:12}},
        {day:11,text:'Contamination in the external air circuit.',effects:{oxygen:-12},guard:'oxygenSystemRestored',mitigated:{oxygen:-3}},
        {day:16,text:'Pipeline leak.',effects:{water:-8}}
      ]
    }
  };
  const roomFlags = {power:'powerRestored',life:'oxygenSystemRestored',farm:'greenhouseRestored',mine:'miningRestored',shield:'protectionRestored',command:'radioRestored'};
  function create(id='standard',tutorial=true) {
    if (!scenarios[id]) throw Error('Unknown scenario');
    return {scenario:id,guidedStart:!!tutorial,tutorial:tutorial?0:-1,tutorialMessage:'',lastConsequence:'',farmPaused:false,salvaged:false,
      temporary:{},calibration:0,surveys:0,flightArmor:0,decisions:[],history:[],eventsSeen:[],miniHistory:[]};
  }
  function status(s,room,emergency=false) {
    const a=s.adventure;
    if(room==='emergency')return emergency?{kind:'critical',text:'! Active Emergency'}:{kind:'ready',text:'✓ On Standby'};
    if(room==='expeditions')return {kind:'ready',text:'↗ Available Routes'};
    if((room==='life'&&(s.oxygen<25||s.water<20))||(room==='power'&&s.energy<20)||(room==='shield'&&s.protection<35))return {kind:'critical',text:'! Critical Supply'};
    if(!s[roomFlags[room]])return {kind:'offline',text:'○ Requires repair'};
    if(room==='farm'&&a?.farmPaused)return {kind:'paused',text:'Ⅱ Greenhouse Paused'};
    if(a?.temporary[room])return {kind:'degraded',text:'△ Repair until Day '+a.temporary[room].expires};
    return {kind:'ready',text:'● Online'};
  }
  function links(a,id) {
    return {extraCuts:['ice','regolith'].includes(id)&&a.calibration>0?2:0,
      extraScans:['ice','regolith'].includes(id)&&a.surveys>0?1:0,
      armor:id==='flight'&&a.flightArmor>0?1:0};
  }
  function events(s) {
    return scenarios[s.adventure.scenario].events.filter(e=>e.day===s.day&&!s.adventure.eventsSeen.includes(e.day)).map(e=>({...e,effects:e.guard&&s[e.guard]?e.mitigated:e.effects,protected:!!(e.guard&&s[e.guard])}));
  }
  const api={scenarios,roomFlags,create,status,links,events};
  if(typeof module!=='undefined')module.exports=api;
  root.ARESAdventureCore=api;
})(typeof window==='undefined'?globalThis:window);
