let audioCtx = null;
let isPoweredOn = false;

let masterGain = null;
let analyser = null;

const powerBtn = document.getElementById('power-btn');
const visualizerCanvas = document.getElementById('visualizer');
const canvasCtx = visualizerCanvas.getContext('2d');

powerBtn.addEventListener('click', () => {
    if (!isPoweredOn) {

        audioCtx = new window.AudioContext();

        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0.8, audioCtx.currentTime);


        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        masterGain.connect(analyser);
        analyser.connect(audioCtx.destination);

        
        isPoweredOn = true;
        powerBtn.textContent = 'Engine Active';
        powerBtn.classList.add('active');

        console.log("Audio Engine Initialized");
        startVisualizerLoop();

        const windVal = parseFloat(document.getElementById('wind-vol').value);
        if (windVal > 0) {
            initWind();
            if (windGain) windGain.gain.setValueAtTime(windVal, audioCtx.currentTime);
        }

        const rainVal = parseFloat(document.getElementById('rain-vol').value);
        if (rainVal > 0) {
            initRain();
            if (rainGain) rainGain.gain.setValueAtTime(rainVal, audioCtx.currentTime);
        }

        const droneVal = parseFloat(document.getElementById('drone-vol').value);
        if (droneVal > 0) {
            initDrone();
            if (droneGain) droneGain.gain.setValueAtTime(droneVal, audioCtx.currentTime);
        }

        const chimesVal = parseFloat(document.getElementById('chime-vol').value);
        if (chimesVal > 0) {
            initChimes();
            if (chimesGain) chimesGain.gain.setValueAtTime(chimesVal, audioCtx.currentTime);
        }



    } else {
        audioCtx.close();
        isPoweredOn = false;

        windNode = null;
        windGain = null;
        rainNode = null;
        rainGain = null;
        droneNode1 = null;
        droneNode2 = null;
        droneGain = null;
        chimesGain = null;

        powerBtn.textContent = 'Power Audio Engine';
        powerBtn.classList.remove('active');
        console.log("Audio Engine Suspended");
    }
});

function startVisualizerLoop() {
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
        requestAnimationFrame(draw);

        canvasCtx.fillStyle = '#050308';
        canvasCtx.fillRect(0, 0, visualizerCanvas.clientWidth, visualizerCanvas.height);

        if (!isPoweredOn || !analyser) return;

        analyser.getByteTimeDomainData(dataArray);

        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = '#39ff14';
        canvasCtx.beginPath();

        const sliceWidth = visualizerCanvas.clientWidth / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * (visualizerCanvas.height / 2);
           
            if (i ===0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.lineTo(x, y);
            }
            x += sliceWidth;
        }

        canvasCtx.lineTo(visualizerCanvas.width, visualizerCanvas.height / 2);
        canvasCtx.stroke();
    }
    draw();
}

function playThunder() {
    if (!isPoweredOn) return;

    const bufferSize = audioCtx.sampleRate * 4;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 3;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 180;

    const sfxGain = audioCtx.createGain();
    sfxGain.gain.setValueAtTime(1.0, audioCtx.currentTime);
    sfxGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 3.0);

    noise.connect(filter);
    filter.connect(sfxGain);
    sfxGain.connect(masterGain);

    noise.start();
}

function playCreak() {
    if (!isPoweredOn) return;

    
    const bufferSize = audioCtx.sampleRate * 0.8; 
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, audioCtx.currentTime);
    filter.frequency.linearRampToValueAtTime(1400, audioCtx.currentTime + 0.3);
    filter.frequency.linearRampToValueAtTime(700, audioCtx.currentTime + 0.8);
    filter.Q.value = 12; 

    const sfxGain = audioCtx.createGain();
    sfxGain.gain.setValueAtTime(0.8, audioCtx.currentTime);
    sfxGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);

    noise.connect(filter);
    filter.connect(sfxGain);
    sfxGain.connect(masterGain);

    noise.start();
} 

