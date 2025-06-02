# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Consolidated news management tools for better usability
  - Removed `add_news` tool in favor of unified `add_localized_news` tool
  - Enhanced `add_localized_news` to automatically handle base news creation and localization in a single operation
  - Improved error handling with specific guidance for PlayFab configuration requirements
- Enhanced error messages for PlayFab API errors
  - Added specific error handling for default language configuration issues (error code 1393)
  - Provides clear guidance on PlayFab Game Manager configuration requirements

### Removed

- `add_news` tool (functionality merged into `add_localized_news`)

## [0.5.0] - 2024-12-19

### Added

- Batch operations support for catalog items and inventory management
  - `batch_create_draft_items`: Create multiple catalog items in a single operation (up to 50 items)
  - `grant_items_to_users`: Grant items to multiple players in bulk (up to 100 operations)
- Enhanced `get_title_player_account_ids_from_playfab_ids` tool
  - Now supports both single ID and multiple IDs (array) input
  - Returns detailed mapping of PlayFabIds to TitlePlayerAccountIds
- Catalog configuration management
  - `update_catalog_config`: Define available ContentTypes and Tags for catalog items
  - `get_catalog_config`: Retrieve current catalog configuration
- Custom tags support for API tracking
  - All PlayFab API calls now include `CustomTags: { mcp: 'true' }` for tracking
- Destructive operation protection
  - Added confirmation requirements for `delete_item`, `ban_users`, and `delete_inventory_items`
  - Clear warning messages and safety measures to prevent accidental data loss

### Enhanced

- Improved tool descriptions with clear categorization (⚡ BULK OPERATION, ⚠️ DESTRUCTIVE, etc.)
- Enhanced `create_draft_item` to enforce NEUTRAL locale requirement for titles
- Updated `execute_inventory_operations` description to highlight bulk operation capabilities
- Deprecated single-operation tools in favor of unified batch tools:
  - `create_draft_item` → Use `batch_create_draft_items` instead
  - `add_inventory_items` → Use `grant_items_to_users` instead

### Fixed

- Fixed TypeScript compilation errors
- Corrected JSON Schema definitions for tools accepting multiple types

## [0.4.0] - Previous Release
