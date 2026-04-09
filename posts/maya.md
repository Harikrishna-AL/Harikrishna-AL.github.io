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