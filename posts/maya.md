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
    <img src="/images/maya/research_key_fig.svg" width="80%">
    <!-- <br> -->
    <em>Fig 1. K-means clustering of features of the current class to capture the approximate manifold of the class</em>
</div>

If you now implement a simple inference procedure, where the model inferes using the NCM (Nearest Class Mean) classifier and the above mentioned memory, you will notice that the performance is not that great. Why? I feel there might be two reasons for this. First, every backbone is trained on a specific dataset with specific training procedure. Therefore, all of them will have a bias which can work against or favor certain classes. Second, the backbone was not trained well to separate the classes well. 


<!-- ```pseudocode
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
\end{algorithm} -->

```pseudocode
\begin{algorithm}
\caption{Baseline Continual Learning: NCM + K-Means}
\begin{algorithmic}
\Require Backbone $f$, Mean Prototypes $\{\mu_c\}$, Cluster Centroids $\{V_c\}$
\State \textbf{Update}(x, y):
\State $\mathbf{z} \leftarrow f(x)$ \Comment{Extract features}
\State $\mu_y \leftarrow \text{MovingAverage}(\mu_y, \mathbf{z})$ \Comment{Update Global Class Mean (NCM)}
\State $V_y \leftarrow \text{StreamKMeans}(V_y, \mathbf{z})$ \Comment{Update Local Cluster Centroids}
\State \textbf{Infer}(x):
   \State $\mathbf{z} \leftarrow f(x)$
   \State $S_{ncm} \leftarrow \text{CosineSim}(\mathbf{z}, \mu_c)$ \Comment{Global similarity score}
   \State $S_{km} \leftarrow \max_{v \in V_c} \text{CosineSim}(\mathbf{z}, v)$ \Comment{Local similarity (Nearest Cluster)}
   \State $y^* \leftarrow \arg\max_c (\alpha \cdot S_{km} + (1 - \alpha) \cdot S_{ncm})$ \Comment{Weighted voting}
   \end{algorithmic}
   \end{algorithm}
```


<br>

How to solve the first problem? One can do that by removing the variations in the features caused by the backbone's bias. In order to do that, a matrix $P$ is computed using the formula $P = (A + \lambda I)^{-1}B$. Here $A$ represents the backbone's feature correlations (its bias), and $B$ represents the class-to-target mappings. Projecting the features using this matrix $P$ removes the backbone's bias and helps in better classification. 

<br>

To solve the second problem, we can use the concept of **Equiangular Tight Frame (ETF)**<a href="#ref-1"><sup>[1]</sup></a>. ETF is a set of vectors that are equally separated from each other. These vectors are used as targets for the features of the current class and since they are equi-distant, there is no confusion between the classes. All the NCM vectors and the vectors used to compute the $A$ and $B$ are projected onto the ETF space. 

<div id="fig2" align="center">
    <img src="/images/maya/etf_projection_fig.svg" width="80%">
    <!-- <br> -->
    <em>Fig 2. ETF targets for the features of the current class<a href="#ref-1"><sup>[1]</sup></a></em>
</div>

<br>

Now to infer, we use the ETF projected NCM vectors and the projected vectors from the memory to get two output distributions. Both of these distributions are then combined using a weighted average to get the final output distribution. 

<!-- ```pseudocode
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
``` -->

```pseudocode
\begin{algorithm}
\caption{MAYA: Manifold-Aligned Yielding Architecture}
\begin{algorithmic}
\Require Backbone $f$, ETF Targets $W_{etf}$, Accumulators $A, B$, Memory $\mathcal{M} = \{\mathcal{G}_c\}_{c \in \mathcal{C}}$
\State \textbf{Update}(x, y):
\State $\mathbf{z} \leftarrow f(x)$ \Comment{Extract frozen features}
\State $\mathcal{G}_y \leftarrow \text{StreamKMeans}(\mathcal{G}_y, \mathbf{z})$ \Comment{Update local episodic manifold}
\State $A \leftarrow A + \mathbf{z}\mathbf{z}^\top, \quad B \leftarrow B + \mathbf{z}\mathbf{w}_y^\top$ \Comment{Recursive stats for class-to-ETF
      mapping}
\State $P \leftarrow (A + \lambda I)^{-1}B$ \Comment{Closed-form projection matrix solve}
\State \textbf{Infer}(x):
\State $\mathbf{z} \leftarrow f(x)$
\State $\mathbf{z}' \leftarrow \text{Normalize}(\mathbf{z}P)$ \Comment{Map native manifold to ETF space}
\State $S_{local} \leftarrow \text{LogSumExp}(\text{Sim}(\mathbf{z}', \text{Nodes in } \mathcal{G}_c))$ \Comment{System 1: Episodic Density}
\State $S_{global} \leftarrow \text{CosineSim}(\mathbf{z}', \mathbf{w}_c)$ \Comment{System 2: Global ETF Alignment}
\State $y^* \leftarrow \arg\max_c (\alpha \cdot S_{local} + (1 - \alpha) \cdot S_{global})$ \Comment{Dual-system vote}
\end{algorithmic}
\end{algorithm}
```

<br>

### Results

Maya was tested on class-incremental learning benchmarks and achieved competitive results with state-of-the-art methods. split-ImageNet-R, split-TinyImageNet and split-ObjectNet are the benchmarks used to evaluate the performance of Maya. 

<!-- add table here and add column headings-->
<table>
    <tr>
        <td><b>Benchmark</b></td>
        <td><b>Backbone</b></td>
        <td><b>Avg. Accuracy (%)</b></td>
        <td><b>Forgetting (%)</b></td>
        <td><b>NCM Acc. (%)</b></td>
    </tr>
    <tr>
        <td>split-ImageNet-R</td>
        <td>ResNet-50</td>
        <td>51.32</td>
        <td>6.34</td>
        <td>40.69</td>
    </tr>
    <tr>
        <td>split-ImageNet-R</td>
        <td>Siglip 2</td>
        <td>94.98</td>
        <td>1.54</td>
        <td>95.25</td>
    </tr>
    <tr>
        <td>split-TinyImageNet</td>
        <td>ResNet-50</td>
        <td>70.34</td>
        <td>8.06</td>
        <td>63.29</td>
    </tr>
    <tr>
        <td>split-TinyImageNet</td>
        <td>Siglip 2</td>
        <td>88.41</td>
        <td>3.61</td>
        <td>86.11</td>
    </tr>
    <tr>
        <td>split-ObjectNet</td>
        <td>ResNet-50</td>
        <td>21.65</td>
        <td>8.04</td>
        <td>19.41</td>
    </tr>
    <tr>
        <td>split-ObjectNet</td>
        <td>Siglip 2</td>
        <td>78.67</td>
        <td>6.8</td>
        <td>76.59</td>
    </tr>
</table>

In most of these experiments, MAYA outperforms the baseline NCM method at the same time performs really close to the upper bound (Replay + Linear Classifier).

<br>

### Conclusion

MAYA is a simple yet effective method for online continual learning. It achieves this by using a two-system approach. One system infers via a memory made using K-means clustering of the features of the current class. The other system projects the features onto the ETF space and infers using the ETF projected NCM vectors and the projected vectors from the memory. Together, these two systems achieve competitive results with state-of-the-art methods. 

<br>

### References

1. Rethinking Continual Learning with Progressive Neural Collapse. https://arxiv.org/abs/2505.24254

