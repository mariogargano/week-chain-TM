'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, X, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if already installed as PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    setIsStandalone(standalone)

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered:', registration.scope)
        })
        .catch((error) => {
          console.error('[PWA] Service Worker registration failed:', error)
        })
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Show banner after 5 seconds if not installed
      setTimeout(() => {
        if (!standalone) {
          setShowInstallBanner(true)
        }
      }, 5000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Check if dismissed recently
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      const dismissedTime = parseInt(dismissed)
      const dayInMs = 24 * 60 * 60 * 1000
      if (Date.now() - dismissedTime < dayInMs * 7) {
        setShowInstallBanner(false)
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('[PWA] User accepted the install prompt')
    }

    setDeferredPrompt(null)
    setShowInstallBanner(false)
  }

  const handleDismiss = () => {
    setShowInstallBanner(false)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  // Don't show if already installed
  if (isStandalone) return null

  // Don't show banner until ready
  if (!showInstallBanner) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-gradient-to-r from-sky-600 to-cyan-600 rounded-xl shadow-2xl p-4 text-white">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Smartphone className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg mb-1">Instalar WEEK-CHAIN</h3>
            <p className="text-sm text-white/90 mb-3">
              {isIOS
                ? 'Toca el boton compartir y selecciona "Agregar a Inicio"'
                : 'Instala la app para acceso rapido y notificaciones'}
            </p>
            {!isIOS && deferredPrompt && (
              <Button
                onClick={handleInstallClick}
                className="w-full bg-white text-sky-600 hover:bg-white/90 font-semibold"
              >
                <Download className="w-4 h-4 mr-2" />
                Instalar App
              </Button>
            )}
            {isIOS && (
              <div className="text-xs text-white/80 flex items-center gap-1">
                <span>Safari</span>
                <span>→</span>
                <span>Compartir</span>
                <span>→</span>
                <span>Agregar a Inicio</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
