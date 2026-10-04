/** Backwards-compatible token exports; definitions live beside their owners. */
export { ServiceContainerToken } from './tokens/service';
export {
  LayerContainerScopesToken,
  LayersConfigToken,
  type LayerContainerScopes,
} from './layers/tokens';
export { ApplicationConfigToken, ApplicationContainerToken } from './layers/application/tokens';
export { DomainConfigToken, DomainContainerToken } from './layers/domain/tokens';
export {
  InfrastructureConfigToken,
  InfrastructureContainerToken,
} from './layers/infrastructure/tokens';
export { PlatformsConfigToken } from './platforms/tokens';
