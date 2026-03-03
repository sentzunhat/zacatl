/**
 * Service Port for Greeting Domain
 *
 * This is a PORT (interface) in the hexagonal architecture.
 * The adapter (implementation) will implement this interface.
 *
 * The application layer only knows about this interface, not the specific implementation.
 */

import type { Greeting, CreateGreetingInput } from '../../models/greeting';

export interface GreetingServicePort {
  /**
   * Get a greeting by its ID
   */
  getGreeting(id: string): Promise<Greeting | null>;

  /**
   * Get all greetings, optionally filtered by language
   */
  getAllGreetings(language?: string): Promise<Greeting[]>;

  /**
   * Create a new greeting with validation
   */
  createGreeting(input: CreateGreetingInput): Promise<Greeting>;

  /**
   * Delete a greeting by ID
   */
  deleteGreeting(id: string): Promise<boolean>;

  /**
   * Get a random greeting for a given language
   */
  getRandomGreeting(language: string): Promise<Greeting | null>;
}
