export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      name: "Warp Racer MCP",
      version: "1.0.0",
      description: "MCP server for Warp Racer automation",
      tools: [
        {
          name: "get_race_status",
          description: "Returns current warp race state.",
          inputSchema: { type: "object", properties: {}, required: [] }
        },
        {
          name: "start_race",
          description: "Initiates a warp race session on Base chain.",
          inputSchema: {
            type: "object",
            properties: {
              racerId: { type: "string" }
            },
            required: ["racerId"]
          }
        },
        {
          name: "get_leaderboard",
          description: "Fetches competitive rankings.",
          inputSchema: { type: "object", properties: {}, required: [] }
        },
        {
          name: "optimize_speed",
          description: "Triggers performance optimization.",
          inputSchema: { type: "object", properties: {}, required: [] }
        },
        {
          name: "get_track_info",
          description: "Returns track metadata.",
          inputSchema: {
            type: "object",
            properties: {
              trackId: { type: "string" }
            },
            required: ["trackId"]
          }
        }
      ],
      prompts: [
        {
          name: "analyze_performance",
          description: "Provides an analysis of the warp racer's recent track performance.",
          arguments: [
            {
              name: "address",
              description: "The Base wallet address of the racer",
              required: true
            }
          ]
        }
      ],
      resources: [],
      endpoints: ["/api/mcp"]
    });
  }

  // Handle MCP JSON-RPC
  if (req.method === 'POST') {
    const body = req.body || {};
    const { id, method, params } = body;
    const reqId = id !== undefined ? id : null;

    if (method === 'initialize') {
      return res.status(200).json({
        jsonrpc: "2.0",
        id: reqId,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: {
            tools: {},
            prompts: {},
            resources: {}
          },
          serverInfo: {
            name: "Warp Racer MCP",
            version: "1.0.0"
          }
        }
      });
    }

    if (method === 'notifications/initialized') {
      return res.status(200).json({
        jsonrpc: "2.0"
      });
    }

    if (method === 'tools/list') {
      return res.status(200).json({
        jsonrpc: "2.0",
        id: reqId,
        result: {
          tools: [
            {
              name: "get_race_status",
              description: "Returns current warp race state.",
              inputSchema: { type: "object", properties: {}, required: [] }
            },
            {
              name: "start_race",
              description: "Initiates a warp race session on Base chain.",
              inputSchema: {
                type: "object",
                properties: { racerId: { type: "string" } },
                required: ["racerId"]
              }
            },
            {
              name: "get_leaderboard",
              description: "Fetches competitive rankings.",
              inputSchema: { type: "object", properties: {}, required: [] }
            },
            {
              name: "optimize_speed",
              description: "Triggers performance optimization.",
              inputSchema: { type: "object", properties: {}, required: [] }
            },
            {
              name: "get_track_info",
              description: "Returns track metadata.",
              inputSchema: {
                type: "object",
                properties: { trackId: { type: "string" } },
                required: ["trackId"]
              }
            }
          ]
        }
      });
    }

    if (method === 'tools/call') {
      // Mock tool execution logic for now
      return res.status(200).json({
        jsonrpc: "2.0",
        id: reqId,
        result: {
          content: [
            {
              type: "text",
              text: `Successfully called tool ${params?.name || 'unknown'}`
            }
          ]
        }
      });
    }

    if (method === 'prompts/list') {
      return res.status(200).json({
        jsonrpc: "2.0",
        id: reqId,
        result: {
          prompts: [
            {
              name: "analyze_performance",
              description: "Provides an analysis of the warp racer's recent track performance.",
              arguments: [
                {
                  name: "address",
                  description: "The Base wallet address of the racer",
                  required: true
                }
              ]
            }
          ]
        }
      });
    }

    if (method === 'resources/list') {
      return res.status(200).json({
        jsonrpc: "2.0",
        id: reqId,
        result: {
          resources: []
        }
      });
    }

    // Default fallback for other MCP methods
    return res.status(200).json({
      jsonrpc: "2.0",
      id: reqId,
      result: {}
    });
  }

  res.status(405).json({ error: 'Method Not Allowed' });
}
