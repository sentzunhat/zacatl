import { FastifyInstance } from "fastify";
import { container } from "tsyringe";
import { Mongoose } from "mongoose";
import { Sequelize } from "sequelize";
import { Express } from "express";

import { HookHandler, RouteHandler } from "../../application";
import { CustomError } from "../../../../error";
import { Optional } from "../../../../optionals";
import { ServerAdapter } from "./server-adapter";
import { FastifyAdapter } from "./adapters/fastify-adapter";
import { ExpressAdapter } from "./adapters/express-adapter";
import { PageModule } from "../page";

export enum ServerType {
  SERVER = "SERVER",
  GATEWAY = "GATEWAY",
}

export enum ServerVendor {
  FASTIFY = "FASTIFY",
  EXPRESS = "EXPRESS",
}

type ProxyGateway = {
  upstream: string;
  prefix?: string;
};

type ProxiesGateway = Array<ProxyGateway>;

type GatewayService = { proxies: ProxiesGateway };

type HttpServerConfig = {
  type: ServerType;
  vendor: ServerVendor;
  instance: unknown;
  gateway?: GatewayService;
};

export enum DatabaseVendor {
  MONGOOSE = "MONGOOSE",
  SEQUELIZE = "SEQUELIZE",
}

type DatabaseInstance = Mongoose | Sequelize;

type OnDatabaseConnectedFunction = Optional<
  (dbInstance: DatabaseInstance) => Promise<void> | void
>;

type DatabaseServer = {
  vendor: DatabaseVendor;
  instance: DatabaseInstance;
  connectionString: string;
  /**
   * Optional callback to be invoked after a successful DB connection.
   * Use this to perform extra initialization or plug additional modules.
   */
  onDatabaseConnected?: OnDatabaseConnectedFunction;
};

type ServerPageConfig = {
  devServerUrl?: string;
  staticDir?: string;
  customRegister?: (server: unknown) => Promise<void> | void;
  apiPrefix?: string;
};

export type ConfigServer = {
  name: string;
  server: HttpServerConfig;
  databases: Array<DatabaseServer>;
  page?: ServerPageConfig;
};

export enum HandlersType {
  HOOK = "hook",
  ROUTE = "route",
}

type Handlers = RouteHandler | HookHandler;

export const strategiesForDatabaseVendor = {
  [DatabaseVendor.MONGOOSE]: async (input: {
    serviceName: string;
    database: DatabaseInstance;
    connectionString: string;
    onDatabaseConnected?: OnDatabaseConnectedFunction;
  }) => {
    const { serviceName, database, connectionString, onDatabaseConnected } =
      input;

    const mongoose = database as Mongoose;

    if (!mongoose || !mongoose.connect) {
      throw new CustomError({
        message: "database instance is not provided",
        code: 500,
        reason: "database instance not provided",
      });
    }

    await mongoose.connect(connectionString, {
      dbName: serviceName,
      autoIndex: true,
      autoCreate: true,
    });

    if (onDatabaseConnected) {
      await onDatabaseConnected(mongoose);
    }

    container.register<Mongoose>(mongoose.constructor.name, {
      useValue: mongoose,
    });
  },
  [DatabaseVendor.SEQUELIZE]: async (input: {
    serviceName: string;
    database: DatabaseInstance;
    connectionString: string;
    onDatabaseConnected?: OnDatabaseConnectedFunction;
  }) => {
    const { database, onDatabaseConnected } = input;
    const sequelize = database as Sequelize;

    if (!sequelize || !sequelize.authenticate) {
      throw new CustomError({
        message: "database instance is not provided or invalid",
        code: 500,
        reason: "database instance not provided",
      });
    }

    await sequelize.authenticate();

    if (onDatabaseConnected) {
      await onDatabaseConnected(database);
    }

    container.register<Sequelize>("Sequelize", {
      useValue: sequelize,
    });
  },
};

type StartInput = { port: number };

type RegisterHandlersInput = {
  handlers: Handlers[];
  handlersType: HandlersType;
};

type ServerPort = {
  start: (input: StartInput) => Promise<void>;
  registerHandlers: (input: RegisterHandlersInput) => Promise<void>;
};

