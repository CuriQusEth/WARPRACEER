export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      name: "Warp Racer MCP",
      version: "1.0.0",
      description: "MCP server for Warp Racer automation",
      endpoints: ["/api/mcp"]
    });
  }

  // Handle MCP JSON-RPC
  if (req.method === 'POST') {
    const body = req.body || {};
    const { id, method } = body;

    // Send tools/list Response
    if (method === 'tools/list') {
      return res.status(200).json({
        jsonrpc: "2.0",
        id: id || 1,
        result: {
          tools: [
            {
              name: "start_race",
              description: "Starts a new warp race session on Base chain.",
              inputSchema: {
                type: "object",
                properties: {
                  racerId: { type: "string" }
                },
                required: ["racerId"]
              }
            },
            {
              name: "get_score",
              description: "Fetches the latest score for the specified racer address.",
              inputSchema: {
                type: "object",
                properties: {
                  address: { type: "string" }
                },
                required: ["address"]
              }
            }
          ]
        }
      });
    }

    // Send prompts/list Response
    if (method === 'prompts/list') {
      return res.status(200).json({
        jsonrpc: "2.0",
        id: id || 1,
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

    // Default fallback for other MCP methods
    return res.status(200).json({
      jsonrpc: "2.0",
      id: id || 1,
      result: {}
    });
  }

  res.status(405).json({ error: 'Method Not Allowed' });
}
