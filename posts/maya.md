---
title: Approaching Online Continual Learning with MAYA
date: 2025-12-22
category: Theorems
abstract: 'MAYA: Manifold-Aligned Yielding Architecture for Online Continual Learning'
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

    - Task-Incremental Learning (TIL): The model is given a new task at each time step, and it must learn to perform the new task without forgetting the previous tasks. During the inference process, the task id is provided to the model.

    - Class-Incremental Learning (CIL): The model is given a new task at each time step, and it must learn to perform the new task without forgetting the previous tasks. During the inference process, the task id is not provided to the model.

    - Domain-Incremental Learning (DIL): Unlike the previous two settings, in DIL, the data distribution changes over time, but the task remains the same. The model must learn to adapt to the new distribution without forgetting the previous distributions.

Class-Incremental and Domain-Incremental learning are the most challenging settings in CL. I'll be focusing on CIL for the rest of the post.

<br>

### Methodology

If we think of the CL problem keeping the backbone fixed, then the problem reduces to learning such a classifier that can continually learn. One of the most intuitive way to solve this problem is to store mean vectors of the previous classes and compute the cosine similarity between the input features and the stored mean vectors to classify the input. The performance of this method is not that great as it fails to capture the intra-class variations but it can be a good foundation upon which we can build more sophisticated methods. 