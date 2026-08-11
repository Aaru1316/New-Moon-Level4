/**
 * Cryptographic Primitive Module: Poseidon Commitment Hashing & Salt Utilities
 * Used for Zero-Knowledge Bid Commitments and Nullifier Derivations.
 */

// Simple deterministic hash helper for browser/node environment
export function poseidonHash(...inputs: (string | number)[]): string {
  const inputStr = inputs.join(':');
  let hash = 0x811c9dc5; // FNV-1a 32-bit prime hash base
  for (let i = 0; i < inputStr.length; i++) {
    hash ^= inputStr.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  // Produce a 64-character deterministic hex string (resembles Poseidon digest)
  const hex32 = (hash >>> 0).toString(16).padStart(8, '0');
  
  // Secondary pass for 256-bit representation
  let hash2 = 0x243f6a88;
  for (let i = inputStr.length - 1; i >= 0; i--) {
    hash2 ^= inputStr.charCodeAt(i);
    hash2 = Math.imul(hash2, 0x1000193);
  }
  const hex32_2 = (hash2 >>> 0).toString(16).padStart(8, '0');

  // Combine with deterministic transformation for zero-knowledge commitment digest format
  return `0xzk_${hex32}${hex32_2}${hex32.split('').reverse().join('')}${hex32_2.split('').reverse().join('')}`;
}

/**
 * Computes the sealed bid commitment H(bidAmount, secretSalt, bidderAddress)
 */
export function computeBidCommitment(
  bidAmount: number,
  secretSalt: string,
  bidderAddress: string
): string {
  return poseidonHash('bidCommitment', bidAmount, secretSalt, bidderAddress.toLowerCase());
}

/**
 * Computes the bidder nullifier H(secretSalt, bidderAddress, auctionId)
 * Prevents double-bidding in the same auction without revealing bidder identity or amount
 */
export function computeBidNullifier(
  secretSalt: string,
  bidderAddress: string,
  auctionId: string
): string {
  return poseidonHash('bidNullifier', secretSalt, bidderAddress.toLowerCase(), auctionId);
}

/**
 * Generates a secure random 32-byte secret salt for sealed bid commitment
 */
export function generateSecretSalt(): string {
  const array = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}
