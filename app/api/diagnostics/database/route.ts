import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        connected: false,
        message: "Supabase credentials not configured",
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test connection with a simple query
    const { data, error } = await supabase.from("users").select("count").limit(1).single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows returned" which is fine
      throw error
    }

    return NextResponse.json({
      connected: true,
      message: "Database connection successful",
    })
  } catch (error: any) {
    return NextResponse.json({
      connected: false,
      message: `Database error: ${error.message}`,
    })
  }
}
