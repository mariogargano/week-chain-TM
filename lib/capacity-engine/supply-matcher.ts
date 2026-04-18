import { createClient } from "@/lib/supabase/server"
import { addDays } from "date-fns"

export interface MatchOptions {
  desired_start_date: string
  desired_end_date: string
  flexibility_days: number
  party_size: number
  destination_preference?: string
  category_preference?: string
}

export interface PropertyMatch {
  property: any
  score: number
  available_start: string
  available_end: string
}

export async function findBestPropertyMatch(options: MatchOptions): Promise<PropertyMatch | null> {
  const supabase = await createClient()

  // Get all active properties
  const { data: properties, error } = await supabase
    .from("supply_properties")
    .select("*")
    .eq("status", "active")
    .gte("max_occupancy", options.party_size)

  if (error || !properties || properties.length === 0) {
    console.error("[v0] No active properties found:", error)
    return null
  }

  // Filter by destination if specified
  let filteredProperties = properties
  if (options.destination_preference) {
    filteredProperties = properties.filter(
      (p) =>
        p.country.toLowerCase().includes(options.destination_preference!.toLowerCase()) ||
        p.city.toLowerCase().includes(options.destination_preference!.toLowerCase()),
    )
  }

  // Filter by category if specified
  if (options.category_preference && options.category_preference !== "any") {
    filteredProperties = filteredProperties.filter((p) => p.category === options.category_preference)
  }

  if (filteredProperties.length === 0) {
    // No exact match, return best available
    filteredProperties = properties
  }

  // Check availability for each property
  const matches: PropertyMatch[] = []

  for (const property of filteredProperties) {
    // Get existing confirmed reservations for this property
    const { data: reservations } = await supabase
      .from("confirmed_reservations")
      .select("check_in, check_out")
      .eq("property_id", property.id)
      .neq("status", "cancelled")

    // Check if desired dates are available
    const desiredStart = new Date(options.desired_start_date)
    const desiredEnd = new Date(options.desired_end_date)

    let isAvailable = true
    if (reservations) {
      for (const res of reservations) {
        const resStart = new Date(res.check_in)
        const resEnd = new Date(res.check_out)

        // Check for overlap
        if (desiredStart < resEnd && desiredEnd > resStart) {
          isAvailable = false
          break
        }
      }
    }

    if (isAvailable) {
      // Calculate match score
      let score = 100

      // Destination match bonus
      if (options.destination_preference) {
        if (property.city.toLowerCase().includes(options.destination_preference.toLowerCase())) {
          score += 50
        } else if (property.country.toLowerCase().includes(options.destination_preference.toLowerCase())) {
          score += 25
        }
      }

      // Category match bonus
      if (options.category_preference && options.category_preference === property.category) {
        score += 30
      }

      // Occupancy fit bonus (prefer properties that fit party size well)
      const occupancyFit = property.max_occupancy - options.party_size
      if (occupancyFit >= 0 && occupancyFit <= 2) {
        score += 20
      }

      matches.push({
        property,
        score,
        available_start: options.desired_start_date,
        available_end: options.desired_end_date,
      })
    } else if (options.flexibility_days > 0) {
      // Try flexible dates
      for (let offset = -options.flexibility_days; offset <= options.flexibility_days; offset += 7) {
        const flexStart = addDays(desiredStart, offset)
        const flexEnd = addDays(desiredEnd, offset)

        let flexAvailable = true
        if (reservations) {
          for (const res of reservations) {
            const resStart = new Date(res.check_in)
            const resEnd = new Date(res.check_out)

            if (flexStart < resEnd && flexEnd > resStart) {
              flexAvailable = false
              break
            }
          }
        }

        if (flexAvailable) {
          let score = 80 - Math.abs(offset) // Penalize dates further from desired

          if (options.destination_preference) {
            if (property.city.toLowerCase().includes(options.destination_preference.toLowerCase())) {
              score += 50
            } else if (property.country.toLowerCase().includes(options.destination_preference.toLowerCase())) {
              score += 25
            }
          }

          matches.push({
            property,
            score,
            available_start: flexStart.toISOString().split("T")[0],
            available_end: flexEnd.toISOString().split("T")[0],
          })
          break // Only add one flexible date option per property
        }
      }
    }
  }

  // Sort by score and return best match
  matches.sort((a, b) => b.score - a.score)

  return matches.length > 0 ? matches[0] : null
}

export async function findAlternativeProperties(
  excludePropertyId: string,
  options: MatchOptions,
): Promise<PropertyMatch[]> {
  const supabase = await createClient()

  const { data: properties } = await supabase
    .from("supply_properties")
    .select("*")
    .eq("status", "active")
    .neq("id", excludePropertyId)
    .gte("max_occupancy", options.party_size)
    .limit(5)

  if (!properties || properties.length === 0) {
    return []
  }

  const alternatives: PropertyMatch[] = []

  for (const property of properties) {
    const { data: reservations } = await supabase
      .from("confirmed_reservations")
      .select("check_in, check_out")
      .eq("property_id", property.id)
      .neq("status", "cancelled")

    const desiredStart = new Date(options.desired_start_date)
    const desiredEnd = new Date(options.desired_end_date)

    let isAvailable = true
    if (reservations) {
      for (const res of reservations) {
        const resStart = new Date(res.check_in)
        const resEnd = new Date(res.check_out)

        if (desiredStart < resEnd && desiredEnd > resStart) {
          isAvailable = false
          break
        }
      }
    }

    if (isAvailable) {
      alternatives.push({
        property,
        score: 50, // Lower score for alternatives
        available_start: options.desired_start_date,
        available_end: options.desired_end_date,
      })
    }
  }

  return alternatives
}
