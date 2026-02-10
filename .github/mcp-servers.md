# MCP Server Configuration

This project is configured to use Model Context Protocol (MCP) servers for enhanced development capabilities.

## Configured Servers

### Python Package Documentation
Provides access to PyPI package information and documentation for Python libraries used in this project (numpy, matplotlib, tkinter).

To enable this MCP server, add to your Copilot configuration:

```json
{
  "mcpServers": {
    "python-docs": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-python-docs"]
    }
  }
}
```

This allows Copilot to:
- Search PyPI for package information
- Access documentation for numpy, matplotlib, and other dependencies
- Get usage examples and API references

## Alternative MCP Servers

Other useful MCP servers for this project type:

- **Sequential Thinking**: For complex electrical engineering calculations
- **Filesystem**: For analyzing project structure and files
- **Memory**: For tracking simulation parameters across sessions
