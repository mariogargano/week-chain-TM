export async function createPersonaInquiry(userId: string, userEmail?: string) {
  const response = await fetch("/api/kyc/create-inquiry", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      userEmail,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to create Persona inquiry")
  }

  const data = await response.json()
  return data
}

export function getPersonaConfig() {
  return {
    environment: process.env.NEXT_PUBLIC_PERSONA_ENVIRONMENT || "sandbox",
    onReady: () => console.log("[v0] Persona inquiry ready"),
    onComplete: ({ inquiryId, status }: { inquiryId: string; status: string }) => {
      console.log("[v0] Persona inquiry completed:", inquiryId, status)
    },
    onCancel: ({ inquiryId }: { inquiryId: string }) => {
      console.log("[v0] Persona inquiry cancelled:", inquiryId)
    },
    onError: (error: any) => {
      console.error("[v0] Persona inquiry error:", error)
    },
  }
}