function playWail() {
    if (!isPoweredOn) return;

    const osc = audioCtx.createOscillator();
    const sfxGain = audioCtx.createGain();

    osc.type = 'sine';

    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(900, audioCtx.currentTime + 0.6);
    osc.frequency.linearRampToValueAtTime(500, audioCtx.currentTime + 1.5);

    sfxGain.gain.setValueAtTime(0, audioCtx.currentTime);
    sfxGain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.4);
    sfxGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);

    osc.connect(sfxGain);
    sfxGain.connect(masterGain);

    osc.start();
    osc.stop(audioCtx.currentTime + 1.5);
}

function playBell() {
    if (!isPoweredOn) return;

    const now = audioCtx.currentTime;

    const freqs = [220, 616, 880]; 
    
    freqs.forEach((f, index) => {
        const osc = audioCtx.createOscillator();
        const bellGain = audioCtx.createGain();

        osc.type = index === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f, now);

        const decay = 3.0 - (index * 0.7);
        bellGain.gain.setValueAtTime(0.4 / (index + 1), now);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

        osc.connect(bellGain);
        bellGain.connect(masterGain);

        osc.start();
        osc.stop(now + decay);
    });

}

document.getElementById('sfx-thunder').addEventListener('click', playThunder);
document.getElementById('sfx-creak').addEventListener('click', playCreak);
document.getElementById('sfx-wail').addEventListener('click', playWail);
document.getElementById('sfx-bell').addEventListener('click', playBell);


let windNode = null;
let windGain = null;
let rainNode = null;
let rainGain = null;
let droneNode1 = null;
let droneNode2 = null;
let droneGain = null;
let chimesGain = null;


function initWind() {
    const bufferSize = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 300;

    windGain =audioCtx.createGain();
    windGain.gain.value = 0;

    noise.connect(filter);
    filter.connect(windGain);
    windGain.connect(masterGain);

    noise.start();
    windNode = windGain;
}

function initRain() {
    const bufferSize = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;

    rainGain = audioCtx.createGain();
    rainGain.gain.value = 1000;

    rainGain = audioCtx.createGain();
    rainGain.gain.value = 0;

    noiseSource.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(masterGain);

    noiseSource.start();
    rainNode = rainGain;
}

function initDrone() {
    droneNode1 = audioCtx.createOscillator();
    droneNode2 = audioCtx.createOscillator();
    droneGain = audioCtx.createGain();

    droneNode1.type = 'sawtooth';
    droneNode2.type = 'triangle';

    droneNode1.frequency.value = 55;
    droneNode2.frequency.value = 58.27;

    droneGain.gain.value = 0;

    droneNode1.connect(droneGain);
    droneNode2.connect(droneGain);
    droneGain.connect(masterGain);

    droneNode1.start();
    droneNode2.start();
}

function initChimes() {
    const chimesMasterGain = audioCtx.createGain();
    chimesMasterGain.gain.value = 0;
    chimesGain = chimesMasterGain;

    chimesMasterGain.connect(masterGain);

    setInterval(() => {
        if (!isPoweredOn || !chimesGain || chimesGain.gain.value <= 0.01) return;

        const osc = audioCtx.createOscillator();
        const noteGain = audioCtx.createGain();

        const notes = [1046.50, 1174.66, 1318.51, 1567.98, 1760.00];
        osc.frequency.value = notes[Math.floor(Math.random() * notes.length)];
        osc.type = 'sine';

        const now = audioCtx.currentTime;
        noteGain.gain.setValueAtTime(0.1, now);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);

        osc.connect(noteGain);
        noteGain.connect(chimesMasterGain);

        osc.start(now);
        osc.stop(now + 1.5);
    }, 800);

}


document.getElementById('wind-vol').addEventListener('input', (e) => {
    if (!isPoweredOn) return;
    if (!windNode) initWind();
    windGain.gain.setTargetAtTime(e.target.value, audioCtx.currentTime, 0.05);
});

document.getElementById('rain-vol').addEventListener('input', (e) => {
    if (!isPoweredOn) return;
    if (!rainNode) initRain();
    rainGain.gain.setTargetAtTime(e.target.value, audioCtx.currentTime, 0.05);
});

document.getElementById('drone-vol').addEventListener('input', (e) => {
    if (!isPoweredOn) return;
    if (!droneNode1) initDrone();
    droneGain.gain.setTargetAtTime(e.target.value, audioCtx.currentTime, 0.05);
});

