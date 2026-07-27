import type { DomainPort } from './domain';

/**
 * Marker contract for domain providers.
 *
 * Structurally identical to `DomainPort` today, but kept as a distinct type
 * so `layers.domain.providers` and `layers.domain.services` (see
 * `DomainProviders`/`DomainServices` in `../types`) read as separate
 * semantic categories in consumer config, even though both currently accept
 * any `DomainPort` implementation. Extend this interface if providers ever
 * need capabilities services don't.
 */
export interface ProviderPort extends DomainPort {}
