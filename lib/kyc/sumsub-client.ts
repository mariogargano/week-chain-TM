export async function generateSumsubAccessToken(userId: string, levelName = "basic-kyc-level") {
  const response = await fetch("/api/kyc/generate-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      levelName,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to generate Sumsub access token")
  }

  const data = await response.json()
  return data.token
}

export function getSumsubConfig(accessToken: string, userId: string) {
  return {
    accessToken,
    expirationHandler: () => generateSumsubAccessToken(userId, "basic-kyc-level"),
    email: "",
    phone: "",
    i18n: {
      document: {
        subTitles: {
          IDENTITY: "Upload a document that proves your identity",
        },
      },
    },
    onMessage: (type: string, payload: any) => {
      console.log("[v0] Sumsub WebSDK message:", type, payload)
    },
    onError: (error: any) => {
      console.error("[v0] Sumsub WebSDK error:", error)
    },
    uiConf: {
      customCssStr:
        ":root {\n  --black: #000000;\n  --grey: #F5F5F5;\n  --grey-darker: #B2B2B2;\n  --border-color: #DBDBDB;\n}\n\np {\n  color: var(--black);\n  font-size: 16px;\n  line-height: 24px;\n}\n\nsection {\n  margin: 40px auto;\n}\n\ninput {\n  color: var(--black);\n  font-weight: 600;\n  outline: none;\n}\n\nsection.content {\n  background-color: var(--grey);\n  color: var(--black);\n  padding: 40px 40px 16px;\n  box-shadow: none;\n  border-radius: 6px;\n}\n\nbutton.submit,\nbutton.back {\n  text-transform: capitalize;\n  border-radius: 6px;\n  height: 48px;\n  padding: 0 30px;\n  font-size: 16px;\n  background-image: none !important;\n  transform: none !important;\n  box-shadow: none !important;\n  transition: all 0.2s linear;\n}\n\nbutton.submit {\n  min-width: 132px;\n  background: none;\n  background-color: var(--black);\n}\n\n.round-icon {\n  background-color: var(--black) !important;\n  background-image: none !important;\n}",
    },
  }
}
