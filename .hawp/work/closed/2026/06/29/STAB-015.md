# STAB-015 — Make Neutralino WebGPU experiment scaffold runnable

Input: |
  The Neutralino + React + Transformers.js + WebGPU experiment scaffold now exists under `examples/neutralino-react-transformers-webgpu/`, but it only documents the idea. The next compoundable step is to make it minimally runnable so the experiment can prove a real startup path.

Context: |
  This branch is a stabilization branch. The scaffold should stay small and focused: no feature expansion, no architecture rewrite, and no full desktop build system unless needed for proof-of-life.

Mission: |
  Turn the experiment scaffold into a minimal runnable prototype with a clear start command and a verification path that proves the app can launch locally.

Constraints: |
  Keep the change narrow to the experiment folder and any minimal repo wiring it needs. Do not broaden into a full product feature, redesign, or unrelated example cleanup. Preserve the existing Neutralino/WebGPU intent and avoid speculative platform work.

Output: |
  A plan-ready work item that can be implemented in a small commit, with exact validation commands for launch/proof-of-life.
