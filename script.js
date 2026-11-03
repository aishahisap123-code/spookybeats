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
        let x = 0;

        for (let i = 0; i < 100; i++) {
            const v = Math.sin((i + Date.now() * 0.005) * 0.1) * 20 + 0.75;
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