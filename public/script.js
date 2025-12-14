/* =========================================
   1. The Scientific Distribution Animation
   ========================================= */
const canvas = document.getElementById('mathCanvas');
const ctx = canvas.getContext('2d');
const statusLabel = document.getElementById('model-status');

let width, height;
let gaussians = [];
const numGaussians = 4;

// Physics parameters
const learningRate = 0.02; // How fast peaks move
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
            
            // Randomly update status text to look "busy"
            if(Math.random() > 0.7) {
                statusLabel.innerText = "DRIFT DETECTED...";
                setTimeout(() => statusLabel.innerText = "ADAPTING...", 500);
            }
        }
    }

    // Calculate Y for a given X (standard Gaussian formula)
    getValue(x) {
        return this.amp * Math.exp(-0.5 * Math.pow((x - this.mu) / this.sigma, 2));
    }
}

function init() {
    resize();
    for(let i=0; i<numGaussians; i++) gaussians.push(new Gaussian());
    animate();
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
}

function drawGrid() {
    ctx.strokeStyle = '#e9ecef';
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

    // Draw Axis Lines
    ctx.strokeStyle = '#adb5bd';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(width, height); // X Axis
    ctx.moveTo(0, 0);
    ctx.lineTo(0, height); // Y Axis
    ctx.stroke();
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
        ctx.strokeStyle = 'rgba(44, 91, 240, 0.3)'; // Faint Blue
        
        for (let x = 0; x <= width; x += 5) {
            let normalizedX = x / width;
            let y = g.getValue(normalizedX);
            let screenY = height - (y * height * 0.8); // Scale to fit
            if (x===0) ctx.moveTo(x, screenY);
            else ctx.lineTo(x, screenY);
        }
        ctx.stroke();
    });

    // 3. Draw The Mixture (Sum) - "The Posterior"
    ctx.setLineDash([]); // Solid line
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#2c5bf0'; // Strong Blue
    ctx.beginPath();

    for (let x = 0; x <= width; x += 2) {
        let normalizedX = x / width;
        let sumY = 0;
        
        // Sum the Gaussians
        gaussians.forEach(g => {
            sumY += g.getValue(normalizedX);
        });

        let screenY = height - (sumY * height * 0.8);
        if (x===0) ctx.moveTo(x, screenY);
        else ctx.lineTo(x, screenY);
    }
    ctx.stroke();
    
    // Fill under curve
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.fillStyle = 'rgba(44, 91, 240, 0.05)';
    ctx.fill();

    requestAnimationFrame(animate);
}

window.addEventListener('resize', resize);
init();


/* =========================================
   2. Scientific Notes Engine
   ========================================= */

const notes = [
    {
        title: "Mitigating Catastrophic Forgetting with Generative Replay",
        date: "2024-06-10",
        // The 'content' field uses backticks (`) for multi-line HTML
        content: `
            <details>
                <summary>Read Note</summary>
                
                <div class="note-content">
                    
                    <div class="abstract">
                        <strong>Abstract:</strong> Investigating the use of a dual-model architecture (Generator + Solver) to pseudo-rehearse previous tasks without storing original data.
                    </div>

                    <h5>1. The Concept</h5>
                    <p>
                        In a standard continual learning setup, a model trains on Task $T_1$, then $T_2$. When training on $T_2$, the gradients optimize the loss $\mathcal{L}_{T2}$ but often increase $\mathcal{L}_{T1}$.
                        <br><br>
                        <strong>Deep Generative Replay (DGR)</strong> proposes training a generator $G$ alongside the solver $S$. The generator learns the distribution of the input data $P(x)$.
                    </p>

                    <h5>2. Mathematical Formulation</h5>
                    <p>The total loss function becomes a mix of the new data and the generated "replay" data:</p>
                    
                    <div class="math-block">
                        $$ \mathcal{L}_{total} = \alpha \mathcal{L}_{new}(x, y) + (1-\alpha) \mathcal{L}_{replay}(G(z), S(G(z))) $$
                    </div>
                    
                    <p>Where $G(z)$ produces a "fake" sample from the previous task's distribution.</p>

                    <h5>3. Implementation Logic (PyTorch-like)</h5>
                    <div class="code-block">
# Pseudo-code for replay loop
for x_new, y_new in new_task_loader:
    
    # 1. Generate previous data
    z = torch.randn(batch_size, latent_dim)
    x_replay = generator(z)
    y_replay = previous_solver(x_replay) # Soft targets

    # 2. Combine Data
    x_combined = torch.cat([x_new, x_replay])
    y_combined = torch.cat([y_new, y_replay])

    # 3. Optimization Step
    optimizer.zero_grad()
    loss = criterion(current_solver(x_combined), y_combined)
    loss.backward()
    optimizer.step()
                    </div>

                    <div class="references">
                        <div class="ref-item"><span class="ref-num">[1]</span> Shin et al. (2017). Continual Learning with Deep Generative Replay. NeurIPS.</div>
                        <div class="ref-item"><span class="ref-num">[2]</span> Van de Ven, G. M. (2019). Three scenarios for continual learning.</div>
                    </div>

                </div>
            </details>
        `
    },
    
    // TEMPLATE FOR NEW NOTE (Copy-Paste this block)
    {
        title: "Note Title Here",
        date: "YYYY-MM-DD",
        content: `
            <details>
                <summary>Read Note</summary>
                <div class="note-content">
                    
                    <div class="abstract">
                        <strong>Abstract:</strong> Brief summary of the observation or hypothesis.
                    </div>

                    <h5>1. Introduction</h5>
                    <p>Text goes here. Use <span class="inline-code">inline code</span> for variables.</p>

                    <h5>2. Equation</h5>
                    <div class="math-block">
                        $$ E = mc^2 $$
                    </div>

                    <h5>3. Code</h5>
                    <div class="code-block">
print("Hello World")
                    </div>

                </div>
            </details>
        `
    }
];

const notesContainer = document.getElementById('notes-container');

// Render Notes
notes.forEach(note => {
    const div = document.createElement('div');
    div.className = 'note-item';
    div.innerHTML = `
        <div class="note-meta">${note.date}</div>
        <h4 class="note-title">${note.title}</h4>
        <div class="note-body"><p>${note.content}</p></div>
    `;
    notesContainer.appendChild(div);
});

// Trigger MathJax re-render for the dynamically added math
if(window.MathJax) {
    MathJax.typesetPromise();
}

