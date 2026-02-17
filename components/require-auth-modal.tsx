"use client"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Shield, Wallet, Mail, ArrowRight } from "lucide-react"

interface RequireAuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  action?: string
}

export function RequireAuthModal({ open, onOpenChange, action = "continuar" }: RequireAuthModalProps) {
  const router = useRouter()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FF9AA2]/20">
            <Shield className="h-6 w-6 text-[#FF9AA2]" />
          </div>
          <DialogTitle className="text-center text-2xl">Inicia sesión para {action}</DialogTitle>
          <DialogDescription className="text-center">
            Crea una cuenta o inicia sesión para acceder a todas las funciones de WEEK-CHAIN
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <Button
            className="w-full bg-gradient-to-r from-[#FF9AA2] to-[#C7CEEA] hover:from-[#FF8A92] hover:to-[#B7BEDA]"
            size="lg"
            onClick={() => router.push("/auth")}
          >
            <Mail className="mr-2 h-4 w-4" />
            Registrarse con Email
            <ArrowRight className="ml-auto h-4 w-4" />
          </Button>
          <Button variant="outline" className="w-full bg-transparent" size="lg" onClick={() => router.push("/auth")}>
            <Wallet className="mr-2 h-4 w-4" />
            Conectar Wallet
            <ArrowRight className="ml-auto h-4 w-4" />
          </Button>
          <Button variant="outline" className="w-full bg-transparent" size="lg" onClick={() => router.push("/auth")}>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuar con Google
            <ArrowRight className="ml-auto h-4 w-4" />
          </Button>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{" "}
            <button onClick={() => router.push("/auth")} className="text-[#FF9AA2] hover:underline font-medium">
              Iniciar Sesión
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
