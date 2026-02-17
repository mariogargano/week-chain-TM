// Capacity Engine exports
export * from "./types"
export * from "./engine"

// Importing the required functions
import {
  calculateTotalSupplyWeeks,
  calculateSafeCapacity,
  calculateProjectedDemand,
  determineSystemStatus,
  determineStopSaleStatus,
  runCapacityEngineCalculation,
  getLatestCapacityStatus,
  isTierAvailable,
} from "./engine"

export const CapacityEngine = {
  calculateTotalSupplyWeeks,
  calculateSafeCapacity,
  calculateProjectedDemand,
  determineSystemStatus,
  determineStopSaleStatus,
  runCapacityEngineCalculation,
  getLatestCapacityStatus,
  isTierAvailable,
}
