# Desktop Module Migration Spec

**Purpose**: Guide for migrating Desktop app patterns from Ujti to `@sentzunhat/zacatl/desktop`
**Status**: Specification for future migration
**Date**: January 26, 2026

---

## Overview

This spec describes how to migrate the proven Desktop architecture from Ujti UI (where it's being developed and refined) into Zacatl as a reusable module.

**Current State**: Desktop patterns are being developed in Ujti UI repository (Neutralino-based)
**Future State**: `@sentzunhat/zacatl/desktop` module available for any project

---

## Prerequisites

Before migrating Desktop module to Zacatl:

- ✅ Phase 1 (Foundation) complete in Zacatl
- ✅ Bun runtime compatibility working
- ✅ Structured logging adapters ready
- ✅ Desktop patterns proven and stable in Ujti UI
- ✅ IPC communication patterns tested in production

---

## Folder Structure to Create

```
@sentzunhat/zacatl/
├── src/
│   ├── desktop/                        # NEW - Desktop module
│   │   ├── architecture/
│   │   │   ├── desktop-architecture.ts # Base class for desktop apps
│   │   │   └── index.ts
│   │   ├── neutralino/                 # Neutralino adapter
│   │   │   ├── window.ts               # Window management
│   │   │   ├── ipc.ts                  # IPC communication
│   │   │   ├── storage.ts              # Local storage adapter
│   │   │   ├── types.ts                # Neutralino types
│   │   │   └── index.ts
│   │   ├── electron/                   # Future: Electron adapter (placeholder)
│   │   │   └── README.md
│   │   ├── tauri/                      # Future: Tauri adapter (placeholder)
│   │   │   └── README.md
│   │   └── index.ts                    # Main Desktop exports
├── test/
│   ├── unit/desktop/
│   └── integration/desktop/
└── examples/
    └── desktop/                        # Example desktop application
```

---

## Migration Steps

### Step 1: Extract Core Patterns from Ujti UI

Review Ujti UI implementation and extract:

**From Ujti Desktop App**:

- Window lifecycle management
- IPC communication patterns (frontend ↔ backend)
- State synchronization strategies
- Native API integration patterns
- Build and packaging approach

**Key Files to Review in Ujti**:

- `ujti/v2/toold/ui/src/` - Frontend code
- IPC handlers and event listeners
- Neutralino.js integration
- Window configuration and management
- Resource loading patterns

### Step 2: Create Desktop Architecture Base Class

```typescript
// src/desktop/architecture/desktop-architecture.ts
import { logger } from "../../logs";

export interface DesktopConfig {
  windowTitle?: string;
  width?: number;
  height?: number;
  resizable?: boolean;
  fullscreen?: boolean;
}

export abstract class DesktopArchitecture {
  protected config: DesktopConfig;

  constructor(config: DesktopConfig = {}) {
    this.config = {
      windowTitle: "Desktop App",
      width: 800,
      height: 600,
      resizable: true,
      fullscreen: false,
      ...config,
    };
  }

  async start(): Promise<void> {
    try {
      await this.initializeWindow();
      await this.registerIPCHandlers();
      await this.onReady();
      logger.info("Desktop application started");
    } catch (error) {
      logger.error("Failed to start desktop application", { error });
      throw error;
    }
  }

  abstract initializeWindow(): Promise<void>;
  abstract registerIPCHandlers(): void;
  abstract onReady(): Promise<void>;

  async stop(): Promise<void> {
    await this.onShutdown();
    logger.info("Desktop application stopped");
  }

  protected async onShutdown(): Promise<void> {
    // Override in subclass if needed
  }
}
```

### Step 3: Create Neutralino Adapter

```typescript
// src/desktop/neutralino/window.ts
import Neutralino from "@neutralinojs/lib";
import { logger } from "../../../logs";

export class NeutralinoWindow {
  async create(options: {
    title?: string;
    width?: number;
    height?: number;
    resizable?: boolean;
    fullscreen?: boolean;
  }): Promise<void> {
    try {
      await Neutralino.window.setTitle(options.title || "App");

      if (options.width && options.height) {
        await Neutralino.window.setSize({
          width: options.width,
          height: options.height,
        });
      }

      if (options.fullscreen) {
        await Neutralino.window.setFullScreen();
      }

      logger.info("Window created", options);
    } catch (error) {
      logger.error("Failed to create window", { error });
      throw error;
    }
  }

  async show(): Promise<void> {
    await Neutralino.window.show();
  }

  async hide(): Promise<void> {
    await Neutralino.window.hide();
  }

  async close(): Promise<void> {
    await Neutralino.app.exit();
  }

  async minimize(): Promise<void> {
    await Neutralino.window.minimize();
  }

  async maximize(): Promise<void> {
    await Neutralino.window.maximize();
  }

  async center(): Promise<void> {
    await Neutralino.window.center();
  }
}
```

```typescript
// src/desktop/neutralino/ipc.ts
import Neutralino from "@neutralinojs/lib";
import { logger } from "../../../logs";

export type IPCHandler = (data: any) => Promise<any> | any;

export class NeutralinoIPC {
  private handlers: Map<string, IPCHandler> = new Map();

  register(channel: string, handler: IPCHandler): void {
    this.handlers.set(channel, handler);
    logger.info(`IPC handler registered: ${channel}`);
  }

  async init(): Promise<void> {
    Neutralino.events.on("message", async (evt) => {
      const { channel, data } = evt.detail;
      const handler = this.handlers.get(channel);

      if (handler) {
        try {
          const result = await handler(data);
          // Send response back if needed
          await this.send(`${channel}:response`, result);
        } catch (error) {
          logger.error(`IPC handler error: ${channel}`, { error });
          await this.send(`${channel}:error`, { error: error.message });
        }
      } else {
        logger.warn(`No handler for IPC channel: ${channel}`);
      }
    });

    logger.info("IPC initialized");
  }

  async send(channel: string, data: any): Promise<void> {
    await Neutralino.events.broadcast(channel, data);
  }
}
```

```typescript
// src/desktop/neutralino/storage.ts
import Neutralino from "@neutralinojs/lib";
import { logger } from "../../../logs";

export class NeutralinoStorage {
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await Neutralino.storage.getData(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error(`Failed to get storage: ${key}`, { error });
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await Neutralino.storage.setData(key, JSON.stringify(value));
      logger.info(`Storage updated: ${key}`);
    } catch (error) {
      logger.error(`Failed to set storage: ${key}`, { error });
      throw error;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await Neutralino.storage.setData(key, "");
      logger.info(`Storage removed: ${key}`);
    } catch (error) {
      logger.error(`Failed to remove storage: ${key}`, { error });
    }
  }
}
```

### Step 4: Create Neutralino Desktop Implementation

```typescript
// src/desktop/neutralino/index.ts
import Neutralino from "@neutralinojs/lib";
import { DesktopArchitecture, DesktopConfig } from "../architecture";
import { NeutralinoWindow } from "./window";
import { NeutralinoIPC } from "./ipc";
import { NeutralinoStorage } from "./storage";

export class NeutralinoDesktop extends DesktopArchitecture {
  protected window: NeutralinoWindow;
  protected ipc: NeutralinoIPC;
  protected storage: NeutralinoStorage;

  constructor(config: DesktopConfig = {}) {
    super(config);
    this.window = new NeutralinoWindow();
    this.ipc = new NeutralinoIPC();
    this.storage = new NeutralinoStorage();
  }

  async initializeWindow(): Promise<void> {
    await Neutralino.init();
    await this.window.create({
      title: this.config.windowTitle,
      width: this.config.width,
      height: this.config.height,
      resizable: this.config.resizable,
      fullscreen: this.config.fullscreen,
    });
    await this.window.center();
    await this.window.show();
  }

  registerIPCHandlers(): void {
    // Register default handlers
    this.ipc.register("window:close", async () => {
      await this.window.close();
    });

    this.ipc.register("window:minimize", async () => {
      await this.window.minimize();
    });

    this.ipc.register("window:maximize", async () => {
      await this.window.maximize();
    });

    // Initialize IPC
    this.ipc.init();
  }

  async onReady(): Promise<void> {
    // Override in subclass
  }
}
```

### Step 5: Create Main Exports

```typescript
// src/desktop/index.ts
export * from "./architecture";
export * from "./neutralino";

// Platform-specific exports
export { NeutralinoDesktop } from "./neutralino";
```

### Step 6: Update Package Configuration

```json
// package.json
{
  "exports": {
    ".": "./build/index.js",
    "./desktop": "./build/desktop/index.js",
    "./desktop/neutralino": "./build/desktop/neutralino/index.js",
    "./cli": "./build/cli/index.js",
    "./micro-service": "./build/micro-service/index.js"
    // ... other exports
  },
  "peerDependencies": {
    "@neutralinojs/lib": "^5.0.0"
  },
  "peerDependenciesMeta": {
    "@neutralinojs/lib": {
      "optional": true
    }
  }
}
```

### Step 7: Create Example Application

```typescript
// examples/desktop/index.ts
import { NeutralinoDesktop } from "@sentzunhat/zacatl/desktop";
import { logger } from "@sentzunhat/zacatl";

class MyDesktopApp extends NeutralinoDesktop {
  registerIPCHandlers(): void {
    super.registerIPCHandlers();

    // Custom IPC handlers
    this.ipc.register("app:getData", async () => {
      return { message: "Hello from backend!" };
    });

    this.ipc.register("app:saveData", async (data) => {
      await this.storage.set("appData", data);
      return { success: true };
    });
  }

  async onReady(): Promise<void> {
    logger.info("Desktop app is ready!");
  }

  async onShutdown(): Promise<void> {
    logger.info("Cleaning up before shutdown...");
  }
}

new MyDesktopApp({
  windowTitle: "My Desktop App",
  width: 1024,
  height: 768,
}).start();
```

```html
<!-- examples/desktop/ui/index.html -->
<!DOCTYPE html>
<html>
  <head>
    <title>My Desktop App</title>
    <script src="https://cdn.jsdelivr.net/npm/@neutralinojs/lib@5.0.0/neutralino.min.js"></script>
  </head>
  <body>
    <h1>Desktop App</h1>
    <button onclick="getData()">Get Data</button>
    <button onclick="saveData()">Save Data</button>

    <script>
      async function getData() {
        const response = await Neutralino.events.broadcast("app:getData");
        console.log(response);
      }

      async function saveData() {
        await Neutralino.events.broadcast("app:saveData", {
          timestamp: Date.now(),
        });
      }

      Neutralino.init();
    </script>
  </body>
</html>
```

### Step 8: Testing

```typescript
// test/unit/desktop/neutralino/window.test.ts
import { describe, it, expect, vi } from "vitest";
import { NeutralinoWindow } from "@sentzunhat/zacatl/desktop";

describe("NeutralinoWindow", () => {
  it("should create window with options", async () => {
    // Mock Neutralino APIs
    // Test implementation
  });
});
```

### Step 9: Documentation

Update documentation:

- Add Desktop module section to main README
- Create `docs/guides/DESKTOP_GUIDE.md`
- Update examples
- Document Neutralino setup
- Update AGENT_INTEGRATION_SPEC.md

---

## Differences from Ujti Implementation

Document any changes made during migration:

| Aspect           | Ujti Approach           | Zacatl Approach                     |
| ---------------- | ----------------------- | ----------------------------------- |
| Logger           | Console.log             | Structured logging adapters         |
| Runtime          | Bun only                | Node.js + Bun compatible            |
| Architecture     | Custom implementation   | DesktopArchitecture base class      |
| IPC              | Direct Neutralino calls | Abstracted IPC layer                |
| Storage          | Direct storage calls    | Storage adapter interface           |
| Error Handling   | Basic Error throws      | Typed CustomError hierarchy         |
| State Management | Local storage only      | Abstracted storage + optional state |

---

## Success Criteria

- ✅ Desktop module works with Neutralino
- ✅ All Ujti Desktop patterns successfully migrated
- ✅ Example desktop application runs
- ✅ Window management works
- ✅ IPC communication works
- ✅ Tests coverage > 70%
- ✅ Documentation complete
- ✅ No breaking changes to existing Zacatl users
- ✅ Can import via `@sentzunhat/zacatl/desktop`

---

## Timeline Estimate

- **Step 1-2**: Extract and adapt architecture (2 days)
- **Step 3-4**: Implement Neutralino adapter (3 days)
- **Step 5-6**: Integration with Zacatl (1 day)
- **Step 7-8**: Examples and tests (2 days)
- **Step 9**: Documentation (1 day)

**Total**: ~9 days (2 weeks)

---

## Future Enhancements

After initial Neutralino migration:

1. **Electron Adapter** - Create `src/desktop/electron/` module
2. **Tauri Adapter** - Create `src/desktop/tauri/` module
3. **Cross-Platform Builder** - Unified build tool for all platforms
4. **Shared Components** - Abstract window/IPC interfaces for all platforms

---

## Notes

- Keep Desktop module lightweight and platform-agnostic
- Neutralino should be peer dependency (optional)
- Ensure tree-shaking works
- Document platform-specific limitations
- Provide migration path for Electron/Tauri in future

---

**When to execute this migration**: After Phase 1 is complete and Desktop patterns in Ujti UI are proven stable.
