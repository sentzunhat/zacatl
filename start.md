# Zacatl Project Onboarding & Usage

Welcome to Zacatl! This project uses structured YAML documentation for all context, architecture, coding standards, and best practices.

## Getting Started

- **Project context, architecture, and component summaries:**  
  See [`context.yaml`](./context.yaml)
- **Coding standards, naming conventions, and best practices:**  
  See [`guidelines.yaml`](./guidelines.yaml)
- **Design and usage patterns:**  
  See [`patterns.yaml`](./patterns.yaml)
- **MongoDB schema design guidelines:**  
  See [`mongodb.yaml`](./mongodb.yaml)

## Setup

1. Install dependencies:
   ```zsh
   bun i
   ```
2. Run tests:
   ```zsh
   bun test
   ```
3. Explore the codebase, starting from `src/`.

## Contributing

- Follow the guidelines in `guidelines.yaml` and `patterns.yaml`.
- Update `context.yaml`, `guidelines.yaml`, `patterns.yaml`, or `mongodb.yaml` with any new patterns or conventions.
- Place all tests in the `test/` directory, mirroring the `src/` structure.

For any questions, refer to the YAML documentation or contact the maintainers.

---

_This file replaces the previous Markdown documentation. For all details, see the YAML files above._
