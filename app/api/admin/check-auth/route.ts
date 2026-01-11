import { NextResponse } from "next/server"
import { checkAdminAuth } from "@/lib/auth/admin-guard"

/**
 * Admin authentication check endpoint
 * Used by admin pages to verify authorization
 */
export async function GET() {
  const adminData = await checkAdminAuth()

  if (!adminData) {
    return NextResponse.json({ error: "Unauthorized", authorized: false }, { status: 403 })
  }

  return NextResponse.json({
    authorized: true,
    email: adminData.email,
    role: adminData.role,
  })
}
