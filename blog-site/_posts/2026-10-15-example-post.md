---
title: "Example Post: Every Interactive Piece"
subtitle: "A template showing figures, GIFs, scrollytelling, sliders and live demos. Delete or keep as a reference."
description: "A reference post that shows every layout and interactive component this blog supports, using gradient descent as a toy example."
tags: [template, optimization]
cover: /assets/images/example-post/descent.gif
cover_poster: /assets/images/example-post/descent-still.png
math: true
scripts:
  - /assets/js/demos/learning-rate.js
---

This is a reference post. Everything here is written in plain Markdown with a few one-line snippets for the interactive parts. Open `_posts/2026-10-15-example-post.md` to see the source.

<!--more-->

## A GIF that plays when you scroll to it

Pass a `poster` (a still frame) and the GIF only plays while it's on screen, which saves bandwidth and draws the eye as the reader arrives.

{% include figure.html
   src="/assets/images/example-post/descent.gif"
   poster="/assets/images/example-post/descent-still.png"
   caption="Gradient descent with momentum on a toy loss surface. The **caption supports Markdown**." %}

Add `play="hover"` to play only on hover (or tap on mobile). Add `size="wide"` or `size="full"` to break out of the text column:

{% include figure.html
   src="/assets/images/example-post/contours.png"
   size="wide"
   caption="A wide figure, wider than the text column." %}

## Math

Inline math like $\theta_{t+1} = \theta_t - \eta \nabla L(\theta_t)$ works when the post's front matter has `math: true`. Display math too:

$$
v_{t+1} = \beta v_t - \eta \nabla L(\theta_t), \qquad \theta_{t+1} = \theta_t + v_{t+1}
$$

## Scrollytelling

The graphic sticks while the text scrolls past, and each step swaps what's shown.

<div class="scrolly">
  <div class="scrolly-graphic">
    <img data-key="a" src="{{ '/assets/images/example-post/step-1.png' | relative_url }}" alt="Small learning rate: slow progress">
    <img data-key="b" src="{{ '/assets/images/example-post/step-2.png' | relative_url }}" alt="Good learning rate: converges">
    <img data-key="c" src="{{ '/assets/images/example-post/step-3.png' | relative_url }}" alt="Large learning rate: oscillates">
  </div>
  <div class="scrolly-steps">
    <div class="scrolly-step" data-show="a"><div><strong>Too small.</strong> With a tiny learning rate the optimizer barely moves in 40 steps.</div></div>
    <div class="scrolly-step" data-show="b"><div><strong>About right.</strong> A moderate rate walks smoothly into the basin.</div></div>
    <div class="scrolly-step" data-show="c"><div><strong>Too big.</strong> Large steps overshoot and bounce across the valley.</div></div>
  </div>
</div>

## Before / after slider

Drag (or hover) to compare two images.

<div class="compare fig reveal">
  <img src="{{ '/assets/images/example-post/before.png' | relative_url }}" alt="Plain gradient descent">
  <div class="compare-top"><img src="{{ '/assets/images/example-post/after.png' | relative_url }}" alt="With momentum"></div>
  <div class="compare-handle"></div>
  <span class="compare-label l">Momentum</span><span class="compare-label r">Plain GD</span>
</div>

## A live, interactive demo

Any post can load its own script through `scripts:` in the front matter. This one lives in `assets/js/demos/learning-rate.js`; copy it to build your own.

<div class="demo fig reveal">
  <canvas id="lr-demo"></canvas>
  <div class="demo-controls">
    <label for="lr-slider">Learning rate</label>
    <input id="lr-slider" type="range" min="0.05" max="2.2" step="0.05" value="0.6">
    <output id="lr-value">0.60</output>
    <button id="lr-reset" type="button">Replay</button>
  </div>
</div>

## Code

```python
def sgd_momentum(theta, grad_fn, lr=0.1, beta=0.9, steps=100):
    v = 0.0
    for _ in range(steps):
        v = beta * v - lr * grad_fn(theta)
        theta = theta + v
    return theta
```

## Video

For long clips, MP4 is much smaller than GIF. Use `class="autoplay"` and it plays muted while visible:

```html
<figure class="fig reveal">
  <video class="autoplay" src="/assets/videos/clip.mp4" muted loop playsinline></video>
  <figcaption>Caption here.</figcaption>
</figure>
```

That's everything. Footnotes work too.[^1]

[^1]: Like this one.
