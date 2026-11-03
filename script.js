let audioCtx = null;
let isPoweredOn = false;

let masterGain = null;

const powerBtn = document.getElementById('power-btn');
const visualizerCanvas = document.getElementById('visualizer');
const canvasCtx = visualizerCanvas.getContext('2d');

powerBtn.addEventListener('click', () => {
    if (!isPoweredOn) {

        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = 0.8;
        masterGain.connect(audioCtx.destination);

        audioCtx.resume();
        isPoweredOn = true;
        powerBtn.textContent = 'Engine Active';
        powerBtn.classList.add('active');

        console.log("Audio Engine Initialized");
        startVisualizerLoop();
    } else {

        audioCtx.suspend();
        isPoweredOn = false;
        powerBtn.textContent = 'Power Audio Engine';
        powerBtn.classList.remove('active');
        console.log("Audio Engine Suspended");
    }
});

function startVisualizerLoop() {
    function draw() {
        requestAnimationFrame(draw);

        canvasCtx.fillStyle = '#050308';
        canvasCtx.fillRect(0, 0, visualizerCanvas.clientWidth, visualizerCanvas.height);

        if (!isPoweredOn) return;

        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = '#39ff14';
        canvasCtx.beginPath();

        const sliceWidth = visualizerCanvas.width / 100;
        const centerY = visualizerCanvas.height / 2;
        let x = 0;

        for (let i = 0; i < 100; i++) {
            const v = Math.sin((i + Date.now() * 0.005) * 0.1) * 20 + centerY;
            if (i ===0) {
                canvasCtx.moveTo(x, v);
            } else {
                canvasCtx.lineTo(x, v);
            }
            x += sliceWidth;
        }
        canvasCtx.stroke();
    }
    draw();
}

function playThunder() {
    if (!isPoweredOn) return;

    const bufferSize = audioCtx.sampleRate * 3;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1);
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 120;

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

    const osc = audioCtx.createOscillator();
    const sfxGain = audioCtx.createGain();

    osc.type = 'sawtooth';

    osc.frequency.setValueAtTime(300, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(450, audioCtx.currentTime + 0.4);
    osc.frequency.linearRampToValueAtTime(350, audioCtx.currentTime + 0.8);

    sfxGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    sfxGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);

    osc.connect(sfxGain);
    sfxGain.connect(masterGain);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.8);
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

    const osc = audioCtx.createOscillator();
    const sfxGain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, audioCtx.currentTime);

    sfxGain.gain.setValueAtTime(0.5, audioCtx.currentTime);
    sfxGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.0);

    osc.connect(sfxGain);
    sfxGain.connect(masterGain);

    osc.start();
    osc.stop(audioCtx.currentTime + 2.0);
}

document.getElementById('sfx-thunder').addEventListener('click', playThunder);
document.getElementById('sfx-creak').addEventListener('click', playCreak);
document.getElementById('sfx-wail').addEventListener('click', playWail);
document.getElementById('sfx-bell').addEventListener('click', playBell);

