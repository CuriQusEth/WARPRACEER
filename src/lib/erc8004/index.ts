// Mocks for ERC-8004 Trustless Agents

export interface AgentReputation {
  address: string;
  reputationScore: number;
  isActive: boolean;
}

export function verifyAgentSignature(agentAddress: string, signature: string, message: string): boolean {
  // Mock verification
  console.log("Verifying SIWA signature:", agentAddress, signature);
  return true;
}

export async function fetchAgentReputation(agentAddress: string): Promise<AgentReputation> {
  // Mock on-chain query
  return {
    address: agentAddress,
    reputationScore: 98,
    isActive: true
  };
}
