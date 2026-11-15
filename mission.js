const missionData = {
    moon: {
        name: "LUNAR BASE",
        subtitle: "Earth’s Moon",
        icon: "☾",
        color: "#b8c8df",
        unlockDay: 1,
        description: "An unknown signal has been detected at the lunar base. Explore the base and find its source.",
        tasks: [
            {
                title: "Damaged Transmitter",
                description: "A damaged transmitter has been found near the entrance. What should you do?",
                choices: [
                    "Check the power supply and cable condition",
                    "Shut down the entire base immediately",
                    "Leave the transmitter unchecked"
                ],
                correct: 0,
                success: "A damaged power cable has been detected."
            },
            {
                title: "Unknown Signal",
                description: "The transmitter is working again. The signal is coming from an underground room.",
                choices: [
                    "Ignore the signal",
                    "Check sensor readings and the room map",
                    "Shut down the communications system"
                ],
                correct: 1,
                success: "A hidden technical room has been discovered."
            },
            {
                title: "Signal Source",
                description: "An old automated beacon has been found in the room.",
                choices: [
                    "Destroy the beacon",
                    "Disconnect all base systems",
                    "Save the beacon data and transmit it to ARES-7"
                ],
                correct: 2,
                success: "Beacon data successfully transmitted."
            }
        ]
    },

    mars: {
        name: "PLANET MARS",
        subtitle: "The Red Planet",
        icon: "♂",
        color: "#f07852",
        unlockDay: 3,
        description: "Explore the surface of Mars and find resources to support the station.",
        tasks: [
            {
                title: "Search for an Exploration Site",
                description: "The scanner shows several surface areas. Which one should you choose?",
                choices: [
                    "The area with high ice content",
                    "The area with unknown radiation",
                    "The area with unstable ground"
                ],
                correct: 0,
                success: "The scanner confirmed the presence of underground ice."
            },
            {
                title: "Resource Extraction",
                description: "The drilling rig is ready. Which mode should you choose?",
                choices: [
                    "Maximum power without monitoring",
                    "Controlled extraction mode",
                    "Turn off the cooling system"
                ],
                correct: 1,
                success: "Resources extracted without overloading the equipment."
            },
            {
                title: "Return",
                description: "A dust storm is approaching. How should you end the expedition?",
                choices: [
                    "Continue exploring",
                    "Leave the equipment running",
                    "Save the samples and return to the station"
                ],
                correct: 2,
                success: "The expedition returned successfully."
            }
        ]
    },

    station: {
        name: "STATION ALPHA",
        subtitle: "Orbital Station",
        icon: "✦",
        color: "#49c9e8",
        unlockDay: 5,
        description: "Station Alpha has lost contact with Earth. Its systems must be restored.",
        tasks: [
            {
                title: "Power Check",
                description: "The main generator is not working. Where should you start?",
                choices: [
                    "Check the backup power supply",
                    "Turn on all systems at once",
                    "Disconnect the batteries"
                ],
                correct: 0,
                success: "The backup battery is operational."
            },
            {
                title: "Restore Communications",
                description: "The antenna is operating unstably.",
                choices: [
                    "Increase the antenna load",
                    "Check the connections and settings",
                    "Shut down the transmitter permanently"
                ],
                correct: 1,
                success: "Communications with the station have been restored."
            },
            {
                title: "Data Transmission",
                description: "The system is ready to transmit the collected data.",
                choices: [
                    "Delete all data",
                    "Delay transmission",
                    "Send the report to ARES-7"
                ],
                correct: 2,
                success: "The report was successfully received by ARES-7."
            }
        ]
    },

    ice: {
        name: "ICE PLANET",
        subtitle: "Frost Sector",
        icon: "❄",
        color: "#8de5f5",
        unlockDay: 8,
        description: "An exploration team has gone missing on the ice planet. Find traces of the expedition.",
        tasks: [
            {
                title: "Search for the Expedition",
                description: "The scanner has detected a weak signal beneath the surface.",
                choices: [
                    "Ignore the signal",
                    "Check the signal coordinates",
                    "Put all systems into sleep mode"
                ],
                correct: 1,
                success: "The expedition’s approximate location has been found."
            },
            {
                title: "Damaged Module",
                description: "A damaged research module has been detected near the signal.",
                choices: [
                    "Check the module’s condition and records",
                    "Leave the module",
                    "Disconnect all sensors"
                ],
                correct: 0,
                success: "The expedition’s route was found in the records."
            },
            {
                title: "Data Recovery",
                description: "An automated container containing expedition data has been found.",
                choices: [
                    "Delete the records",
                    "Leave the container",
                    "Retrieve the data and transmit it to ARES-7"
                ],
                correct: 2,
                success: "The expedition data has been successfully recovered."
            }
        ]
    },

    lab: {
        name: "ALIEN LABORATORY",
        subtitle: "Unknown Sector",
        icon: "⌬",
        color: "#b78cff",
        unlockDay: 11,
        description: "An abandoned laboratory has been found. Its automated systems must be investigated.",
        tasks: [
            {
                title: "Laboratory Entry",
                description: "The door is locked by an unknown system.",
                choices: [
                    "Check the control panel",
                    "Shut off all power",
                    "Ignore the lock"
                ],
                correct: 0,
                success: "The panel revealed a safe way to open the door."
            },
            {
                title: "Sample Analysis",
                description: "An unknown mineral has been found in the laboratory.",
                choices: [
                    "Mix it with other substances",
                    "Scan it and record the readings",
                    "Destroy the sample"
                ],
                correct: 1,
                success: "Mineral composition data has been obtained."
            },
            {
                title: "Laboratory Archive",
                description: "An encrypted research archive has been found.",
                choices: [
                    "Delete the archive",
                    "Turn off the computer",
                    "Save a copy of the archive and transmit it to ARES-7"
                ],
                correct: 2,
                success: "The laboratory archive has been saved."
            }
        ]
    },

    galaxy: {
        name: "MYSTERIOUS GALAXY",
        subtitle: "Lost World",
        icon: "✧",
        color: "#e6a8ff",
        unlockDay: 15,
        description: "An unknown object has been detected in a distant galaxy. Its origin must be investigated.",
        tasks: [
            {
                title: "Unknown Object",
                description: "The telescope has detected an unusual object.",
                choices: [
                    "Check its coordinates and properties",
                    "Ignore the observation",
                    "Turn off the telescope"
                ],
                correct: 0,
                success: "The object’s exact coordinates have been obtained."
            },
            {
                title: "Signal Analysis",
                description: "The object is emitting a repeating signal.",
                choices: [
                    "Delete the recording",
                    "Record the signal and analyze its structure",
                    "Disconnect the receiver"
                ],
                correct: 1,
                success: "A repeating signal pattern has been detected."
            },
            {
                title: "Ancient Artifact",
                description: "The scan has detected an object of unknown origin.",
                choices: [
                    "Leave it unexamined",
                    "Delete all scan data",
                    "Save the research results and transmit them to the station"
                ],
                correct: 2,
                success: "Artifact data has been transmitted to ARES-7."
            }
        ]
    },

    neptune: {
        name: "NEPTUNE",
        subtitle: "Ice Giant",
        icon: "♆",
        color: "#4d83ff",
        unlockDay: 18,
        description: "An unusual energy anomaly has been detected on Neptune. This is the final expedition.",
        tasks: [
            {
                title: "Atmosphere Scan",
                description: "Instruments indicate strong atmospheric currents.",
                choices: [
                    "Ignore the readings",
                    "Check the atmosphere using remote sensors",
                    "Turn off all instruments"
                ],
                correct: 1,
                success: "Atmospheric data has been obtained."
            },
            {
                title: "Energy Anomaly",
                description: "The scanner has detected an unusual energy source.",
                choices: [
                    "Perform a remote analysis of the source",
                    "Turn off the scanner immediately",
                    "Do not save the results"
                ],
                correct: 0,
                success: "A stable energy source has been detected."
            },
            {
                title: "Complete the Expedition",
                description: "All data has been collected. What should you do before returning?",
                choices: [
                    "Leave the data on Neptune",
                    "Delete the records",
                    "Save the results and transmit the full report to ARES-7"
                ],
                correct: 2,
                success: "The Neptune expedition has been successfully completed."
            }
        ]
    }
};


