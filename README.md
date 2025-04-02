# PlayFab MCP Server

## What Is This? 🤔

This server is a middleware that enables large language models (like Claude and VS Code) to interact directly with PlayFab services. Acting as a secure and efficient translator, it connects your AI assistant with various PlayFab functionalities, such as item search, segment inquiries, and player profile lookups.

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

- Search for items using PlayFab's search_items API.
- Retrieve comprehensive segment information.
- Query player profiles within specified segments.

## Quick Start 🚀

### Prerequisites

- Node.js 14 or higher.
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
   Navigate to the `dist` folder and start the server with:

   ```bash
   npm start
   ```

4. **Confirmation Message**  
   Upon startup, you should see this message:

   ```text
   PlayFab Server running on stdio
   ```

### Running with VS Code Insiders

To use the PlayFab MCP server with VS Code Insiders and GitHub Copilot Agent Mode, follow these steps:

1. Install [VS Code Insiders](https://code.visualstudio.com/insiders/).
2. Install the pre-release versions of the GitHub Copilot and GitHub Copilot Chat extensions in VS Code Insiders.
3. Open a new instance of VS Code Insiders in an empty folder.
4. Copy the [`mcp.json`](./.vscode/mcp.json) file from this repository into your folder and update the values according to your environment.
5. Launch GitHub Copilot and switch to Agent mode; the PlayFab MCP Server should appear in the tools list.
6. For example, try a prompt like "Show me the latest 10 items" to verify that the server processes your query correctly.

### Adding Your Project Details to Claude Desktop's Config File

Open Claude Desktop and navigate to File → Settings → Developer → Edit Config. Then, replace the `claude_desktop_config` file content with the following snippet:

```json
{
  "mcpServers": {
    "playfab": {
      "command": "node",
      "args": [ "C:/Path/To/playfab-mcp/dist/index.js" ], // Specify the path to your PlayFab MCP server file
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

This project welcomes contributions and suggestions. Most contributions require you to agree to a Contributor License Agreement (CLA) to confirm that you have the appropriate rights to grant us the necessary permissions. For details, please visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether a CLA is required and will decorate the PR accordingly (e.g., with a status check or comment). You only need to complete this process once for all repositories using our CLA.

## Trademarks

This project may include trademarks or logos of projects, products, or services. Authorized use of Microsoft trademarks or logos is subject to the guidelines provided in [Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general). Modifications that could cause confusion or imply Microsoft sponsorship are not permitted. Use of third-party trademarks or logos must comply with those third parties’ policies.
