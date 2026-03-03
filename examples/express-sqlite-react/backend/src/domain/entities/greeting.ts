/**
 * Greeting Entity
 *
 * A simple domain model representing a greeting message.
 * This demonstrates how domain models remain technology-agnostic
 * and can be used across different persistence layers (Mongoose, Sequelize, etc.)
 */

export interface Greeting {
  id: string;
  message: string;
  language: string;
  createdAt: Date;
}

/**
 * Input for creating a new greeting
 */
export interface CreateGreetingInput {
  message: string;
  language: string;
}
