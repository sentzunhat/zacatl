import proxy from "@fastify/http-proxy";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { container } from "tsyringe";
import { Mongoose } from "mongoose";

import { HookHandler, RouteHandler } from "../../application";
import { CustomError } from "../../../../error";
import { Optional } from "../../../../optionals";

export enum ServiceType {
  SERVER = "SERVER",
  GATEWAY = "GATEWAY",
}

export enum ServerVendor {
  FASTIFY = "FASTIFY",
}

type ServerInstance = FastifyInstance;

type ProxyGateway = {
  upstream: string;
  prefix?: string;
};

type ProxiesGateway = Array<ProxyGateway>;

type GatewayService = { proxies: ProxiesGateway };

type ServiceServer = {
  type: ServiceType;
  vendor: ServerVendor;
  instance: ServerInstance;
  gateway?: GatewayService;
};

export enum DatabaseVendor {
  MONGOOSE = "MONGOOSE",
}

type DatabaseInstance = Mongoose;

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

export type ConfigService = {
  name: string;
  server: ServiceServer;
  databases: Array<DatabaseServer>;
};

export enum HandlersType {
  HOOK = "hook",
  ROUTE = "route",
}

type Handlers = RouteHandler | HookHandler;

export const strategiesForServerVendor = {
  [ServerVendor.FASTIFY]: {
    handlers: {
      [HandlersType.ROUTE]: (
        server: FastifyInstance,
        handler: Handlers
      ): void => {
        const route = handler as RouteHandler;

        server.withTypeProvider<ZodTypeProvider>().route({
          url: route.url,
          method: route.method,
          schema: route.schema,
          handler: route.execute.bind(route),
        });

        // console.info(`registered route: ${route.method} ${route.url}`);
      },
      [HandlersType.HOOK]: (
        server: FastifyInstance,
        handler: Handlers
      ): void => {
        const hook = handler as HookHandler;

        server.addHook(hook.name, hook.execute.bind(hook));

        // console.info(`registered hook: ${hook.name}`);
      },
    },
    server: {
      [ServiceType.SERVER]: (_: ServerInstance) => {},
      [ServiceType.GATEWAY]: (
        instance: ServerInstance,
        proxies?: ProxiesGateway
      ) => {
        proxies?.forEach((proxyConf) => {
          instance.register(proxy, {
            upstream: proxyConf.upstream,
            ...(proxyConf.prefix ? { prefix: proxyConf.prefix } : {}),
            http2: false, // Optional: configuration specific to your needs.
          });
        });
      },
    },
  },
};

export const strategiesForDatabaseVendor = {
  [DatabaseVendor.MONGOOSE]: async (input: {
    serviceName: string;
    database: DatabaseInstance;
    connectionString: string;
    onDatabaseConnected?: OnDatabaseConnectedFunction;
  }) => {
    const { serviceName, database, connectionString, onDatabaseConnected } =
      input;

    if (!database || !database.connect) {
      throw new CustomError({
        message: "database instance is not provided",
        code: 500,
        reason: "database instance not provided",
      });
    }

    await database.connect(connectionString, {
      dbName: serviceName,
      autoIndex: true,
      autoCreate: true,
    });

    if (onDatabaseConnected) {
      await onDatabaseConnected(database);
    }

    container.register<typeof database>(database.constructor.name, {
      useValue: database,
    });
  },
};

type StartInput = { port: number };

type RegisterHandlersInput = {
  handlers: Handlers[];
  handlersType: HandlersType;
};

type ServicePort = {
  start: (input: StartInput) => Promise<void>;
  registerHandlers: (input: RegisterHandlersInput) => Promise<void>;
};

export class Service implements ServicePort {
  private name: string;
  private server: ServiceServer;
  private databases: Array<DatabaseServer>;

  constructor({ name, server, databases }: ConfigService) {
    this.name = name;
    this.server = server;
    this.databases = databases;
  }

  public async registerHandlers(input: RegisterHandlersInput): Promise<void> {
    const { handlers, handlersType } = input;

    const registerHandlersFunction =
      strategiesForServerVendor[this.server.vendor].handlers[handlersType];

    if (!registerHandlersFunction) {
      throw new CustomError({
        message: `service vendor ${this.server.vendor} is not supported for ${handlersType} registration`,
        code: 500,
        reason: "service vendor not supported",
        metadata: { vendor: this.server.vendor },
      });
    }

    await Promise.all(
      handlers.map(async (handler) => {
        try {
          registerHandlersFunction(this.server.instance, handler);
        } catch (error: unknown) {
          throw new CustomError({
            message: `failed to register ${handlersType}: ${handler.constructor.name}`,
            code: 500,
            reason: "handler registration failed",
            error: error as Error,
            metadata: { handler: handler.constructor.name },
          });
        }
      })
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
    const configureServerFunction =
      strategiesForServerVendor[this.server.vendor].server[this.server.type];

    if (!configureServerFunction) {
      throw new CustomError({
        message: `service vendor ${this.server.vendor} is not supported for server configuration`,
        code: 500,
        reason: "service vendor not supported",
        metadata: { service: { name: this.name, vendor: this.server.vendor } },
      });
    }

    configureServerFunction(this.server.instance, this.server.gateway?.proxies);
  }

  private async startServer(input: StartInput): Promise<void> {
    const { port } = input;

    try {
      await this.server.instance.listen({
        host: "0.0.0.0",
        port: port,
      });
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

  private async configure(input: StartInput): Promise<void> {
    const { port } = input;

    // await this.configureDatabases();
    await this.configureServer();
    await this.startServer({ port });
  }

  public async start(input: StartInput): Promise<void> {
    const { port } = input;

    await this.configure({ port });
  }
}
