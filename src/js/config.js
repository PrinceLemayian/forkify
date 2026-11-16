/**
 * Config Module
 * @module config
 */

/**
 * Base URL for the Forkify recipe API (v2). Recipe IDs are appended directly to this string.
 * @constant
 * @type {string}
 */
export const API_URL = 'https://forkify-api.jonas.io/api/v2/recipes/';

/**
 * Maximum time in seconds before a fetch request is aborted.
 * @constant
 * @type {number}
 * @default 10
 */
export const TIMEOUT_SEC = 10;

/**
 * Number of search results displayed per page
 * @constant
 * @type {number}
 * @default 10
 */
export const RES_PER_PAGE = 10;

/**
 * Personal API key: register at the Forkify API site to get your own
 * @constant
 * @type {string}
 */
export const KEY = '83413f78-a598-4bd9-a057-d464e46f75b7';

/**
 * Seconds before the add-recipe modal closes automatically after a successful upload
 * @constant
 * @type {number}
 * @default 2.5
 */
export const MODAL_CLOSE_SEC = 2.5;
