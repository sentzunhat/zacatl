/**
 * Greeting Service (Domain Service)
 *
 * This is a domain service that orchestrates business logic.
 * It depends on the GreetingRepositoryPort (interface), not a concrete implementation.
 *
 * This service can be used with ANY repository implementation (Mongoose, In-Memory, etc.)
 * as long as it implements the GreetingRepositoryPort interface.
 */

import { inject, singleton } from '@sentzunhat/zacatl/third-party/dependency-injection/tsyringe';
import type { Greeting, CreateGreetingInput, UpdateGreetingInput } from '../../entities/greeting';
import { GreetingRepositoryAdapter } from '../../../infrastructure/greetings/repositories/greeting/adapter';
import type { GreetingServicePort } from './port';

@singleton()
export class GreetingServiceAdapter implements GreetingServicePort {
  constructor(
    @inject(GreetingRepositoryAdapter)
    private readonly greetingRepository: GreetingRepositoryAdapter,
  ) {}

  async getGreetingById(id: string): Promise<Greeting | null> {
    return this.greetingRepository.findById(id);
  }

  async getAllGreetings(language?: string): Promise<Greeting[]> {
    if (language) {
      return this.greetingRepository.findByLanguage(language);
    }

    return this.greetingRepository.findAll();
  }

  async createGreeting(input: CreateGreetingInput): Promise<Greeting> {
    if (!input.message || input.message.trim().length === 0) {
      throw new Error('Greeting message cannot be empty');
    }

    if (!input.language || input.language.trim().length === 0) {
      throw new Error('Language is required');
    }

    const normalizedInput: CreateGreetingInput = {
      ...input,
      language: input.language.toLowerCase(),
    };

    return this.greetingRepository.create(normalizedInput);
  }

  async deleteGreeting(id: string): Promise<boolean> {
    const exists = await this.greetingRepository.findById(id);
    if (!exists) {
      throw new Error(`Greeting with id ${id} not found`);
    }

    const deleted = await this.greetingRepository.delete(id);
    return deleted !== null;
  }

  async getRandomGreeting(language: string): Promise<Greeting | null> {
    const greetings = await this.greetingRepository.findByLanguage(language.toLowerCase());

    if (greetings.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * greetings.length);
    return greetings[randomIndex] ?? null;
  }

  async updateGreeting(id: string, input: UpdateGreetingInput): Promise<Greeting> {
    const normalizedInput: UpdateGreetingInput = {
      ...input,
      ...(input.language !== undefined ? { language: input.language.toLowerCase() } : {}),
    };

    const updated = await this.greetingRepository.update(id, normalizedInput);
    if (!updated) {
      throw new Error(`Greeting with id ${id} not found`);
    }

    return updated;
  }
}
