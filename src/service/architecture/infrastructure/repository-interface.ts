/**
 * Generic repository interface for any data source (Mongoose, Redis, SQL, etc.)
 * Allows flexible persistence without tying to a specific ORM
 */
export interface IRepository<T> {
  /**
   * Find a single record by ID
   */
  findById(id: string): Promise<T | null>;

  /**
   * Find multiple records with optional filtering
   */
  findMany(filter?: Record<string, unknown>): Promise<T[]>;

  /**
   * Create a new record
   */
  create(data: Partial<T>): Promise<T>;

  /**
   * Update an existing record
   */
  update(id: string, data: Partial<T>): Promise<T | null>;

  /**
   * Delete a record
   */
  delete(id: string): Promise<boolean>;

  /**
   * Check if a record exists
   */
  exists(id: string): Promise<boolean>;
}
