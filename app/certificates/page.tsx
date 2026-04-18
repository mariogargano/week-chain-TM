import { CertificateSelector } from "@/components/certificate-selector"
import { Badge } from "@/components/ui/badge"
import { Shield, CheckCircle } from "lucide-react"

export const metadata = {
  title: "Certificados Digitales | WEEK-CHAIN",
  description:
    "Adquiere tu Certificado Digital de derechos de uso vacacional. Hasta 8 personas, hasta 4 estancias por año, 15 años de vigencia.",
}

export default function CertificatesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-amber-100 text-amber-700 border-amber-200">
            <Shield className="h-3.5 w-3.5 mr-1.5" />
            Certificado Digital NOM-151
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Tu Certificado de <span className="text-amber-600">Uso Vacacional</span>
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Configura tu certificado según tus necesidades. Selecciona el número de personas y las estancias anuales que
            deseas.
          </p>
        </div>

        {/* Key Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-slate-200">
            <CheckCircle className="h-6 w-6 text-emerald-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-slate-900">Vigencia 15 años</p>
              <p className="text-sm text-slate-600">Pago único sin cuotas</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-slate-200">
            <CheckCircle className="h-6 w-6 text-emerald-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-slate-900">Hasta 8 personas</p>
              <p className="text-sm text-slate-600">Flexible para grupos</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-slate-200">
            <CheckCircle className="h-6 w-6 text-emerald-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-slate-900">Hasta 4 estancias/año</p>
              <p className="text-sm text-slate-600">Hasta 7 noches c/u</p>
            </div>
          </div>
        </div>

        {/* Certificate Selector */}
        <div className="max-w-4xl mx-auto">
          <CertificateSelector showPurchaseButton={true} />
        </div>
      </div>
    </main>
  )
}
