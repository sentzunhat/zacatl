# Zacatl

[![npm version](https://img.shields.io/npm/v/@sentzunhat/zacatl.svg)](https://www.npmjs.com/package/@sentzunhat/zacatl)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](https://www.typescriptlang.org/)

A blazing fast, minimal, and straightforward microservice framework for Node.js, designed for rapid development of high-performance APIs and distributed systems. Zacatl provides a clean, modular architecture with robust typing support, letting you focus on business logic instead of infrastructure concerns.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Fastify-based HTTP server**: Ultra-fast routing and extensibility
- **Mongoose integration**: Easy MongoDB data modeling and repository pattern
- **Modular architecture**: Clean separation of application, domain, infrastructure, and platform layers
- **Dependency injection**: Powered by `tsyringe` for testability and flexibility
- **Gateway support**: Proxy requests to upstream services with minimal setup
- **Internationalization (i18n)**: Built-in support for multiple locales
- **Comprehensive error handling**: Custom error classes and route error utilities
- **Type-safe route handlers**: Strongly-typed REST entry points using Zod and Fastify
- **Testing utilities**: Vitest configuration and helpers for fast, isolated unit tests

## Installation

```bash
npm install @sentzunhat/zacatl
# or
yarn add @sentzunhat/zacatl
# or
bun install @sentzunhat/zacatl
```

## Usage

### Basic Setup

```typescript
import Fastify from "fastify";
import { MicroService } from "@sentzunhat/zacatl";

const fastifyApp = Fastify();

const microservice = new MicroService({
  architecture: {
    application: {
      entryPoints: {
        rest: {
          hookHandlers: [], // Add hook handler classes
          routeHandlers: [], // Add route handler classes
        },
      },
    },
    domain: { providers: [] }, // Add domain provider classes
    infrastructure: { repositories: [] }, // Add repository classes
    service: {
      name: "my-service",
      server: {
        type: "SERVER",
        vendor: "FASTIFY",
        instance: fastifyApp,
      },
      databases: [
        // Example for MongoDB:
        // {
        //   vendor: "MONGOOSE",
        //   instance: new Mongoose(),
        //   connectionString: "mongodb://localhost/mydb",
        // }
      ],
    },
  },
});

await microservice.start({ port: 9000 });
```

### Creating Route Handlers

```typescript
import { z } from "zod";
import { GetRouteHandler } from "@sentzunhat/zacatl";

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

type User = z.infer<typeof UserSchema>;

class GetUserHandler extends GetRouteHandler<unknown, User, unknown> {
  constructor() {
    super({
      url: "/users/:id",
      schema: {
        response: {
          200: UserSchema,
        },
      },
    });
  }

  async handler(request, reply): Promise<User> {
    const userId = request.params.id;
    // Fetch user from database, etc.
    return {
      id: userId,
      name: "John Doe",
      email: "john@example.com",
    };
  }
}
```

### Database Integration

```typescript
import { Schema } from "mongoose";
import { singleton } from "tsyringe";
import { BaseRepository } from "@sentzunhat/zacatl";

interface Product {
  name: string;
  price: number;
  description: string;
}

const productSchema = new Schema<Product>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
});

@singleton()
export class ProductRepository extends BaseRepository<Product> {
  constructor() {
    super({ name: "Product", schema: productSchema });
  }

  async findByName(name: string) {
    return this.model.findOne({ name }).exec();
  }
}
```

## Architecture

The framework is organized into four main layers:

- **Application**: REST entry points (routes and hooks) and i18n configuration
- **Domain**: Business logic providers and services
- **Infrastructure**: Repositories and external dependencies
- **Platform**: Service startup, database connections, and server configuration

Each layer is designed to be extensible and testable, supporting clean code principles.

## Configuration

- **Localization**: Place locale JSON files in `src/locales/` (e.g., `en.json`)
- **Environment Variables**:
  - `SERVICE_NAME` - Service name
  - `NODE_ENV` - Environment (development, production, test)
  - `CONNECTION_STRING` - Database connection string

## API Reference

### Core Components

- `MicroService`: Central orchestrator for all architecture layers
- `AbstractRouteHandler`: Base class for all route handlers
- `BaseRepository`: Base class for MongoDB repositories
- `CustomError`: Base class for typed error handling

## Testing

Run tests with:

```bash
npm run test
# or
npm run test:coverage
```

Test configuration uses Vitest with in-memory MongoDB for isolated tests.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

MIT License © 2025 Sentzunhat - See the [LICENSE](./LICENSE) file for details.

---

Built by [Diego Beltran](https://sentzunhat.com) with [Fastify](https://fastify.io/), [Mongoose](https://mongoosejs.com/), and [tsyringe](https://github.com/microsoft/tsyringe).

For questions or issues, please visit [GitHub](https://github.com/sentzunhat/zacatl/issues).
