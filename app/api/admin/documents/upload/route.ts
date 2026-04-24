import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
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

    const envAdminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "").toLowerCase()
    const userEmailLower = user.email?.toLowerCase() || ""
    const isAdmin = userData?.role === "admin" || 
                    userData?.role === "super_admin" || 
                    (envAdminEmail !== "" && userEmailLower === envAdminEmail)

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const formData = await request.formData()
    const files = formData.getAll("files") as File[]
    const category = formData.get("category") as string || "other"

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    const uploadedFiles = []

    for (const file of files) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: `File ${file.name} exceeds 10MB limit` }, { status: 400 })
      }

      // Generate unique filename with category prefix
      const timestamp = Date.now()
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
      const pathname = `${category}/${timestamp}-${safeName}`

      const blob = await put(pathname, file, {
        access: "private",
      })

      uploadedFiles.push({
        pathname: blob.pathname,
        size: file.size,
        filename: file.name,
        category,
      })

      // Log the upload in audit
      await supabase.from("audit_log_immutable").insert({
        user_id: user.id,
        action: "document_uploaded",
        metadata: {
          pathname: blob.pathname,
          filename: file.name,
          category,
          size: file.size,
        },
      }).catch(() => {
        // Ignore audit log errors
      })
    }

    return NextResponse.json({ 
      success: true, 
      files: uploadedFiles 
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
