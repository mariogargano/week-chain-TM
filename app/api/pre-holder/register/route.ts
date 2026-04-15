import { type NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { z } from "zod";

export const dynamic = "force-dynamic"

const MAX_PRE_HOLDERS = 500

const registerSchema = z.object({
  name: z.string().min(2, "Nombre requerido").max(120),
  email: z.string().email("Email inválido"),
  country: z.string().min(2).max(80).optional().default(""),
})

function getStripe() {
  const Stripe = require("stripe").default
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-11-20.acacia",
  })
}

/**
 * POST /api/pre-holder/register
 * Registers a new pre-holder and creates a Stripe Checkout session for $100 USD.
 *
 * Body: { name, email, country }
 * Returns: { checkoutUrl }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // --- Validate input ---
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      )
    }

    const { name, email, country } = parsed.data
    const supabase = createServiceRoleClient()

    // --- Check duplicate email ---
    const { data: existing } = await supabase
      .from("pre_holders")
      .select("id, status, stripe_session_id")
      .eq("email", email)
      .maybeSingle()

    if (existing) {
      if (existing.status === "paid") {
        return NextResponse.json(
          { error: "Este email ya tiene un lugar reservado y pagado." },
          { status: 409 },
        )
      }
      // If pending_payment, regenerate checkout URL so they can complete payment
      if (existing.status === "pending_payment" && existing.stripe_session_id) {
        try {
          const stripe = getStripe()
          const session = await stripe.checkout.sessions.retrieve(existing.stripe_session_id)
          if (session.status === "open" && session.url) {
            return NextResponse.json({ checkoutUrl: session.url })
          }
        } catch {
          // Session expired or invalid — fall through to create a new one
        }
      }
    }

    // --- Check capacity ---
    const { count: paidCount } = await supabase
      .from("pre_holders")
      .select("*", { count: "exact", head: true })
      .eq("status", "paid")

    if ((paidCount ?? 0) >= MAX_PRE_HOLDERS) {
      return NextResponse.json(
        { error: "Lo sentimos, todos los lugares han sido reservados." },
        { status: 409 },
      )
    }

    // --- Assign next holder_number (optimistic, using paid + pending count) ---
    const { count: totalCount } = await supabase
      .from("pre_holders")
      .select("*", { count: "exact", head: true })

    const nextHolderNumber = (totalCount ?? 0) + 1

    if (nextHolderNumber > MAX_PRE_HOLDERS) {
      return NextResponse.json(
        { error: "Lo sentimos, todos los lugares han sido reservados." },
        { status: 409 },
      )
    }

    // --- Upsert pre_holder record (pending_payment) ---
    let preHolderId: string
    let holderNumber: number

    if (existing) {
      // Update existing pending record
      const { data: updated, error: updateErr } = await supabase
        .from("pre_holders")
        .update({ name, country, status: "pending_payment" })
        .eq("email", email)
        .select("id, holder_number")
        .single()

      if (updateErr || !updated) {
        console.error("[pre-holder/register] Update error:", updateErr)
        return NextResponse.json({ error: "Error al actualizar registro" }, { status: 500 })
      }

      preHolderId = updated.id
      holderNumber = updated.holder_number
    } else {
      const { data: inserted, error: insertErr } = await supabase
        .from("pre_holders")
        .insert({
          name,
          email,
          country,
          status: "pending_payment",
          holder_number: nextHolderNumber,
        })
        .select("id, holder_number")
        .single()

      if (insertErr || !inserted) {
        // Race condition: another registration took the spot
        if (insertErr?.code === "23505") {
          return NextResponse.json(
            { error: "Este email ya fue registrado. Intenta de nuevo." },
            { status: 409 },
          )
        }
        console.error("[pre-holder/register] Insert error:", insertErr)
        return NextResponse.json({ error: "Error al registrar" }, { status: 500 })
      }

      preHolderId = inserted.id
      holderNumber = inserted.holder_number
    }

    // --- Create Stripe Checkout Session ---
    const stripe = getStripe()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://week-chain.com"

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: 10000, // $100.00 USD in cents
            product_data: {
              name: `Pre-Holder WEEK-CHAIN™ #${holderNumber}`,
              description:
                "Depósito de interés reembolsable — Lugar exclusivo Early Adopter con NFT de reserva en Solana",
              images: [],
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        pre_holder_id: preHolderId,
        email,
        holder_number: String(holderNumber),
        name,
        country,
        flow: "pre_holder",
      },
      success_url: `${appUrl}/pre-holder/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pre-holder`,
    })

    // --- Save Stripe session ID to record ---
    await supabase
      .from("pre_holders")
      .update({ stripe_session_id: session.id })
      .eq("id", preHolderId)

    return NextResponse.json({ checkoutUrl: session.url })
  } catch (err: any) {
    console.error("[pre-holder/register] Unexpected error:", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
