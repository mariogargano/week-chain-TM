import { sendKYCReminder } from "./send-kyc-reminder"
import { processPayment } from "./process-payment"
import { generateCertificate } from "./generate-certificate"
import { sendWeeklyReport } from "./send-weekly-report"
import { updateBrokerCommissions } from "./update-broker-commissions"

// Export all Inngest functions
export const functions = [
  sendKYCReminder,
  processPayment,
  generateCertificate,
  sendWeeklyReport,
  updateBrokerCommissions,
]