// ARES-7 internal module comment
const missionReasons={
 moon:[['','Shutting down the entire base stops functioning systems and does not locate the damaged cable.','Without diagnostics, the transmitter remains faulty.'],['Ignoring the signal leaves its source unknown.','','Shutting down communications removes the signal but does not establish its origin.'],['Destroying the beacon loses records needed for verification.','Disconnecting the systems does not preserve data and disrupts the base.','']],
 mars:[['','The unknown radiation must be assessed first; a resource objective does not justify an uninvestigated risk.','Unstable ground poses a risk to drilling equipment.'],['Without load monitoring, the drill may overheat.','','Turning off cooling increases the risk of overheating.'],['The storm reduces visibility and makes the return more difficult.','Equipment left running consumes energy and may be damaged.','']],
 station:[['','Starting everything at once may overload the limited backup supply.','Disconnecting a working backup removes the station’s power source.'],['Increasing the load does not fix a poor connection.','','Permanent shutdown leaves the station without communications.'],['Deleting the data destroys the collected results.','Until transmitted, the data may be lost in another failure.','']],
 ice:[['The weak signal may be the only clue for the search.','','Sleep mode stops the search for coordinates.'],['','The module’s records may contain the missing expedition’s route.','Without sensors, the module’s condition cannot be assessed.'],['Deleting the data destroys information about the route and events.','The container may be lost if left behind.','']],
 lab:[['','The panel may lose power while the lock remains engaged.','Ignoring the lock does not provide a safe way to open the door.'],['Unknown substances should not be mixed without analysis; the result is unpredictable.','','Destroying the sample makes further analysis impossible.'],['Deleting the archive without a copy destroys it.','Turning off the computer does not create a backup.','']],
 galaxy:[['','Without verification, an object cannot be distinguished from an observational error.','Turning it off stops the collection of confirming observations.'],['Without the original recording, another team cannot verify the conclusion.','','Disconnecting the receiver prevents repeatability from being measured.'],['Without investigation, the object’s origin remains unknown.','Deleting the data removes evidence needed to test the hypothesis.','']],
 neptune:[['Ignoring the currents deprives the mission of data needed to assess conditions.','','Turning off the instruments stops remote observation.'],['','Turning it off before analysis leaves the anomaly unverified.','Without saved measurements, the result cannot be verified.'],['The results must be available to the team at the station.','Deleting the records destroys the expedition results.','']]
};
Object.entries(missionData).forEach(([id,m])=>m.tasks.forEach((t,i)=>t.wrongReasons=missionReasons[id][i]));
missionData.neptune.description='A remote probe studies Neptune’s atmosphere. The anomaly is a fictional story scenario; there is no surface landing.';
missionData.neptune.tasks[1].success='Repeated measurements have been obtained. There is not yet enough evidence to claim a new energy source exists.';
const ARESMissions = {
 current:null,currentId:null,step:0,completed:[],progress:{},
 reset(){this.current=null;this.currentId=null;this.step=0;this.completed=[];this.progress={};const r=document.getElementById('mission-root');if(r){r.innerHTML='';r.style.display='none';}},
 start(detail){
  const state=window.ARESGame.getState(),mission=missionData[detail.id];
  if(!state.gameStarted||state.gameOver||!mission)return;
  if(state.day<mission.unlockDay){alert('This mission is still locked.');return;}
  this.current=mission;this.currentId=detail.id;
  this.progress[detail.id]??={step:0,wrong:{},resolved:{}};
  this.step=this.progress[detail.id].step;
  document.getElementById('space-map-root').style.display='none';
  document.getElementById('mission-root').style.display='block';
  if(this.completed.includes(detail.id))this.finish();else this.render();window.scrollTo(0,0);
 },
 render(){
  const root=document.getElementById('mission-root');if(!root||!this.current)return;
  const m=this.current,t=m.tasks[this.step],p=this.progress[this.currentId];if(!t)return;
  root.innerHTML=`<div class="ares-mission"><div class="ares-mission-top"><button id="mission-back">← Back to Space Map</button><span>TRAINING EXPEDITION</span></div><div class="ares-mission-header" style="border-color:${m.color}"><div class="ares-mission-icon">${m.icon}</div><div><h1>${m.name}</h1><p>${m.subtitle}</p></div></div><p>${m.description}</p><p class="learn-muted">${['ice','lab','galaxy'].includes(this.currentId)?'Fictional scenario: the focus is on decision-making, not the actual existence of this location.':'Original scenario. Readings and rewards are part of a training model.'}</p><p>STAGE ${this.step+1} / ${m.tasks.length} · Correct on first try +${ARESScore.value('missionCorrect')}; mistake ${ARESScore.value('missionWrong')} and −2 energy; correction +${ARESScore.value('missionFixed')}.</p><div class="ares-mission-task"><h2>${t.title}</h2><p>${t.description}</p><div class="ares-mission-choices">${t.choices.map((c,i)=>`<button data-choice="${i}" ${p.resolved[this.step]||p.wrong[this.step]?.includes(i)?'disabled':''}>${c}</button>`).join('')}</div><p id="mission-feedback" role="status">${p.resolved[this.step]?t.success:p.wrong[this.step]?.length?'Earlier mistakes are recorded. Reread the instructions and choose how to address the cause.':''}</p></div></div>`;
  document.getElementById('mission-back').onclick=()=>this.returnToMap();
  root.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>this.choose(Number(b.dataset.choice)));
  if(p.resolved[this.step])this.addNext();
 },
 choose(index){
  const state=window.ARESGame.getState();if(!this.current||!state.gameStarted||state.gameOver)return;
  const t=this.current.tasks[this.step],p=this.progress[this.currentId];
  if(p.resolved[this.step]||!Number.isInteger(index)||!t.choices[index])return;
  p.wrong[this.step]??=[];if(p.wrong[this.step].includes(index))return;
  const key=`mission:${this.currentId}:${this.step}`;
  if(index!==t.correct){
   p.wrong[this.step].push(index);
   const reason=t.wrongReasons[index];const e=ARESScore.award('missionWrong',{key:key+':wrong:'+index,reason:t.title+': '+reason,section:this.current.name});
   ARESScore.effects('Expedition mistake: '+t.title,{energy:-2});this.render();
   const f=document.getElementById('mission-feedback');f.textContent=`${e.delta} points, −2 energy. ${reason} Try a different decision.`;f.style.color='#ffb2b8';
  }else{
   const e=ARESScore.award(p.wrong[this.step].length?'missionFixed':'missionCorrect',{key:key+':done',reason:t.title+': '+t.success,section:this.current.name});
   p.resolved[this.step]=true;this.render();const f=document.getElementById('mission-feedback');f.textContent=`+${e.delta} points. ${t.success} The decision is based on checking system status, preserving data, or controlling risk.`;f.style.color='#65e6a1';
  }
  window.ARESGame.render();
 },
 addNext(){const button=document.createElement('button');button.className='ares-mission-next';button.textContent=this.step===this.current.tasks.length-1?'Complete Mission':'Next Stage →';document.querySelector('.ares-mission-task').appendChild(button);button.onclick=()=>{if(window.ARESGame.getState().gameOver)return;this.step++;this.progress[this.currentId].step=this.step;if(this.step>=this.current.tasks.length)this.finish();else this.render();};},
 finish(){
  const state=window.ARESGame.getState();if(!this.current||!state.gameStarted||state.gameOver)return;
  const id=this.currentId,p=this.progress[id];if(Object.keys(p.resolved).length!==this.current.tasks.length)return;
  const first=!this.completed.includes(id);let delta=0;
  if(first){this.completed.push(id);delta=ARESScore.award('missionComplete',{key:'mission:'+id+':complete',reason:'All stages completed: '+this.current.name,section:this.current.name}).delta;ARESScore.effects('Expedition Reward',{materials:3,energy:5});}
  window.SpaceMap?.setMissionStatus(id,'completed');
  document.getElementById('mission-root').innerHTML=`<div class="ares-mission ares-mission-finished"><div class="ares-mission-success">✓</div><h1>MISSION COMPLETED</h1><h2>${this.current.name}</h2><p>${first?`Completion bonus: +${delta} points, +3 materials, up to +5 energy (maximum 100).`:'This mission has already been scored. No additional bonus is available.'}</p><p>Mistakes remain on record. See the decision log for a full explanation.</p><button id="mission-finish-button">Back to Space Map</button><button id="mission-protocol">Explain Score</button></div>`;
  document.getElementById('mission-finish-button').onclick=()=>this.returnToMap();document.getElementById('mission-protocol').onclick=()=>window.ARESLearning.journal();window.ARESGame.render();
 },
 returnToMap(){document.getElementById('mission-root').style.display='none';this.current=null;this.currentId=null;window.ARESGame.openSpaceMap();}
};

