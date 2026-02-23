import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Mongoose } from 'mongoose';
import { container } from 'tsyringe';

const dbName = 'sentzunhat-zacatl';
const dbVersion = '8.0.0';
const dbStorageEngine = 'wiredTiger';

let mongoDBMemoryServer: MongoMemoryServer | null = null;

let dbConnection: Connection | null = null;

export const startMongoServerAndSetEnvConnectionString = async (): Promise<void> => {
  if (mongoDBMemoryServer) {
    return;
  }

  try {
    mongoDBMemoryServer = await MongoMemoryServer.create({
      instance: {
        dbName,
        storageEngine: dbStorageEngine,
      },
      binary: {
        version: dbVersion,
      },
    });

    const mongoDBUri = mongoDBMemoryServer.getUri();
    const connectionString = `${mongoDBUri}${dbName}`;

    process.env['MONGO_DB_CONNECTION_STRING'] = connectionString;
    //   console.info(
    //     `MongoDB memory server started. Connection string set to: ${connectionString}`
    //   );
  } catch (error) {
    //   console.error("Failed to start MongoDB memory server:", error);
    throw error;
  }
};

export const connectToMongoServerAndRegisterDependency = async () => {
  const connectionString = process.env['MONGO_DB_CONNECTION_STRING'] ?? '';
  const dbName = 'sentzunhat-zacatl';

  try {
    const conn = await connect(connectionString, {
      dbName,
      autoCreate: true,
      autoIndex: true,
    });

    dbConnection = conn.connection;

    container.register<Mongoose>(Mongoose, {
      useValue: conn,
    });

    // logger.info("Mongo DB memory server connected");
  } catch (error) {
    // logger.error("Mongo DB memory server connection error");
    // console.error(error);
    throw error;
  }
};

export const mongoTeardown = async (): Promise<void> => {
  if (dbConnection) {
    await dbConnection?.db?.dropDatabase();
    await dbConnection.close();
  }

  if (mongoDBMemoryServer) {
    await mongoDBMemoryServer.stop();
  }
};
