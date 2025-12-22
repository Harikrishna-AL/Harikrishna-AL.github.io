---
title: Understanding Taylor-Series
date: 2025-12-22
category: Theorems
abstract: Understanding the essence of Taylor-Series with examples.
---

### Introduction

I have seen this series many times in different math textbooks but no one ever explained it's true meaning and neither it was ever useful for me to truly understand it. It was only recently that while reading a research paper, I had to understand why writing a equation as taylor series was helpful to solve the problem. I'll start explaining with an example.

<!-- As show in <a href="#fig1">Figure 1</a> and Shin et al.<a href="#ref-1"><sup>[1]</sup></a> -->

<div id="fig1" align="center">
    <img src="/images/taylor/taylor-01.png" width="80%">
    <!-- <br> -->
    <em>Fig 1. Taylor series approximation of $e^x$ near $x=0$<a href="#ref-1"><sup>[1]</sup></a></em>
</div>

Look at <a href='#fig1'>Figure 1</a>, here the approximated function with the color green seems to match the original function but only near to $x=0$. Few things that we can notice right away: the approximation is a polynomial equation and it is approixmated upto the power of 2. This means that the resultant polynomial funtion is a second order approximation of the original function. By representing a complex function as ploynomial equation makes it easier to compute values which is otherwise hard. Now the question is how do you come up with such an aproximation for any kind of complex function?

<br>

### How to find the approximate function?
Let us take an example where we have to approximate $f(\theta) = cos(\theta)$ and for a second let's assume that it can be approximated as $f(\theta) = c_0 + c_1x + c_2x^2$. Let's try to approximate this function near $\theta=0$. We can simply calculate all $c_0$, $c_1$ and $c_2$ using the first and second order derivates of the original function and substituting that value instead of $f(\theta)$. I'll try to solve it step by step.

$$f(0) = 1$$
$$f(0) = c_0 + c_10 + c_20^2 = 1$$
$$c_0 = 1$$

Now, let's take the first derivative of the function and do the same.
$$\frac{ df }{ d\theta}(0) = -sin(0) = 0$$
$$\frac{ df }{ d\theta}(0) = c_1 + 2c_20 = 0$$
$$c_1 = 0$$

Continuing the same with the second derivative of the function.
$$\frac{ d^2 f }{ d\theta^2 }(0) = -cos(0) = -1$$
$$\frac{ d^2 f }{ d\theta^2 }(0) = 2c_2 = -1$$
$$c_2 = -\frac{1}{2}$$

Thus, we get the approximation $f(\theta) = 1 - \frac{1}{2}\theta^2$. We can continue to get better approximations by increasing the order of the polynomails and computing more derivates to calculate the constants. Which is why taylor series can approximate any function to an $n^{th}$ order near any value.

<br>

### What does it mean visually?
Now that it is clear how can we find such approximations, in order to understand why they work, let's discuss it visually as well. We can think of the derivates of a function as its characterstics. For example the first derivate of a function tell's about it's slope at any particular point, the second derivative tells about the rate of change of the slope of the function and so on. Essentially, what we did it the above section is that we computed different characterstics of the functions to find out those constants. The more characterstics you know about the function, the more constants you can find. Which means as you increase the order to approximations, the function you get is more close to the actual function around that value.

<div id="fig2" align="center">
    <img src="/images/taylor/taylor-02.png" width="80%">
    <!-- <br> -->
    <em>Fig 2. Taylor series approximation of $cos(\theta)$ near $\theta=0$<a href="#ref-1"><sup>[1]</sup></a></em>
</div>

Look at <a href='#fig2'>Figure 2</a>, we can see that $c_0$ helps us find where the function intercepts in the y-axis. $c_1$ helps us find the slope of the function similar to the original function near $\theta=0$. Now, with this we are free to compute $c_2$ which tells how to match the curve of the original function. 

<br>

### References
1. 3Blue1Brown. "Taylor series | Chapter 11, Essence of calculus" YouTube, May 2017, https://www.youtube.com/watch?v=3d6DsjIBzJ4.