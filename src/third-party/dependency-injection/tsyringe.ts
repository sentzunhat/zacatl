/**
 * tsyringe exports
 * Centralized in third-party folder to isolate external integrations.
 * tsyringe throws on load without the Reflect polyfill, so load it first.
 */
import './reflect-metadata';

export { container, singleton, inject } from 'tsyringe';

// Type-only exports
export type { DependencyContainer, InjectionToken } from 'tsyringe';
