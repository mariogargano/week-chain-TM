import { list } from "@vercel/blob"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    // Verify admin access
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    const isAdmin = userData?.role === "admin" || 
                    userData?.role === "super_admin" || 
                    user.email === "corporativo@morises.com"

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { blobs } = await list()

    const files = blobs.map((blob) => ({
      pathname: blob.pathname,
      url: blob.url,
      size: blob.size,
      uploadedAt: blob.uploadedAt,
      filename: blob.pathname.split("/").pop() || "unknown",
      category: blob.pathname.split("/")[0] || "other",
    }))

    return NextResponse.json({ files })
  } catch (error) {
    console.error("Error listing documents:", error)
    return NextResponse.json({ error: "Failed to list documents" }, { status: 500 })
  }
}
