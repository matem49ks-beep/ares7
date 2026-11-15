/* Game component notes. */
(function(root){
 'use strict';
 const rules={
  miningError:{label:'Drill damage / failed mining',value:-5,sign:-1},
  repairError:{label:'Failed repair circuit test',value:-6,sign:-1},
  pressureError:{label:'Failed system stabilization',value:-4,sign:-1},
  flightError:{label:'Arcade flight error',value:-3,sign:-1},
  repair:{label:'First system restoration',value:10,sign:1},
  signal:{label:'First SOS transmission',value:30,sign:1},
  mining:{label:'Successful resource extraction',value:3,sign:1},
  harvest:{label:'Error-free harvest',value:5,sign:1},
  harvestFixed:{label:'Harvest after correction',value:2,sign:1},
  farmError:{label:'Plant care error',value:-5,sign:-1},
  procedure:{label:'Error-free procedure',value:5,sign:1},
  procedureFixed:{label:'Procedure after correction',value:2,sign:1},
  orderError:{label:'Procedure performed out of order',value:-4,sign:-1},
  missionCorrect:{label:'Correct decision on the first attempt',value:10,sign:1},
  missionFixed:{label:'Correct decision after an error',value:3,sign:1},
  missionWrong:{label:'Incorrect expedition decision',value:-5,sign:-1},
  missionComplete:{label:'First expedition completion',value:20,sign:1},
  emergencyCorrect:{label:'Correct emergency response on the first attempt',value:15,sign:1},
  emergencyFixed:{label:'Emergency resolved after previous attempts',value:5,sign:1},
  emergencyPartial:{label:'Partially effective emergency action',value:3,sign:1},
  emergencyWeak:{label:'Ineffective emergency action',value:-5,sign:-1},
  emergencyWrong:{label:'Incorrect emergency action',value:-10,sign:-1},
  emergencyTimeout:{label:'Emergency time expired',value:-15,sign:-1}
 };
 const defaults={version:1,profile:'Training',seed:2026,timed:false,repeatLimit:3,weights:Object.fromEntries(Object.entries(rules).map(([id,r])=>[id,r.value]))};
 const clone=x=>JSON.parse(JSON.stringify(x));
 function validate(c){
  if(!c||c.version!==1||typeof c.timed!=='boolean'||!Number.isInteger(c.seed)||c.seed<1||c.seed>2147483647||!Number.isInteger(c.repeatLimit)||c.repeatLimit<1||c.repeatLimit>10)throw Error('Check the seed (1–2147483647) and repeat limit (1–10).');
  for(const[id,r]of Object.entries(rules)){const v=c.weights?.[id];if(!Number.isInteger(v)||Math.abs(v)>100||v*r.sign<=0)throw Error('Bonuses must be whole numbers from +1 to +100; penalties from −1 to −100.');}
  for(const[a,b]of [['harvest','harvestFixed'],['procedure','procedureFixed'],['missionCorrect','missionFixed'],['emergencyCorrect','emergencyFixed']])if(c.weights[b]>c.weights[a])throw Error('The bonus for a corrected attempt cannot exceed the first-attempt bonus.');
  if(c.weights.emergencyFixed+c.weights.emergencyPartial>c.weights.emergencyCorrect)throw Error('A partial action plus a correction cannot earn more than a correct decision on the first attempt.');
  // Translate legacy Ukrainian profile labels saved by older editions of ARES-7.
  // This changes display text only; timer, seed, limits and scoring values stay intact.
  const savedProfile=String(c.profile||'Custom').trim();
  const legacyProfiles={
    '\u041d\u0430\u0432\u0447\u0430\u043b\u044c\u043d\u0438\u0439':'Training',
    '\u041d\u0430\u0432\u0447\u0430\u043b\u044c\u043d\u0438\u0439 \u043f\u0440\u043e\u0444\u0456\u043b\u044c':'Training',
    '\u0406\u0437 \u0442\u0430\u0439\u043c\u0435\u0440\u043e\u043c':'Timed',
    '\u041f\u0440\u043e\u0444\u0456\u043b\u044c \u0456\u0437 \u0442\u0430\u0439\u043c\u0435\u0440\u043e\u043c':'Timed',
    '\u0412\u043b\u0430\u0441\u043d\u0438\u0439':'Custom'
  };
  const profile=legacyProfiles[savedProfile] ||
    (/[\u0400-\u052F]/.test(savedProfile)?'Custom':savedProfile);
  return {...clone(c),profile:profile.slice(0,40)};
 }
 function createSession(config=defaults){
  const cfg=validate(config),ledger=[],seen=new Set(),counts=new Map();let total=0,counter=0,rng=cfg.seed>>>0;
  return {config:cfg,ledger,get total(){return total;},id(prefix='task'){return prefix+':'+(++counter);},
   random(){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)/4294967296;},
   record(rule,info={}){
    if(!rules[rule])throw Error('Unknown score rule: '+rule);
    if(!info.key)throw Error('Every scoring event requires a unique key');
    if(seen.has(info.key))return {delta:0,total,duplicate:true,reason:'This action has already been scored.'};
    seen.add(info.key);let delta=cfg.weights[rule],limited=false;
    if(delta>0&&info.group){const count=counts.get(info.group)||0;const limit=info.limit??cfg.repeatLimit;if(count>=limit){delta=0;limited=true;}else counts.set(info.group,count+1);}
    const before=total;total+=delta;
    const entry={n:ledger.length+1,day:info.day??1,rule,key:info.key,label:rules[rule].label,reason:info.reason||rules[rule].label,delta,before,total,limited,section:info.section||'Station'};
    ledger.push(entry);return entry;
   }
  };
 }
 const api={rules,defaults,validate,createSession};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 root.ARESScoringCore=api;
 if(typeof window==='undefined')return;
 let pending=clone(defaults);try{const raw=localStorage.getItem('ares-scoring-config-v1');if(raw){const saved=JSON.parse(raw);pending=validate({...saved,weights:{...defaults.weights,...saved.weights}});if(saved.profile!==pending.profile)localStorage.setItem('ares-scoring-config-v1',JSON.stringify(pending));}}catch{}
 let session=createSession(pending),resourceLog=[];
 const state=()=>window.ARESGame?.getState();
 const fields=['energy','oxygen','water','food','health','protection','materials','ice','regolith','morale'];
 function snapshot(){const s=state();return s?Object.fromEntries(fields.map(k=>[k,Number(s[k])||0])):{};}
 function trace(label,before){const after=snapshot(),changes={};for(const k of fields)if(after[k]!==before[k])changes[k]={before:before[k],after:after[k],delta:Math.round((after[k]-before[k])*100)/100};if(Object.keys(changes).length)resourceLog.push({day:state()?.day||1,label,changes});}
 root.ARESScore={
  get config(){return session.config;},get pending(){return clone(pending);},get ledger(){return session.ledger;},get resourceLog(){return resourceLog;},get total(){return session.total;},
  value(id){return session.config.weights[id];},id(p){return session.id(p);},random(){return session.random();},snapshot,trace,
  reset(){session=createSession(pending);resourceLog=[];if(state())state().score=0;window.dispatchEvent(new Event('ares:score'));},
  setConfig(config){if(state()?.gameStarted)throw Error('Scoring rules are locked until the mission ends. Start a new game to change them.');pending=validate(config);try{localStorage.setItem('ares-scoring-config-v1',JSON.stringify(pending));}catch{}session=createSession(pending);if(state())state().score=0;resourceLog=[];window.dispatchEvent(new Event('ares:score'));},
  award(rule,info){const s=state();if(!s||!s.gameStarted||s.gameOver)return {delta:0,total:session.total,reason:'No active mission.'};const e=session.record(rule,{...info,day:s.day});s.score=session.total;if(!e.duplicate){window.ARESGame.logEvent(`${e.delta>0?'+':''}${e.delta} points: ${e.reason}${e.limited?' The reward limit for this action has been reached.':''} Score: ${e.total}.`);window.dispatchEvent(new CustomEvent('ares:score',{detail:e}));}return e;},
  effect(label,fn){const before=snapshot();fn();trace(label,before);},
  effects(label,effects){this.effect(label,()=>{const s=state();for(const[k,v]of Object.entries(effects)){if(!fields.includes(k))throw Error('Unknown resource');s[k]=Math.max(0,Math.min(['materials','ice','regolith'].includes(k)?999:100,s[k]+v));}});},
  report(){return {title:'ARES-7 — Training Mission Report',model:'A fictional educational model; not NASA telemetry',config:clone(session.config),day:state()?.day,score:session.total,ledger:clone(session.ledger),resources:clone(resourceLog)};}
 };
})(typeof window==='undefined'?globalThis:window);