document.getElementById('chime-vol').addEventListener('input', (e) => {
    if (!isPoweredOn) return;
    if (!chimesGain) initChimes();
    chimesGain.gain.setTargetAtTime(e.target.value, audioCtx.currentTime, 0.05);
});


const presetInput = document.getElementById('preset-name');
const savePresetBtn = document.getElementById('save-preset-btn');
const presetListContainer = document.getElementById('preset-list');

let savedPresets = JSON.parse(localStorage.getItem('manor_presets'));
if (!savedPresets || Object.keys(savedPresets).length === 0) {
    savedPresets = {
    "Spooky Storm": { wind: 0.5, rain: 0.8, drone: 0.2, chimes: 0.0 },
    "Silent Crypt": { wind: 0.0, rain: 0.0, drone: 0.7, chimes: 0.3 }
    };
    localStorage.setItem('manor_presets', JSON.stringify(savedPresets));
};


function renderPresets() {
    presetListContainer.innerHTML = '';
    Object.keys(savedPresets).forEach(name => {
        const chip = document.createElement('div');
        chip.className = 'preset-chip';

        const textSpan = document.createElement('span');
        textSpan.textContent = name;
        textSpan.style.cursor = 'pointer';
        textSpan.addEventListener('click', () => {
            loadPreset(name);
        });

        const deleteBtn = document.createElement('span');
        deleteBtn.textContent = ' ×';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.marginLeft = '8px';
        deleteBtn.style.color = '#ff6b6b';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            delete savedPresets[name];
            localStorage.setItem('manor_presets', JSON.stringify(savedPresets));
            renderPresets();
        });

        chip.appendChild(textSpan);
        chip.appendChild(deleteBtn);
        presetListContainer.appendChild(chip);
    });
}

function loadPreset(name) {
    const preset = savedPresets[name];
    if (!preset) return;

    const windSlider = document.getElementById('wind-vol');
    const rainSlider = document.getElementById('rain-vol');
    const droneSlider = document.getElementById('drone-vol');
    const chimesSlider = document.getElementById('chime-vol');

    windSlider.value = preset.wind ?? 0;
    rainSlider.value = preset.rain ?? 0;
    droneSlider.value = preset.drone ?? 0;
    chimesSlider.value = preset.chimes ?? 0;

    if (isPoweredOn) {
     
        if (preset.wind > 0) {
            if (!windNode) initWind();
            if (windGain) windGain.gain.setTargetAtTime(preset.wind, audioCtx.currentTime, 0.05);
        } else if (windGain) {
            windGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
        }

        if (preset.rain > 0) {
            if (!rainNode) initRain();
            if (rainGain) rainGain.gain.setTargetAtTime(preset.rain, audioCtx.currentTime, 0.05);
        } else if (rainGain) {
            rainGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
        }

        if (preset.drone > 0) {
            if (!droneNode1) initDrone();
            if (droneGain) droneGain.gain.setTargetAtTime(preset.drone, audioCtx.currentTime, 0.05);
        } else if (droneGain) {
            droneGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
        }

        if (preset.chimes > 0) {
            if (!chimesGain) initChimes();
            if (chimesGain) chimesGain.gain.setTargetAtTime(preset.chimes, audioCtx.currentTime, 0.05);
        } else if (chimesGain) {
            chimesGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
        }
    }
    console.log(`Loaded preset: ${name}`)

}

savePresetBtn.addEventListener('click', () => {
    const name = presetInput.value.trim();
    if (!name) return alert('Please enter a preset name!');

    const windVal = parseFloat(document.getElementById('wind-vol').value);
    const rainVal = parseFloat(document.getElementById('rain-vol').value);
    const droneVal = parseFloat(document.getElementById('drone-vol').value);
    const chimesVal = parseFloat(document.getElementById('chime-vol').value);

    savedPresets[name] = { wind: windVal, rain: rainVal, drone: droneVal, chimes: chimesVal };
    localStorage.setItem('manor_presets', JSON.stringify(savedPresets));

    presetInput.value = '';
    renderPresets();
    console.log(`Saved preset: ${name}`);
});

renderPresets();

