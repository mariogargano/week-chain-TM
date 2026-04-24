import type { Metadata } from "next"
import WeekLiveStyleClientPage from "./_components/WeekLiveStyleClientPage"

export const metadata: Metadata = {
  title: "WEEK Live In Style | Blog de Estilo de Vida Vacacional",
  description: "Descubre historias inspiradoras, consejos de viaje y tendencias en propiedades vacacionales",
}

export default function WeekLiveStylePage() {
  return <WeekLiveStyleClientPage />
}
