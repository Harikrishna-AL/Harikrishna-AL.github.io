/* =========================================
   1. The Scientific Distribution Animation
   ========================================= */
const canvas = document.getElementById('mathCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let gaussians = [];
const numGaussians = 4;

// Physics parameters
const learningRate = 0.01; // How fast peaks move
let t = 0;

class Gaussian {
    constructor() {
        // Randomize initial state
        this.mu = Math.random();       // Mean (0 to 1)
        this.sigma = 0.05 + Math.random() * 0.1; // Std Dev (Width)
        this.amp = 0.1 + Math.random() * 0.5;    // Amplitude (Height)
        
        // Target state (for transition)
        this.targetMu = this.mu;
        this.targetSigma = this.sigma;
        this.targetAmp = this.amp;
        
        this.moveTimer = Math.random() * 100;
    }

    update() {
        // Linear Interpolation towards target
        this.mu += (this.targetMu - this.mu) * learningRate;
        this.sigma += (this.targetSigma - this.sigma) * learningRate;
        this.amp += (this.targetAmp - this.amp) * learningRate;

        this.moveTimer--;

        // If it's time to "Learn" a new distribution (Shift)
        if (this.moveTimer <= 0) {
            this.targetMu = 0.1 + Math.random() * 0.8; // Keep within padded area
            this.targetSigma = 0.04 + Math.random() * 0.12;
            this.targetAmp = 0.3 + Math.random() * 0.6;
            this.moveTimer = 150 + Math.random() * 200; // Wait before next shift
        }
    }

    // Calculate Y for a given X (standard Gaussian formula)
    getValue(x) {
        return this.amp * Math.exp(-0.5 * Math.pow((x - this.mu) / this.sigma, 2));
    }
}

function init() {
    if (!canvas) return;
    resize();
    for(let i=0; i<numGaussians; i++) gaussians.push(new Gaussian());
    animate();
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(233, 236, 239, 0.5)';
    ctx.lineWidth = 1;
    
    // Draw vertical grid lines (X axis ticks)
    for(let i=0.1; i<1; i+=0.1) {
        let x = i * width;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    // Draw horizontal grid lines (Y axis ticks)
    for(let i=0.1; i<1; i+=0.2) {
        let y = height - (i * height);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    
    drawGrid();

    // 1. Update Physics
    gaussians.forEach(g => g.update());

    // 2. Draw Individual Components (Dashed Lines) - "The Latent Concepts"
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 1;
    
    gaussians.forEach((g, index) => {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(44, 91, 240, 0.15)'; // Faint Blue
        
        for (let x = 0; x <= width; x += 5) {
            let normalizedX = x / width;
            let y = g.getValue(normalizedX);
            let screenY = height - (y * height * 0.6) - (height * 0.2); // Scale to fit, shift up
            if (x===0) ctx.moveTo(x, screenY);
            else ctx.lineTo(x, screenY);
        }
        ctx.stroke();
    });

    // 3. Draw The Mixture (Sum) - "The Posterior"
    ctx.setLineDash([]); // Solid line
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(44, 91, 240, 0.4)'; // Blue
    ctx.beginPath();

    for (let x = 0; x <= width; x += 3) {
        let normalizedX = x / width;
        let sumY = 0;
        
        // Sum the Gaussians
        gaussians.forEach(g => {
            sumY += g.getValue(normalizedX);
        });

        let screenY = height - (sumY * height * 0.6) - (height * 0.2);
        if (x===0) ctx.moveTo(x, screenY);
        else ctx.lineTo(x, screenY);
    }
    ctx.stroke();
    
    // Fill under curve
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.fillStyle = 'rgba(44, 91, 240, 0.03)';
    ctx.fill();

    requestAnimationFrame(animate);
}

window.addEventListener('resize', resize);
init();

// Trigger MathJax re-render for the dynamically added math if any
if(window.MathJax && window.MathJax.typesetPromise) {
    MathJax.typesetPromise();
}

