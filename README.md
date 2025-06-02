# PlayFab MCP Server

[![smithery badge](https://smithery.ai/badge/@akiojin/playfab-mcp-server)](https://smithery.ai/server/@akiojin/playfab-mcp-server)

## What Is This? 🤔

This server is a middleware that enables large language models (like Claude and VS Code) to interact directly with PlayFab services. Acting as a secure and efficient translator, it connects your AI assistant with various PlayFab functionalities, such as item search, segment inquiries, player profile lookups, inventory management, and PlayFab ID conversion.

### Quick Example

```text
You: "Show me the latest 10 items."
Claude: *calls the PlayFab search_items API and returns the results in plain text*
```

## How Does It Work? 🛠️

This server leverages the Model Context Protocol (MCP) to establish a universal interface between AI models and PlayFab services. Although MCP is designed to support any AI model, it is currently available as a developer preview.

Follow these steps to get started:

1. Set up your project.
2. Add your project details to your LLM client's configuration.
3. Start interacting with PlayFab data naturally!

### What Can It Do? 📊

#### Catalog & Search

- Search for items using PlayFab's search_items API.
- **Catalog Management (Economy v2):**
  - Create new draft items with the create_draft_item API.
  - Update existing draft items with the update_draft_item API.
  - Delete items from catalog with the delete_item API.
  - Publish draft items to make them available with the publish_draft_item API.
  - Get detailed item information with the get_item API.

#### Player Management

- Retrieve comprehensive segment information.
- Query player profiles within specified segments.
- Convert a PlayFab ID to a Title Player Account ID via the get_title_player_account_id_from_playfab_id API.
- Get detailed user account information with the get_user_account_info API.

#### Inventory Management

- **Get Operations:**
  - Retrieve current inventory items with the get_inventory_items API.
  - Fetch inventory collection IDs using the get_inventory_collection_ids API.
- **Add/Remove Operations:**
  - Add items to inventory with the add_inventory_items API.
  - Delete items from inventory with the delete_inventory_items API.
  - Subtract specific amounts with the subtract_inventory_items API.
- **Modify Operations:**
  - Update item properties with the update_inventory_items API.

#### Economy v2 Administration

- Execute batch inventory operations with the execute_inventory_operations API.
- Note: In Economy v2, virtual currencies are managed as inventory items.

#### User Account Administration

- Ban players by ID, IP, or MAC address with the ban_users API.
- Unban players completely with the revoke_all_bans_for_user API.

#### Player Data Management

- Retrieve player custom data with the get_user_data API.
- Update player custom data with the update_user_data API.

#### Title Configuration Management

- Set global title data with the set_title_data API.
- Retrieve title data with the get_title_data API.
- Set server-only internal data with the set_title_internal_data API.
- Retrieve internal data with the get_title_internal_data API.

## Quick Start 🚀

### Installing via Smithery

To install PlayFab MCP Server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@akiojin/playfab-mcp-server):

```bash
npx -y @smithery/cli install @akiojin/playfab-mcp-server --client claude
```

### Prerequisites

- Node.js 18 or higher.
- A valid PlayFab account (obtain your Title ID and Developer Secret Key via PlayFab Game Manager).
- A supported LLM client such as Claude Desktop.

### Set Up Your Project

Obtain your PlayFab Title ID and Developer Secret Key from the PlayFab Game Manager, then create a `.env` file in the project root with the following content (replace the placeholders with your actual credentials):

```bash
PLAYFAB_TITLE_ID=
PLAYFAB_DEV_SECRET_KEY=
```

### Installation and Setup

1. **Install Dependencies**

   In the project root, run the following command to install all necessary dependencies:

   ```bash
   npm install
   ```

2. **Build the Project**

   Compile the project by executing:

   ```bash
   npm run build
   ```

3. **Start the Server**

   Start the server by executing:

   ```bash
   npm start
   ```

4. **Confirmation Message**

   Upon startup, you should see this message:

   ```text
   PlayFab Server running on stdio
   ```

### Running with Cursor

To use the PlayFab MCP server with Cursor, follow these steps:

1. Install [Cursor Desktop](https://cursor.so/) if you haven't already.
2. Open a new instance of Cursor in an empty folder.
3. Copy the [`mcp.json`](./.cursor/mcp.json) file from this repository into your folder and update the values according to your environment.
4. Launch Cursor; the PlayFab MCP Server should appear in the tools list.
5. For example, try a prompt like "Show me the latest 10 items" to verify that the server processes your query correctly.

### Adding Your Project Details to Claude Desktop's Config File

Open Claude Desktop and navigate to File → Settings → Developer → Edit Config. Then, replace the `claude_desktop_config` file content with the following snippet:

```json
{
  "mcpServers": {
    "playfab": {
      "command": "npx",
      "args": [
        "-y",
        "@akiojin/playfab-mcp-server"
      ],
      "env": {
        "PLAYFAB_TITLE_ID": "Your PlayFab Title ID",
        "PLAYFAB_DEV_SECRET_KEY": "Your PlayFab Developer Secret Key"
      }
    }
  }
}
```

With these steps, you have successfully configured the PlayFab MCP server for use with your LLM client, allowing seamless interaction with PlayFab's services.

## Contributing

### Commit Message Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/) for automated versioning and release.

#### Commit Message Format

```text
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types

- **feat**: A new feature (triggers MINOR version bump)
- **fix**: A bug fix (triggers PATCH version bump)
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools

#### Version Bumping Rules

- **MAJOR** version: When commit message contains `BREAKING CHANGE` in footer or `!` after type/scope
  - Example: `feat!: remove deprecated API endpoints`
  - Example: `feat: new API\n\nBREAKING CHANGE: removed old endpoints`
- **MINOR** version: When commit type is `feat`
  - Example: `feat: add new PlayFab API integration`
- **PATCH** version: When commit type is `fix`
  - Example: `fix: correct error handling in API calls`

### Release Process

#### 1. Update Version and Changelog

```bash
# Analyze commits and update CHANGELOG.md
# Then bump version based on changes:
npm version patch  # or minor/major
```

#### 2. Push Changes and Tag

```bash
# Push the version commit
git push origin main

# Push the version tag created by npm version
git push origin --tags
```

#### 3. Automatic Release & Publish

When a `v*` tag is pushed, the `release-and-publish.yml` workflow automatically:

- Creates a GitHub Release with release notes
- Publishes the package to npm
- Attaches release assets

#### Repository Prerequisites

- `NPM_TOKEN` secret must be set in repository settings
- Branch protection rules must be configured for auto-merge to work:
  1. Go to Settings → Branches
  2. Add rule for `main` branch
  3. Enable "Require a pull request before merging"
  4. Enable "Require status checks to pass before merging"
  5. Add required status checks: `build (18.x)`, `build (20.x)`, `build (22.x)`

### Development Setup

```bash
# Install dependencies
npm install

# Build project
npm run build

# Watch mode
npm run watch

# Type check
npm run typecheck

# Run tests
npm test
```

## Security

We take security seriously. If you discover a security vulnerability within this project, please follow these steps:

### Reporting Security Vulnerabilities

1. **DO NOT** create a public GitHub issue for security vulnerabilities
2. Instead, please report security issues via GitHub's private vulnerability reporting:
   - Go to the **Security** tab of this repository
   - Click on **Report a vulnerability**
   - Provide detailed information about the vulnerability

### What We Need From You

- A description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Any suggested fixes (optional)

### Our Commitment

- We will acknowledge receipt of your report within 48 hours
- We will provide regular updates on our progress
- We will credit you for the discovery (unless you prefer to remain anonymous)

### Security Best Practices

When using this server:

1. **Never commit credentials**: Always use environment variables for sensitive data
2. **Keep dependencies updated**: Regularly run `npm audit` and update packages
3. **Use least privilege**: Only grant the minimum required permissions
4. **Rotate keys regularly**: Change your PlayFab Developer Secret Keys periodically

## Support

### Getting Help

If you encounter any issues or have questions about using the PlayFab MCP Server, here are the best ways to get support:

1. **GitHub Issues**: For bug reports and feature requests, please [create an issue](https://github.com/akiojin/playfab-mcp-server/issues)
2. **Discussions**: For general questions and community support, use [GitHub Discussions](https://github.com/akiojin/playfab-mcp-server/discussions)
3. **Documentation**: Check the README and code comments for usage examples

### Before Creating an Issue

Please check if your issue has already been reported by searching existing issues. If you find a similar issue, you can add additional information as a comment.

### What We Support

- Installation and setup questions
- Bug reports with reproducible steps
- Feature requests and suggestions
- Documentation improvements

### What We Don't Support

- General PlayFab API questions (please refer to [PlayFab Documentation](https://docs.microsoft.com/gaming/playfab/))
- Issues with third-party tools or services
- Custom implementation requests

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
