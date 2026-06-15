import { toHex, encodePacked } from 'viem';

export const ERC8021_MARKER = "80218021802180218021802180218021";

/**
 * Creates an ERC-8021 compliant suffix for transaction attribution
 * Schema ID 0 uses a canonical registry and is the most minimal.
 */
export function buildERC8021Suffix(codes: string[]): `0x${string}` {
  const codesString = codes.join(',');
  const codesBytes = new TextEncoder().encode(codesString);
  const codesLength = codesBytes.length;
  
  const codesHex = toHex(codesBytes);
  const codesLengthHex = toHex(codesLength, { size: 1 });
  const schemaIdHex = toHex(0, { size: 1 }); // Schema ID 0
  const ercMarkerHex = `0x${ERC8021_MARKER}` as const;

  // Format: txData || codes || codesLength || schemaId || ercMarker
  // We return just the suffix to be appended to transaction data.
  // When appending to a transaction, you just concat string: data + stripHex(suffix)
  
  return encodePacked(
    ['bytes1', 'bytes', 'bytes1', 'bytes16'],
    [codesLengthHex, codesHex as `0x${string}`, schemaIdHex, ercMarkerHex]
  );
}

export function appendERC8021(txData: `0x${string}`, codes: string[]): `0x${string}` {
  const suffix = buildERC8021Suffix(codes);
  return `${txData}${suffix.replace('0x', '')}` as `0x${string}`;
}
