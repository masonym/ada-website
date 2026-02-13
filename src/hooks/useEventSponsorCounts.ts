import { useState, useEffect } from 'react'

export type TierSponsorCount = {
  id: string
  sponsorCount: number
}

// fetches tier sponsor counts from sanity via api for sold-out checks
export function useEventSponsorCounts(eventId: number | string) {
  const [tiers, setTiers] = useState<TierSponsorCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchCounts() {
      try {
        const response = await fetch(`/api/event-sponsors?eventId=${eventId}`)
        const data = await response.json()
        if (!cancelled && data.tiers) {
          setTiers(data.tiers)
        }
      } catch (error) {
        console.error('Error fetching event sponsor counts:', error)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchCounts()
    return () => { cancelled = true }
  }, [eventId])

  // get sponsor count for a specific tier
  const getSponsorCount = (tierId: string): number => {
    const tier = tiers.find(t => t.id === tierId)
    return tier?.sponsorCount ?? 0
  }

  return { tiers, loading, getSponsorCount }
}
