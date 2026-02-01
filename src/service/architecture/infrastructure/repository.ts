/**
 * IRepository<T> - Generic Repository Interface
 *
 * Provides a standard contract for data persistence across any source:
 * - SQL databases (SQLite, PostgreSQL, MySQL)
 * - NoSQL databases (MongoDB, Redis)
 * - File systems (JSON, YAML, CSV)
 * - Message queues
 * - External APIs
 *
 * Implement this interface for your specific data source and register through Service architecture.
 *
 * @example
 * ```typescript
 * class UserRepository implements IRepository<User> {
 *   async findById(id: string): Promise<User | null> { ... }
 *   async findMany(filter?: Record<string, unknown>): Promise<User[]> { ... }
 *   async create(data: Partial<User>): Promise<User> { ... }
 *   async update(id: string, data: Partial<User>): Promise<User | null> { ... }
 *   async delete(id: string): Promise<boolean> { ... }
 *   async exists(id: string): Promise<boolean> { ... }
 * }
 *
 * // Register through Service
 * const service = new Service({
 *   architecture: {
 *     infrastructure: { repositories: [UserRepository] }
 *   }
 * });
 * ```
 */
export interface IRepository<T> {
  /**
   * Find a single record by unique identifier
   * @param id - Unique identifier
   * @returns Record or null if not found
   */
  findById(id: string): Promise<T | null>;

  /**
   * Find multiple records with optional filtering
   * @param filter - Key-value pairs to filter by (AND logic)
   * @returns Array of records (empty if none match)
   */
  findMany(filter?: Record<string, unknown>): Promise<T[]>;

  /**
   * Create a new record
   * @param data - Partial record data
   * @returns Created record with all fields populated
   */
  create(data: Partial<T>): Promise<T>;

  /**
   * Update an existing record
   * @param id - Record identifier
   * @param data - Partial data to update
   * @returns Updated record or null if not found
   */
  update(id: string, data: Partial<T>): Promise<T | null>;

  /**
   * Delete a record
   * @param id - Record identifier
   * @returns True if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;

  /**
   * Check if a record exists
   * @param id - Record identifier
   * @returns True if exists, false otherwise
   */
  exists(id: string): Promise<boolean>;
}
