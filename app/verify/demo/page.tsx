"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Search, QrCode, FileText } from "lucide-react";

export default function VerifyDemoPage() {
  const router = useRouter()
  const [certificateId, setCertificateId] = useState("")
  const [loading, setLoading] = useState(false)

  const handleVerify = () => {
    if (!certificateId?.trim()) return
    setLoading(true)
    router?.push(`/verify/${certificateId?.trim()}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-sky-500/10 text-sky-400 px-4 py-2 rounded-full mb-4">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">Sistema de Verificacion</span>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-white text-balance">Verificar Certificado</h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto text-pretty">
            Ingresa el ID de tu certificado para verificar su autenticidad y estado en el sistema WEEK-CHAIN.
          </p>
        </div>

        <Card className="border-slate-700 bg-slate-800/50 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Search className="h-5 w-5 text-sky-400" />
              Buscar Certificado
            </CardTitle>
            <CardDescription className="text-slate-400">
              Ingresa el ID unico del certificado (UUID) que deseas verificar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Ej: 550e8400-e29b-41d4-a716-446655440000"
                value={certificateId}
                onChange={(e) => setCertificateId(e?.target?.value)}
                className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
              />
              <Button
                onClick={handleVerify}
                disabled={!certificateId?.trim() || loading}
                className="bg-sky-500 hover:bg-sky-600 text-white min-w-[120px]"
              >
                {loading ? "Verificando..." : "Verificar"}
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              El ID del certificado se encuentra en tu contrato digital, email de confirmacion o tarjeta Google Wallet.
            </p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-slate-700 bg-slate-800/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-lg">
                  <QrCode className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Escaneo QR</h3>
                  <p className="text-sm text-slate-400">
                    Tambien puedes escanear el codigo QR de tu certificado para verificarlo directamente.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Validacion NOM-151</h3>
                  <p className="text-sm text-slate-400">
                    Todos los certificados cumplen con la norma NOM-151 para documentos digitales con validez legal.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-slate-500">
            Necesitas ayuda? Contacta a{" "}
            <a href="mailto:support@week-chain.com" className="text-sky-400 hover:underline">
              support@week-chain.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
