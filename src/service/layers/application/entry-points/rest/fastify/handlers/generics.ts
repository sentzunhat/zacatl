// Re-export shared schema utilities from common so Fastify-specific imports
// continue to resolve. The implementation lives in common/ and is also
// reachable via the main @sentzunhat/zacatl import for both platforms.
export { makeWithDefaultResponse } from "../../common/schema";
