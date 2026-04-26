/**
 * tsyringe exports
 * Centralized in third-party folder to isolate external integrations.
 */
export { container, singleton, inject } from 'tsyringe';

// Type-only exports
export type { DependencyContainer, InjectionToken } from 'tsyringe';
