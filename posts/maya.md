---
title: Approaching Online Continual Learning with MAYA
date: 2026-04-09
category: Research
abstract: "Presenting MAYA (Manifold-Aligned Yielding Architecture), a fully online, training-free continual learning framework built around three interlocking mechanisms: an Equiangular Tight Frame that pre-defines maximally separated class targets, an Episodic Graph of streaming K-Means nodes that captures the multi-modal structure of each class manifold, and a closed-form projection matrix $P$ that maps the backbone's native feature space onto these targets without a single gradient update. At inference, a dual-system vote combining Log-Sum-Exp density over episodic memory with cosine alignment against NCM prototypes unifies local and global evidence."
---

### Introduction

The low-level visual cortex, after a critical developmental period, settles into a stable representational geometry that
persists through adulthood. Higher-level concept learning proceeds not by restructuring these representations, but
by learning new mappings over them. Modern vision backbones trained on hundreds of millions of images have
converged on a strikingly similar property: a rich, stable feature manifold that captures the statistical structure of the
visual world with remarkable fidelity. Now, can the same principle ground a solution to continual learning? Not by retraining the backbone as new classes arrive, but by learning, online and without forgetting, the optimal mapping over the manifold it already defines.

<br>

### Defining Continual Learning Settings

Continual Learning (CL) is a setting where a model learns from a stream of data that arrives in sequential tasks, $T_1, T_2, \dots, T_N$. There are three main types of CL: Task-Incremental, Class-Incremental, and Domain-Incremental. 

<br>

- **Task-Incremental Learning (TIL)**: The model is given a new task at each time step, and it must learn to perform the new task without forgetting the previous tasks. During the inference process, the task id is provided to the model.

- **Class-Incremental Learning (CIL)**: The model is given a new task at each time step, and it must learn to perform the new task without forgetting the previous tasks. During the inference process, the task id is not provided to the model.

- **Domain-Incremental Learning (DIL)**: Unlike the previous two settings, in DIL, the data distribution changes over time, but the task remains the same. The model must learn to adapt to the new distribution without forgetting the previous distributions.

<br> 

Class-Incremental and Domain-Incremental learning are the most challenging settings in CL. I'll be focusing on CIL for the rest of the post.

<br>

### Methodology

If we think of the CL problem keeping the backbone fixed, then the problem reduces to learning such a classifier that can continually learn. One of the most intuitive way to solve this problem is to store mean vectors of the previous classes and compute the cosine similarity between the input features and the stored mean vectors to classify the input. The performance of this method is not that great as it fails to capture the intra-class variations but it can be a good foundation upon which we can build more sophisticated methods. 

How do you take the intra-class variations into account? I decided that multiple vectors can be used to represent a class. This makes more sense as these multiple vectors can roughly capture the manifold of the class. To decide what vectors to store, I used k-means clustering to cluster the features of the current class and store the cluster centroids as the vectors for the current class. 

<div id="fig1" align="center">
    <img src="/images/maya/maya-01.png" width="80%">
    <!-- <br> -->
    <em>Fig 1. K-means clustering of features of the current class<a href="#ref-1"><sup>[1]</sup></a></em>
</div>

If you now implement a simple inference procedure, where the model inferes using the NCM (Nearest Class Mean) classifier and the above mentioned memory, you will notice that the performance is not that great. Why? I feel there might be two reasons for this. First, every backbone is trained on a specific dataset with specific training procedure. Therefore, all of them will have a bias which can work against or favor certain classes. Second, the backbone was not trained well to separate the classes well. 


```pseudocode
\begin{algorithm}
\caption{Online Continual Learning with NCM and K-Means}
\begin{algorithmic}
\Require Backbone $f$, Memory $M = \{\mathcal{G}_c\}_{c \in \mathcal{C}}$
\State \textbf{Update}(x, y): 
\State $\mathbf{z} \leftarrow f(x)$
\State $\mathcal{G}_y \leftarrow \text{UpdateCluster}(\mathcal{G}_y, \mathbf{z})$
\State \textbf{Infer}(x): 
\State $\mathbf{z} \leftarrow f(x)$
\State $y^* \leftarrow \arg\max_c \text{Score}(\mathbf{z}, \mathcal{G}_c)$
\end{algorithmic}
\end{algorithm}
```

