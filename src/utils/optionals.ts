/**
 * Represents a value that may or may not be present.
 *
 * This is equivalent to `T | undefined`, commonly used for optional values,
 * especially for function parameters or object properties marked with `?`.
 *
 * @template T - The type of the value.
 */
export type Optional<T> = T | undefined;

/**
 * Represents a value that can either be of type `T` or `null`.
 *
 * This is useful when `null` is used explicitly to indicate the absence of a value,
 * such as in form inputs or nullable database fields.
 *
 * @template T - The type of the value.
 */
export type Nullable<T> = T | null;

/**
 * Represents a value that may be `T`, `null`, or `undefined`.
 *
 * Useful when dealing with values that can be either missing or explicitly set to null.
 * Common in scenarios where both JavaScript's `undefined` and `null` are valid absences.
 *
 * @template T - The type of the value.
 */
export type Maybe<T> = T | null | undefined;
