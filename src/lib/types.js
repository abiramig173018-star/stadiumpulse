/**
 * Shared shape definitions used across lib/ and components/. Plain JSDoc
 * typedefs rather than a TypeScript migration — keeps the project's actual
 * complexity honest for its scope, while still giving editors real
 * autocomplete/type-checking on these objects.
 *
 * @typedef {Object} Zone
 * @property {string} id
 * @property {string} name
 * @property {number} capacity
 * @property {number} occupancy
 * @property {number} ratio - occupancy / capacity, 0 to 1
 * @property {"low"|"medium"|"high"|"critical"} severity
 * @property {"rising"|"falling"|"steady"} trend
 * @property {boolean} [spiked]
 *
 * @typedef {Object} Alert
 * @property {string} id
 * @property {Date} timestamp
 * @property {string|null} zoneId
 * @property {string} zoneName
 * @property {"green"|"amber"|"red"|"info"} level
 * @property {string} message
 *
 * @typedef {Object} IncidentAnalysis
 * @property {string} zone
 * @property {"low"|"medium"|"high"|"critical"} severity
 * @property {string} category
 * @property {string} recommendedAction
 * @property {string} broadcastMessage
 */

export {};
