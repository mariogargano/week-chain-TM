import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { propertyId: string } }) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("properties")
      .select(`
        id,
        name,
        notary:notaries(
          id,
          name,
          title,
          location,
          photo_url,
          license_number,
          specialty,
          verified
        )
      `)
      .eq("id", params.propertyId)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener información del notario" }, { status: 500 })
  }
}
