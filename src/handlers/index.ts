/**
 * Export all API handlers
 */

// Catalog handlers
export { SearchItems } from './catalog/search'

// Inventory handlers
// TODO: Export inventory handlers after migration

// Player handlers
// TODO: Export player handlers after migration  

// Title handlers
// TODO: Export title handlers after migration

/**
 * Map tool names to their handler functions
 */
export const toolHandlers: Record<string, Function> = {
  // Catalog
  "search_items": () => import('./catalog/search').then(m => m.SearchItems),
  
  // TODO: Add other handlers after migration
}