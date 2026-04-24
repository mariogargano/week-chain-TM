import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { author_first_name, city, pax, tier_label, quote, rating, photo_url, video_url, consent_given } = body

    // Validation
    if (!author_first_name || !quote || !consent_given) {
      return NextResponse.json({ error: "Missing required fields or consent not given" }, { status: 400 })
    }

    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("testimonials")
      .insert({
        user_id: user.id,
        author_first_name,
        city,
        pax,
        tier_label,
        quote,
        rating: rating || 5,
        photo_url,
        video_url,
        consent_given,
        is_approved: false, // Requires admin approval
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error submitting testimonial:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ testimonial: data, message: "Testimonial submitted for approval" })
  } catch (error) {
    console.error("[v0] Unexpected error in testimonials/submit:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
