import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    })

    // Verify admin user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Check if user is admin
    const { data: adminUser } = await supabase.from("admin_users").select("*").eq("id", user.id).single()

    if (!adminUser) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "all"
    const category = searchParams.get("category") || "all"
    const priority = searchParams.get("priority") || "all"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from("contact_requests")
      .select("*, assigned_to_admin:admin_users!assigned_to(id, name, email)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (status !== "all") {
      query = query.eq("status", status)
    }
    if (category !== "all") {
      query = query.eq("category", category)
    }
    if (priority !== "all") {
      query = query.eq("priority", priority)
    }

    const { data: requests, error, count } = await query

    if (error) {
      console.error("[v0] Error fetching contact requests:", error)
      return NextResponse.json({ error: "Error al obtener solicitudes" }, { status: 500 })
    }

    return NextResponse.json(
      {
        requests,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Admin contact requests error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { requestId, status, priority, assigned_to, resolution_notes } = body

    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    })

    // Verify admin user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { data: adminUser } = await supabase.from("admin_users").select("*").eq("id", user.id).single()

    if (!adminUser) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    // Build update object
    const updates: any = {}
    if (status) updates.status = status
    if (priority) updates.priority = priority
    if (assigned_to !== undefined) updates.assigned_to = assigned_to
    if (resolution_notes) updates.resolution_notes = resolution_notes

    // If status is resolved, set resolved fields
    if (status === "resolved") {
      updates.resolved_at = new Date().toISOString()
      updates.resolved_by = user.id
    }

    // Update contact request
    const { data, error } = await supabase
      .from("contact_requests")
      .update(updates)
      .eq("id", requestId)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating contact request:", error)
      return NextResponse.json({ error: "Error al actualizar solicitud" }, { status: 500 })
    }

    return NextResponse.json({ success: true, request: data }, { status: 200 })
  } catch (error) {
    console.error("[v0] Admin update contact request error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
