"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Lock, Mail, ShieldAlert } from "lucide-react"

interface VirtualOfficeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function VirtualOfficeModal({ isOpen, onClose }: VirtualOfficeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
            <Lock className="h-8 w-8 text-amber-600" />
          </div>
          <DialogTitle className="text-center text-2xl">Acceso Restringido</DialogTitle>
        </DialogHeader>

        <div className="text-center space-y-4 pt-4">
          <div className="flex items-center justify-center gap-2 text-base">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            <span className="font-semibold text-slate-900">Solo para Staff de WEEK-CHAIN</span>
          </div>

          <p className="text-slate-600">
            La Oficina Virtual es un área exclusiva para miembros del equipo con correo corporativo.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
            <div className="flex items-center gap-2 text-sm text-amber-800">
              <Mail className="h-4 w-4" />
              <span className="font-mono">@week-chain.com</span>
            </div>
          </div>

          <p className="text-sm text-slate-500 mt-4">
            Si eres parte del equipo, por favor usa tu correo corporativo para acceder.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
