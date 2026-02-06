/**
 * Mongoose Implementation of GreetingRepository
 */

import { singleton } from "tsyringe";
import type { GreetingRepositoryPort } from "../../domain/ports/greeting-repository.port";
import type {
  Greeting,
  CreateGreetingInput,
} from "../../domain/models/greeting";
import { GreetingModel } from "../models/greeting.model";

@singleton()
export class GreetingRepositoryAdapter implements GreetingRepositoryPort {
  private toDomain(doc: any): Greeting {
    return {
      id: doc._id?.toString(),
      message: doc.message,
      language: doc.language,
      createdAt: doc.createdAt,
    };
  }

  async findById(id: string): Promise<Greeting | null> {
    const doc = await GreetingModel.findById(id);
    return doc ? this.toDomain(doc) : null;
  }

  async findAll(): Promise<Greeting[]> {
    const docs = await GreetingModel.find().sort({ createdAt: -1 });
    return docs.map((doc) => this.toDomain(doc));
  }

  async findByLanguage(language: string): Promise<Greeting[]> {
    const docs = await GreetingModel.find({ language }).sort({ createdAt: -1 });
    return docs.map((doc) => this.toDomain(doc));
  }

  async create(input: CreateGreetingInput): Promise<Greeting> {
    const doc = await GreetingModel.create(input);
    return this.toDomain(doc);
  }

  async delete(id: string): Promise<boolean> {
    const result = await GreetingModel.findByIdAndDelete(id);
    return result !== null;
  }
}
