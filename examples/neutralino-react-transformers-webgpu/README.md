# Neutralino + React + Transformers.js + WebGPU Experiment

An experimental desktop app that uses:

- **Neutralinojs** as the lightweight desktop shell
- **React** for the UI
- **Transformers.js** for local AI inference
- **WebKit/WebGPU** as the accelerated browser runtime instead of Electron

This experiment is intentionally opinionated:

- no full Electron runtime
- no remote model API by default
- prefer local inference with a WebGPU-capable browser engine
- fall back to WASM when WebGPU is not available

## Why this exists

The goal is to prototype a smaller desktop footprint than Electron while still keeping:

- a modern React UI
- native-feeling desktop packaging
- browser-side GPU acceleration for model inference
- room to keep most of the AI code in the browser process

## Architecture sketch

```text
Neutralinojs shell
└── loads React UI in a WebKit-based webview
    └── React app initializes Transformers.js
        ├── WebGPU backend when available
        └── WASM fallback when WebGPU is unavailable
```

## What this experiment should prove

1. Neutralino can replace Electron for the desktop wrapper.
2. React can own the UI without needing a heavyweight desktop shell.
3. Transformers.js can run locally with GPU acceleration when the browser engine exposes WebGPU.
4. WebKit/Safari-based runtimes are good enough for a real prototype path.

## Research notes

- Transformers.js supports `device: 'webgpu'` in the browser.
- WebKit ships WebGPU in Safari 26 and Safari Technology Preview, which makes WebKit-based shells a realistic target for this experiment.
- Because WebGPU is still not universal, this experiment should keep a graceful fallback path.

Sources:

- [Transformers.js WebGPU guide](https://github.com/huggingface/transformers.js/blob/main/packages/transformers/docs/source/guides/webgpu.md)
- [WebKit WebGPU demo page](https://webkit.org/demos/webgpu/)
- [WebKit: WebGPU in Safari 26 beta](https://webkit.org/blog/16993/news-from-wwdc25-web-technology-coming-this-fall-in-safari-26-beta/)

## Suggested next implementation steps

- scaffold a Neutralino app shell
- add a React frontend workspace
- wire a local inference service that can select `webgpu` or `wasm`
- document the exact browser/runtime matrix to test on macOS

