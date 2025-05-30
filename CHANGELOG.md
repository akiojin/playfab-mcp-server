# Changelog

## [0.3.1] - 2025-05-30

### Added
- Catalog Management (Economy v2) API features
  - `create_draft_item` - Create draft items
  - `update_draft_item` - Update draft items
  - `delete_item` - Delete items
  - `publish_draft_item` - Publish draft items
  - `get_item` - Get item information

### Improved
- Enhanced documentation
  - Translated CLAUDE.md to Japanese with development guidelines
  - Added detailed API feature descriptions to README.md
- Project structure improvements
  - Added .editorconfig for consistent coding standards
  - Updated SECURITY.md and SUPPORT.md

### Fixed
- Removed unnecessary tool definitions (grant items, revoke items)
- Improved documentation and code consistency

### Development
- Added TypeScript error checking command
- Clarified build and dist update rules

## [0.3.0] - 2025-05-20

### Fixed
- Improved error handling in GetTitlePlayerAccountIdFromPlayFabId function
- Fixed account ID retrieval logic from PlayFabId
- Added error message for non-existent account information