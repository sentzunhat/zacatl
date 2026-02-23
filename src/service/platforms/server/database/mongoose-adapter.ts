import { Mongoose } from "mongoose";

import { CustomError } from "@zacatl/error";

import type { DatabaseServerPort, DatabaseConfig } from "./port";
import { getContainer } from "../../../../dependency-injection/container";


export class MongooseAdapter implements DatabaseServerPort {
  async connect(serviceName: string, config: DatabaseConfig): Promise<void> {
    const { instance, connectionString, onDatabaseConnected } = config;

    const getMongoDbName = (uri: string): string | undefined => {
      const match = uri.match(/^mongodb(?:\+srv)?:\/\/[^/]+\/([^?]+)(\?|$)/);
      return match?.[1] != null ? decodeURIComponent(match[1]) : undefined;
    };

    const mongoose = instance as Mongoose;

    if (mongoose == null || typeof mongoose.connect !== "function") {
      throw new CustomError({
        message: "database instance is not provided",
        code: 500,
        reason: "database instance not provided",
      });
    }

    const dbName = getMongoDbName(connectionString) ?? serviceName;

    await mongoose.connect(connectionString, {
      dbName,
      autoIndex: true,
      autoCreate: true,
    });

    if (onDatabaseConnected != null) {
      await onDatabaseConnected(mongoose);
    }

    getContainer().register(Mongoose, {
      useValue: mongoose,
    });
  }

  async disconnect(): Promise<void> {
    // Implement disconnect if needed
  }
}
