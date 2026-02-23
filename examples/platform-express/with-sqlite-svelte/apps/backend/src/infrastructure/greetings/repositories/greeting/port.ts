/**
 * Repository Port for Greeting Entity
 *
 * This is a PORT (interface) in the hexagonal architecture.
 * Different ADAPTERS (Mongoose, Sequelize, In-Memory) will implement this interface.
 *
 * The domain layer only knows about this interface, not the specific implementation.
 */

import type { Greeting, CreateGreetingInput } from '../../../../domain/models/greeting';

export interface GreetingRepositoryPort {
  /**
   * Find a greeting by its ID
   */
  findById(id: string): Promise<Greeting | null>;

  /**
   * Find all greetings, optionally filtered by language
   */
  findAll(filter?: { language?: string }): Promise<Greeting[]>;

  /**
   * Create a new greeting
   */
  create(input: CreateGreetingInput): Promise<Greeting>;

  /**
   * Delete a greeting by ID
   */
  delete(id: string): Promise<Greeting | null>;
}
