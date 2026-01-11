// Sistema de Versiones de Términos y Condiciones
// Gestiona versiones de términos y fuerza re-aceptación cuando cambian

export interface TermsVersion {
  version: string
  effectiveDate: Date
  changes: string[]
  requiresReAcceptance: boolean
}

export const TERMS_VERSIONS: TermsVersion[] = [
  {
    version: "1.0.0",
    effectiveDate: new Date("2025-01-01"),
    changes: ["Versión inicial de términos y condiciones"],
    requiresReAcceptance: false,
  },
  {
    version: "1.1.0",
    effectiveDate: new Date("2025-10-27"),
    changes: [
      "Actualización de políticas de privacidad",
      "Nuevas cláusulas de protección de datos",
      "Actualización de términos de uso de NFTs",
    ],
    requiresReAcceptance: true,
  },
]

export const CURRENT_TERMS_VERSION = TERMS_VERSIONS[TERMS_VERSIONS.length - 1].version

export function getCurrentTermsVersion(): TermsVersion {
  return TERMS_VERSIONS[TERMS_VERSIONS.length - 1]
}

export function getTermsVersion(version: string): TermsVersion | undefined {
  return TERMS_VERSIONS.find((v) => v.version === version)
}

export function needsReAcceptance(userAcceptedVersion: string | null): boolean {
  if (!userAcceptedVersion) return true

  const userVersion = getTermsVersion(userAcceptedVersion)
  const currentVersion = getCurrentTermsVersion()

  if (!userVersion) return true
  if (userVersion.version === currentVersion.version) return false

  // Check if any version between user's and current requires re-acceptance
  const userIndex = TERMS_VERSIONS.findIndex((v) => v.version === userAcceptedVersion)
  const currentIndex = TERMS_VERSIONS.length - 1

  for (let i = userIndex + 1; i <= currentIndex; i++) {
    if (TERMS_VERSIONS[i].requiresReAcceptance) {
      return true
    }
  }

  return false
}
