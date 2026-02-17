// Squads multisig client (v0 mock implementation)
// TODO: Replace with actual @sqds/sdk when available

import { PublicKey, Keypair } from "@solana/web3.js"
import { env } from "@/lib/config/env"

export type TransferProposalParams = {
  vault: PublicKey
  fromAta: PublicKey
  toAta: PublicKey
  amount: number // USDC amount
  memo?: string
}

/**
 * Create a transfer proposal in Squads multisig
 * @returns proposalId - Unique identifier for the proposal
 */
export async function createTransferProposal(params: TransferProposalParams): Promise<string> {
  // TODO: Integrate @sqds/sdk
  // This is a mock implementation for v0

  const { vault, fromAta, toAta, amount, memo } = params

  console.log("[squads] Creating transfer proposal:", {
    vault: vault.toBase58(),
    from: fromAta.toBase58(),
    to: toAta.toBase58(),
    amount,
    memo,
  })

  // Mock proposal ID (in production, this comes from Squads SDK)
  const proposalId = `proposal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // TODO: Actual Squads SDK call would be:
  // const squads = new SquadsSDK({ connection, wallet });
  // const proposal = await squads.createTransferProposal({
  //   multisigPda: vault,
  //   source: fromAta,
  //   destination: toAta,
  //   amount: amount * 1e6, // Convert to lamports
  //   memo,
  // });
  // return proposal.publicKey.toBase58();

  return proposalId
}

/**
 * Get Squads service keypair from environment
 */
export function getSquadsKeypair(): Keypair {
  if (!env.squads.keypairBase64) {
    throw new Error("SQUADS_KEYPAIR_BASE64 not configured")
  }

  try {
    const decoded = Buffer.from(env.squads.keypairBase64, "base64")
    return Keypair.fromSecretKey(decoded)
  } catch (error) {
    throw new Error("Invalid SQUADS_KEYPAIR_BASE64 format")
  }
}

/**
 * Get Series B1 vault address
 */
export function getSeriesB1Vault(): PublicKey {
  if (!env.squads.vaultSerieB1) {
    throw new Error("SQUADS_VAULT_SERIE_B1 not configured")
  }
  return new PublicKey(env.squads.vaultSerieB1)
}

/**
 * Get Series B1 treasury address
 */
export function getSeriesB1Treasury(): PublicKey {
  if (!env.squads.treasurySerieB1) {
    throw new Error("SERIES_TREASURY_B1 not configured")
  }
  return new PublicKey(env.squads.treasurySerieB1)
}
