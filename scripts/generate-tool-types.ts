#!/usr/bin/env node
/**
 * Script to generate TypeScript types from tool input schemas
 */

import { writeFileSync } from 'fs';
import { join } from 'path';
import { Tool } from "@modelcontextprotocol/sdk/types.js";

// Import all tools
import * as catalogTools from '../src/tools/catalog/index.js';
import * as inventoryTools from '../src/tools/inventory/index.js';
import * as playerTools from '../src/tools/player/index.js';
import * as titleTools from '../src/tools/title/index.js';

import { generateToolInputTypes } from '../src/utils/schema-types.js';

// Collect all tools
const allTools: Tool[] = [
  // Catalog tools
  catalogTools.SEARCH_ITEMS_TOOL,
  catalogTools.CREATE_DRAFT_ITEM_TOOL,
  catalogTools.UPDATE_DRAFT_ITEM_TOOL,
  catalogTools.DELETE_ITEM_TOOL,
  catalogTools.PUBLISH_DRAFT_ITEM_TOOL,
  catalogTools.GET_ITEM_TOOL,
  catalogTools.UPDATE_CATALOG_CONFIG_TOOL,
  catalogTools.GET_CATALOG_CONFIG_TOOL,
  catalogTools.BATCH_CREATE_DRAFT_ITEMS_TOOL,
  
  // Inventory tools
  inventoryTools.ADD_INVENTORY_ITEMS_TOOL,
  inventoryTools.GET_INVENTORY_ITEMS_TOOL,
  inventoryTools.GET_INVENTORY_COLLECTION_IDS_TOOL,
  inventoryTools.DELETE_INVENTORY_ITEMS_TOOL,
  inventoryTools.SUBTRACT_INVENTORY_ITEMS_TOOL,
  inventoryTools.UPDATE_INVENTORY_ITEMS_TOOL,
  inventoryTools.EXECUTE_INVENTORY_OPERATIONS_TOOL,
  inventoryTools.GRANT_ITEMS_TO_USERS_TOOL,
  
  // Player tools
  playerTools.GET_TITLE_PLAYER_ACCOUNT_IDS_FROM_PLAYFAB_IDS_TOOL,
  playerTools.GET_ALL_SEGMENTS_TOOL,
  playerTools.GET_PLAYERS_IN_SEGMENTS_TOOL,
  playerTools.BAN_USERS_TOOL,
  playerTools.REVOKE_ALL_BANS_FOR_USER_TOOL,
  playerTools.GET_USER_ACCOUNT_INFO_TOOL,
  playerTools.GET_USER_DATA_TOOL,
  playerTools.UPDATE_USER_DATA_TOOL,
  
  // Title tools
  titleTools.SET_TITLE_DATA_TOOL,
  titleTools.GET_TITLE_DATA_TOOL,
  titleTools.SET_TITLE_INTERNAL_DATA_TOOL,
  titleTools.GET_TITLE_INTERNAL_DATA_TOOL,
  titleTools.ADD_LOCALIZED_NEWS_TOOL,
  titleTools.GET_TITLE_NEWS_TOOL,
];

function main() {
  console.log('Generating TypeScript types from tool schemas...');
  
  try {
    // Generate types
    const typesContent = generateToolInputTypes(allTools);
    
    // Write to file
    const outputPath = join(process.cwd(), 'src', 'types', 'tool-params.ts');
    writeFileSync(outputPath, typesContent, 'utf-8');
    
    console.log(`✅ Generated types for ${allTools.length} tools`);
    console.log(`📝 Written to: ${outputPath}`);
    
    // Log the tools that were processed
    console.log('\nProcessed tools:');
    allTools.forEach(tool => {
      console.log(`  - ${tool.name}`);
    });
    
  } catch (error) {
    console.error('❌ Error generating types:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { main as generateToolTypes };