// Analytics events - PostHog temporarily disabled
// These functions are no-ops until PostHog is re-enabled

export const analytics = {
  identify: (userId: string, traits?: Record<string, any>) => {
    // PostHog disabled - no-op
  },

  track: (eventName: string, properties?: Record<string, any>) => {
    // PostHog disabled - no-op
    console.log("[Analytics]", eventName, properties)
  },

  page: (pageName?: string, properties?: Record<string, any>) => {
    // PostHog disabled - no-op
  },

  reset: () => {
    // PostHog disabled - no-op
  },

  // Custom events for WeekChain
  events: {
    // Authentication
    signUp: (method: "email" | "wallet") => {
      analytics.track("User Signed Up", { method })
    },
    signIn: (method: "email" | "wallet") => {
      analytics.track("User Signed In", { method })
    },
    signOut: () => {
      analytics.track("User Signed Out")
    },

    // Property & NFT
    viewProperty: (propertyId: string, propertyName: string) => {
      analytics.track("Property Viewed", { property_id: propertyId, property_name: propertyName })
    },
    purchaseWeek: (propertyId: string, weekNumber: number, amount: number) => {
      analytics.track("Week Purchased", {
        property_id: propertyId,
        week_number: weekNumber,
        amount_usdc: amount,
      })
    },
    listWeekForSale: (weekId: string, price: number) => {
      analytics.track("Week Listed for Sale", { week_id: weekId, price_usdc: price })
    },

    // Reservations
    createReservation: (propertyId: string, checkIn: string, checkOut: string) => {
      analytics.track("Reservation Created", {
        property_id: propertyId,
        check_in: checkIn,
        check_out: checkOut,
      })
    },
    cancelReservation: (reservationId: string) => {
      analytics.track("Reservation Cancelled", { reservation_id: reservationId })
    },

    // KYC
    startKYC: () => {
      analytics.track("KYC Started")
    },
    completeKYC: () => {
      analytics.track("KYC Completed")
    },
    kycApproved: () => {
      analytics.track("KYC Approved")
    },
    kycRejected: (reason?: string) => {
      analytics.track("KYC Rejected", { reason })
    },

    // Referrals
    generateReferralCode: () => {
      analytics.track("Referral Code Generated")
    },
    shareReferralLink: (method: "email" | "whatsapp" | "copy") => {
      analytics.track("Referral Link Shared", { method })
    },
    referralConversion: (referrerId: string) => {
      analytics.track("Referral Conversion", { referrer_id: referrerId })
    },

    // DAO
    createProposal: (proposalType: string) => {
      analytics.track("DAO Proposal Created", { proposal_type: proposalType })
    },
    voteOnProposal: (proposalId: string, vote: "for" | "against") => {
      analytics.track("DAO Vote Cast", { proposal_id: proposalId, vote })
    },

    // Engagement
    connectWallet: (walletType: string) => {
      analytics.track("Wallet Connected", { wallet_type: walletType })
    },
    disconnectWallet: () => {
      analytics.track("Wallet Disconnected")
    },
    searchProperties: (query: string) => {
      analytics.track("Properties Searched", { query })
    },
    filterProperties: (filters: Record<string, any>) => {
      analytics.track("Properties Filtered", filters)
    },
  },
}
