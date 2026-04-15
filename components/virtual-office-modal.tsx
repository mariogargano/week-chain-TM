"use client";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, ShieldAlert, ArrowRight } from "lucide-react";

interface VirtualOfficeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function VirtualOfficeModal({ isOpen, onClose }: VirtualOfficeModalProps) {
  const router = useRouter()

  const handleAccess = () => {
    onClose()
    router.push("/team")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
            <Lock className="h-8 w-8 text-amber-600" />
          </div>
          <DialogTitle className="text-center text-2xl">Oficina Virtual</DialogTitle>
        </DialogHeader>

        <div className="text-center space-y-4 pt-4">
          <div className="flex items-center justify-center gap-2 text-base">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            <span className="font-semibold text-slate-900">Acceso para Equipo WEEK-CHAIN</span>
          </div>

          <p className="text-slate-600">
            La Oficina Virtual es el centro de operaciones del equipo con modelo DAO para gobernanza, votaciones y colaboracion.
          </p>

          <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 mt-4 space-y-2">
            <p className="text-sm text-sky-800 font-medium">Roles con acceso:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {["Admin", "Broker", "Staff", "Notaria", "Owner", "Service Provider"].map((role) => (
                <span key={role} className="px-2 py-1 bg-sky-100 text-sky-700 text-xs rounded-full">
                  {role}
                </span>
              ))}
            </div>
          </div>

          <Button onClick={handleAccess} className="w-full bg-sky-500 hover:bg-sky-600 mt-4">
            Acceder a Oficina Virtual
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <p className="text-xs text-slate-500 mt-2">
            Necesitas estar autenticado con un rol autorizado para acceder.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
