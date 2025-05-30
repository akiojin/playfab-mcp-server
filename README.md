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

```env
PLAYFAB_TITLE_ID=
PLAYFAB_DEV_SECRET_KEY=
```

### Getting Started

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
