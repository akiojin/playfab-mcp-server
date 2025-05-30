# PlayFab MCP Server Project Guidelines

## Overview
This is a Model Context Protocol (MCP) server that enables AI assistants to interact with PlayFab services.

## Project Structure
- `/src` - TypeScript source code
- `/dist` - Compiled JavaScript output (generated, not tracked)
- Configuration files at root level

## Development Guidelines

### Code Style
Please follow the coding standards defined in `.editorconfig`.

### Testing
Before committing changes, ensure:
1. Build succeeds: `npm run build`
2. TypeScript has no errors: `npx tsc --noEmit`
3. The server starts correctly: `npm start`

### Key Commands
- `npm install` - Install dependencies
- `npm run build` - Build the project
- `npm run watch` - Watch mode for development
- `npm start` - Start the server

### Environment Variables
Required environment variables:
- `PLAYFAB_TITLE_ID` - Your PlayFab Title ID
- `PLAYFAB_DEV_SECRET_KEY` - Your PlayFab Developer Secret Key

### PlayFab API Integration
This server implements various PlayFab APIs:
- Catalog search
- Player management
- Inventory operations
- Transaction handling

When adding new PlayFab API integrations, follow the existing pattern in `src/index.ts`.

### Security Notes
- Never commit `.env` files
- Keep PlayFab credentials secure
- Follow security best practices for API keys

### Contributing
1. Check existing issues before creating new ones
2. Follow the existing code patterns
3. Test thoroughly before submitting changes
4. Update documentation if adding new features