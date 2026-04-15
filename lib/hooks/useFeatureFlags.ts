// lib/hooks/useFeatureFlags.ts
'use client';
import { useEffect, useState } from 'react';
import type { FeatureFlags } from '@/lib/flags/client';
import { getFeatureFlags, getDefaultFlags } from '@/lib/flags/client';
import Error from '@/app/error';


export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlags>(getDefaultFlags())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchFlags() {
      try {
        const data = await getFeatureFlags()
        if (isMounted) {
          setFlags(data)
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchFlags()

    // Refresh flags every 30 seconds
    const interval = setInterval(fetchFlags, 30000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  return { flags, loading, error }
}

// Helper hooks for individual flags
export function usePaymentsEnabled() {
  const { flags } = useFeatureFlags()
  return flags.PAYMENTS_ENABLED
}

export function useEmailsEnabled() {
  const { flags } = useFeatureFlags()
  return flags.EMAILS_ENABLED
}

export function useKYCEnabled() {
  const { flags } = useFeatureFlags()
  return flags.KYC_ENABLED
}

export function useCertificateIssuanceEnabled() {
  const { flags } = useFeatureFlags()
  return flags.CERTIFICATE_ISSUANCE_ENABLED
}

export function useSignatureEnabled() {
  const { flags } = useFeatureFlags()
  return flags.SIGNATURE_ENABLED
}
