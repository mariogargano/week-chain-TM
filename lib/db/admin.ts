// Admin Supabase client for server-side operations
import { createClient } from "@supabase/supabase-js"
import { env } from "@/lib/config/env"

export const supabaseAdmin = createClient(env.supabase.url, env.supabase.serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Helper types
export type Payment = {
  id: string
  series_id: string
  user_wallet: string | null
  user_email: string | null
  amount_usdc: number
  payment_method: "solana_pay" | "conekta_card" | "conekta_oxxo" | "conekta_spei"
  status: "held" | "settled" | "refunded" | "failed"
  solana_reference: string | null
  escrow_tx: string | null
  conekta_order_id: string | null
  conekta_payment_id: string | null
  contract_id: string | null
  nft_mint_id: string | null
  refund_proposal_id: string | null
  settle_proposal_id: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export type Contract = {
  id: string
  payment_id: string | null
  user_wallet: string
  user_email: string | null
  user_name: string | null
  contract_type: string
  contract_hash: string | null
  contract_url: string | null
  status: "pending" | "signed" | "certified" | "minted"
  legalario_document_id: string | null
  certified_at: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export type NFTMint = {
  id: string
  payment_id: string
  contract_id: string
  user_wallet: string
  nft_mint_address: string | null
  nft_metadata_uri: string | null
  week_id: string | null
  property_id: string | null
  mint_tx: string | null
  status: "pending" | "minted" | "failed"
  minted_at: string | null
  metadata: Record<string, any>
  created_at: string
}