const missionStyle = document.createElement("style");

missionStyle.textContent = `
#mission-root {
    display: none;
    min-height: 75vh;
    padding: 25px;
    color: #e2e8f0;
}

.ares-mission {
    max-width: 1000px;
    margin: 0 auto;
    padding: 25px;
    background: #101b2b;
    border: 1px solid #263c56;
    border-radius: 16px;
}

.ares-mission-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
    flex-wrap: wrap;
    margin-bottom: 30px;
    color: #7f9bb8;
    font-size: 12px;
}

.ares-mission button {
    cursor: pointer;
    color: #e2e8f0;
    background: #1b2d43;
    border: 1px solid #36516e;
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 14px;
}

.ares-mission button:hover:not(:disabled) {
    background: #294361;
    border-color: #65b9e8;
}

.ares-mission button:disabled {
    opacity: 0.6;
    cursor: default;
}

.ares-mission-header {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px;
    background: #142338;
    border: 1px solid;
    border-radius: 12px;
}

.ares-mission-icon {
    font-size: 48px;
}

.ares-mission-header h1 {
    margin: 0 0 8px;
    font-size: 25px;
}

.ares-mission-header p {
    margin: 0;
    color: #8fa9c5;
}

.ares-mission-description {
    color: #b8c9dc;
    line-height: 1.7;
    margin: 25px 0;
}

.ares-mission-progress {
    margin-bottom: 25px;
    color: #83bce8;
    font-size: 13px;
}

.ares-mission-progress-track {
    height: 7px;
    margin-top: 10px;
    background: #26384d;
    border-radius: 10px;
    overflow: hidden;
}

.ares-mission-progress-track div {
    height: 100%;
    background: #49c9e8;
    transition: width 0.3s;
}

.ares-mission-task {
    padding: 25px;
    background: #142338;
    border: 1px solid #263c56;
    border-radius: 12px;
}

.ares-mission-task h2 {
    margin-top: 0;
}

.ares-mission-task > p {
    color: #a9bfd5;
    line-height: 1.6;
}

.ares-mission-choices {
    display: grid;
    gap: 12px;
    margin-top: 25px;
}

.ares-mission-choices button {
    width: 100%;
    text-align: left;
    padding: 16px;
}

#mission-feedback {
    min-height: 25px;
    margin-top: 20px;
}

.ares-mission-next {
    width: 100%;
    margin-top: 15px;
    background: #174b5c !important;
}

.ares-mission-finished {
    text-align: center;
    padding: 60px 25px;
}

.ares-mission-success {
    font-size: 70px;
    color: #65e6a1;
    margin-bottom: 20px;
}

.ares-mission-rewards {
    display: flex;
    justify-content: center;
    gap: 15px;
    flex-wrap: wrap;
    margin: 30px 0;
}

.ares-mission-rewards div {
    padding: 15px 20px;
    background: #1b3446;
    border: 1px solid #31536b;
    border-radius: 8px;
}

#mission-finish-button {
    margin-top: 15px;
    background: #174b5c;
}

@media (max-width: 600px) {
    #mission-root {
        padding: 10px;
    }

    .ares-mission {
        padding: 15px;
    }

    .ares-mission-header h1 {
        font-size: 19px;
    }

    .ares-mission-icon {
        font-size: 35px;
    }
}
`;

document.head.appendChild(missionStyle);

window.ARESMissions = ARESMissions;