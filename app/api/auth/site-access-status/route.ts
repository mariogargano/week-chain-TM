import { NextResponse } from "next/server"

export async function GET() {
  const enabled = !!process.env.SITE_ACCESS_PASSWORD
  return NextResponse.json({ enabled })
}
