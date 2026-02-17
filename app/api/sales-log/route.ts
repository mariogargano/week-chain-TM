import { NextResponse } from "next/server"

const DEMO_SALES = [
  {
    id: "demo-1",
    property_name: "POLO 54 PH 501",
    week_number: 12,
    season: "high",
    sale_amount_usd: 9500,
    buyer_initials: "J.M.G.",
    buyer_country: "México",
    broker_initials: null,
    notary_name: "Lic. Roberto Fernández Castillo - Corredor Público No. 13",
    certificate_hash: "a1b2c3d4e5f6",
    sale_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    verified: true,
  },
  {
    id: "demo-2",
    property_name: "POLO 54 PH 501",
    week_number: 51,
    season: "high",
    sale_amount_usd: 9500,
    buyer_initials: "R.L.P.",
    buyer_country: "Estados Unidos",
    broker_initials: "A.C.",
    notary_name: "Lic. Roberto Fernández Castillo - Corredor Público No. 13",
    certificate_hash: "b2c3d4e5f6a7",
    sale_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    verified: true,
  },
  {
    id: "demo-3",
    property_name: "AFLORA Tulum",
    week_number: 8,
    season: "high",
    sale_amount_usd: 7250,
    buyer_initials: "M.S.R.",
    buyer_country: "Canadá",
    broker_initials: null,
    notary_name: "Lic. María Elena Gutiérrez Ramos - Notaría Pública No. 45",
    certificate_hash: "c3d4e5f6a7b8",
    sale_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    verified: true,
  },
  {
    id: "demo-4",
    property_name: "POLO 54 PH 501",
    week_number: 28,
    season: "medium",
    sale_amount_usd: 7000,
    buyer_initials: "A.C.V.",
    buyer_country: "México",
    broker_initials: "L.F.",
    notary_name: "Lic. Roberto Fernández Castillo - Corredor Público No. 13",
    certificate_hash: "d4e5f6a7b8c9",
    sale_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    verified: true,
  },
  {
    id: "demo-5",
    property_name: "AFLORA Tulum",
    week_number: 35,
    season: "medium",
    sale_amount_usd: 5500,
    buyer_initials: "L.F.M.",
    buyer_country: "España",
    broker_initials: null,
    notary_name: "Lic. María Elena Gutiérrez Ramos - Notaría Pública No. 45",
    certificate_hash: "e5f6a7b8c9d0",
    sale_date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    verified: true,
  },
  {
    id: "demo-6",
    property_name: "POLO 54 PH 501",
    week_number: 45,
    season: "low",
    sale_amount_usd: 4143,
    buyer_initials: "P.G.H.",
    buyer_country: "México",
    broker_initials: null,
    notary_name: "Lic. Roberto Fernández Castillo - Corredor Público No. 13",
    certificate_hash: "f6a7b8c9d0e1",
    sale_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    verified: true,
  },
  {
    id: "demo-7",
    property_name: "AFLORA Tulum",
    week_number: 22,
    season: "low",
    sale_amount_usd: 3500,
    buyer_initials: "D.R.S.",
    buyer_country: "Argentina",
    broker_initials: "M.C.",
    notary_name: "Lic. María Elena Gutiérrez Ramos - Notaría Pública No. 45",
    certificate_hash: "a7b8c9d0e1f2",
    sale_date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    verified: true,
  },
  {
    id: "demo-8",
    property_name: "POLO 54 PH 501",
    week_number: 3,
    season: "high",
    sale_amount_usd: 9500,
    buyer_initials: "C.M.L.",
    buyer_country: "Italia",
    broker_initials: null,
    notary_name: "Lic. Roberto Fernández Castillo - Corredor Público No. 13",
    certificate_hash: "b8c9d0e1f2a3",
    sale_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    verified: true,
  },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = Number.parseInt(searchParams.get("limit") || "50")
  const offset = Number.parseInt(searchParams.get("offset") || "0")
  const propertyFilter = searchParams.get("property")

  let filteredSales = DEMO_SALES
  if (propertyFilter && propertyFilter !== "all") {
    filteredSales = DEMO_SALES.filter((s) => s.property_name.toLowerCase().includes(propertyFilter.toLowerCase()))
  }

  const totalVolume = filteredSales.reduce((sum, s) => sum + s.sale_amount_usd, 0)

  return NextResponse.json({
    sales: filteredSales.slice(offset, offset + limit),
    total: filteredSales.length,
    stats: {
      totalSales: filteredSales.length,
      totalVolume,
    },
  })
}
