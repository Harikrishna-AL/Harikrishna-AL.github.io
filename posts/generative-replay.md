---
title: Mitigating Catastrophic Forgetting
date: 2025-10-01
category: Continual Learning
abstract: Investigating the use of a dual-model architecture.
---

### 1. The Concept
In a standard continual learning setup, a model trains on Task $T_1$, then $T_2$.

### 2. Mathematical Formulation
The total loss function becomes a mix of the new data and the generated "replay" data:

<div class="math-black">$$\mathcal{L}_{total} = \alpha \mathcal{L}_{new}(x, y) + (1-\alpha) \mathcal{L}_{replay}(G(z))$$</div>

### 3. Implementation
Here is the python code:

```python
def train(model, data):
    # Training logic here
    print("Learning...")
```