export class Server implements ServerPort {
  private name: string;
  private server: HttpServerConfig;
  private databases: Array<DatabaseServer>;
  private page?: ServerPageConfig | undefined;
  private adapter: ServerAdapter;

  constructor({ name, server, databases, page }: ConfigServer) {
    this.name = name;
    this.server = server;
    this.databases = databases;
    this.page = page;

    if (this.server.vendor === ServerVendor.FASTIFY) {
      this.adapter = new FastifyAdapter(
        this.server.instance as FastifyInstance,
      );
    } else if (this.server.vendor === ServerVendor.EXPRESS) {
      this.adapter = new ExpressAdapter(this.server.instance as Express);
    } else {
      throw new Error(`Unsupported server vendor: ${this.server.vendor}`);
    }
  }

  public async registerHandlers(input: RegisterHandlersInput): Promise<void> {
    const { handlers, handlersType } = input;

    await Promise.all(
      handlers.map(async (handler) => {
        try {
          if (handlersType === HandlersType.ROUTE) {
            this.adapter.registerRoute(handler as RouteHandler);
          } else if (handlersType === HandlersType.HOOK) {
            this.adapter.registerHook(handler as HookHandler);
          } else {
            throw new Error(`Handler type ${handlersType} is not supported`);
          }
        } catch (error: unknown) {
          throw new CustomError({
            message: `failed to register ${handlersType}: ${handler.constructor.name}`,
            code: 500,
            reason: "handler registration failed",
            error: error as Error,
            metadata: { handler: handler.constructor.name },
          });
        }
      }),
    );
  }

  public async configureDatabases(): Promise<void> {
    if (!this.databases || this.databases.length === 0) {
      return; // No databases to configure
    }

    for (const database of this.databases) {
      const strategy = strategiesForDatabaseVendor[database.vendor];

      if (!strategy) {
        throw new CustomError({
          message: `database vendor ${database.vendor} is not supported for database configuration`,
          code: 500,
          reason: "database vendor not supported",
          metadata: {
            database: {
              vendor: database.vendor,
            },
          },
        });
      }

      if (!database.connectionString) {
        throw new CustomError({
          message: "database connection string is not provided",
          code: 500,
          reason: "database connection string not provided",
        });
      }

      try {
        await strategy({
          serviceName: this.name,
          database: database.instance,
          connectionString: database.connectionString,
          onDatabaseConnected: database.onDatabaseConnected,
        });
      } catch (error: unknown) {
        throw new CustomError({
          message: `failed to configure database for service "${this.name}"`,
          code: 500,
          reason: "database configuration failed",
          error: error as Error,
          metadata: {
            database: {
              vendor: database.vendor,
              connectionString: database.connectionString,
            },
          },
        });
      }
    }
  }

  private async configureServer(): Promise<void> {
    if (
      this.server.type === ServerType.GATEWAY &&
      this.server.gateway?.proxies
    ) {
      this.server.gateway.proxies.forEach((proxyConf) => {
        this.adapter.registerProxy({
          upstream: proxyConf.upstream,
          prefix: proxyConf.prefix || "/",
          http2: false,
        });
      });
    }
  }

  private async startServer(input: StartInput): Promise<void> {
    const { port } = input;

    try {
      await this.adapter.listen(port);
    } catch (error: unknown) {
      throw new CustomError({
        message: `failed to start service "${this.name}"`,
        code: 500,
        reason: "service start failed",
        error: error as Error,
        metadata: {
          service: {
            name: this.name,
            vendor: this.server.vendor,
            type: this.server.type,
          },
        },
      });
    }
  }

  private async configurePageModule(): Promise<void> {
    if (!this.page) {
      return;
    }

    const { apiPrefix, ...pageProps } = this.page;

    const pageModule = new PageModule({
      root: process.cwd(),
      page: pageProps,
      ...(apiPrefix ? { apiPrefix } : {}),
    });

    await pageModule.register(this.adapter);
  }

  private async configure(input: StartInput): Promise<void> {
    const { port } = input;

    // await this.configureDatabases();
    await this.configureServer();
    await this.configurePageModule();
    await this.startServer({ port });
  }

  public async start(input: StartInput): Promise<void> {
    const { port } = input;

    await this.configure({ port });
  }
}
