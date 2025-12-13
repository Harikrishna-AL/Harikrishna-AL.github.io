/* -----------------------------------------------------------
   PART 1: THE ANIMATION (The "Living Manifold")
----------------------------------------------------------- */
const canvas = document.getElementById('distributionCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let time = 0;

// Configuration for the Gaussian Mixture
const numGaussians = 5;
const speed = 0.005; // How fast the distributions morph

// We store Current state and Target state to interpolate between them
let currents = [];
let targets = [];

class Gaussian {
    constructor() {
        this.reset(true);
    }

    reset(firstRun = false) {
        // Randomize Amplitude (height), Mean (position), Sigma (width)
        // Values normalized between 0 and 1
        this.amp = 0.2 + Math.random() * 0.5; 
        this.mu = 0.1 + Math.random() * 0.8; 
        this.sigma = 0.05 + Math.random() * 0.15;
    }
}

function initDistributions() {
    for (let i = 0; i < numGaussians; i++) {
        currents.push(new Gaussian());
        targets.push(new Gaussian());
    }
}

// Linear Interpolation
function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight * 0.6; // Matches CSS height
}

function draw() {
    // Clear screen
    ctx.clearRect(0, 0, width, height);
    
    // Styling the line
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#2c5bf0'; // The accent color
    
    // Iterate over x-axis (pixels)
    for (let x = 0; x <= width; x += 2) { // Step by 2 for performance
        let normalizedX = x / width; // 0.0 to 1.0
        let normalizedY = 0;

        // Sum of Gaussians at this X
        for (let i = 0; i < numGaussians; i++) {
            let c = currents[i];
            
            // Standard Gaussian formula
            // y = A * exp( -0.5 * ((x - mu) / sigma)^2 )
            let g = c.amp * Math.exp(-0.5 * Math.pow((normalizedX - c.mu) / c.sigma, 2));
            normalizedY += g;
        }

        // Map normalized Y to screen coordinates
        // Note: Canvas Y starts at top, so we do height - y
        let screenY = height - (normalizedY * height * 0.8); 
        
        if (x === 0) ctx.moveTo(x, screenY);
        else ctx.lineTo(x, screenY);
    }
    
    // Fill option (optional, makes it look like a density area)
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.fillStyle = 'rgba(44, 91, 240, 0.05)';
    ctx.fill();
    ctx.stroke();

    // Update Logic
    updatePhysics();
    
    requestAnimationFrame(draw);
}

function updatePhysics() {
    // Smoothly move 'current' parameters toward 'target' parameters
    let allReached = true;
    
    for (let i = 0; i < numGaussians; i++) {
        let c = currents[i];
        let t = targets[i];

        c.amp = lerp(c.amp, t.amp, speed);
        c.mu = lerp(c.mu, t.mu, speed);
        c.sigma = lerp(c.sigma, t.sigma, speed);

        // Check if we are close enough to target to pick a new target
        if (Math.abs(c.mu - t.mu) > 0.01) allReached = false;
    }

    // If all Gaussians have mostly reached their targets, pick new targets
    // This simulates "Drift" in Continual Learning
    if (Math.random() < 0.005) { // Small random chance to shift a target
        let idx = Math.floor(Math.random() * numGaussians);
        targets[idx].reset();
    }
}

// Init Animation
window.addEventListener('resize', resize);
resize();
initDistributions();
draw();


/* -----------------------------------------------------------
   PART 2: SIMPLE BLOG ENGINE (No Database required)
----------------------------------------------------------- */

// You can simply add new notes to this array
const myNotes = [
    {
        title: "Overcoming Catastrophic Forgetting",
        date: "2023-10-12",
        excerpt: "Exploring Elastic Weight Consolidation (EWC) and how regularization terms can protect important weights during sequential tasks.",
        content: "Full text would go here..." 
    },
    {
        title: "Bayesian Neural Networks 101",
        date: "2023-09-28",
        excerpt: "Why point estimates are not enough. Understanding uncertainty in weights is crucial for safe AI deployment.",
        content: "Full text..."
    },
    {
        title: "The Stability-Plasticity Dilemma",
        date: "2023-08-15",
        excerpt: "A look at the Grossberg paradox: how can a system be plastic enough to learn new things, but stable enough to preserve the old?",
        content: "Full text..."
    }
];

const notesContainer = document.getElementById('notes-list');

function renderNotes() {
    notesContainer.innerHTML = myNotes.map(note => `
        <div class="note-card">
            <div class="note-date">${note.date}</div>
            <h3 class="note-title">${note.title}</h3>
            <p class="note-excerpt">${note.excerpt}</p>
            <a href="#" class="read-more">Read Entry &rarr;</a>
        </div>
    `).join('');
}

renderNotes();

// Simple Tab Switching
const navLinks = document.querySelectorAll('nav a');
const sections = document.querySelectorAll('.page-section');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from links
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // Hide all sections
        sections.forEach(s => s.classList.add('hidden'));

        // Show target section
        const targetId = link.getAttribute('href').substring(1);
        document.getElementById(targetId).classList.remove('hidden');
    });
});