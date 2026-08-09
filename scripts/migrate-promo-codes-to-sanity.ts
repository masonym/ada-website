/**
 * Migration script to move promo codes from hardcoded constants to Sanity CMS
 * 
 * Run with: npx ts-node scripts/migrate-promo-codes-to-sanity.ts
 * 
 * Make sure SANITY_WRITE_TOKEN is set in your .env file
 */

import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: 'nc4xlou0',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-11-30',
  token: process.env.SANITY_WRITE_TOKEN,
})

// Copy of the promo codes from src/lib/promo-codes/index.ts
const PROMO_CODES = [
  {
    code: 'ACEC15',
    discountPercentage: 15,
    eligibleTicketTypes: ['attendee-pass', 'vip-attendee-pass'],
    eligibleEventIds: [4],
    expirationDate: new Date('2025-12-31'),
    description: 'ACEC15 - 15% off Attendee and VIP Attendee passes for Navy & Marine Corps Conference',
    isActive: true,
    autoApply: false
  },
  {
    code: 'ADA20',
    discountPercentage: 20,
    eligibleTicketTypes: [
      'attendee-pass',
      'vip-attendee-pass',
      'exhibit',
      'platinum-sponsor',
      'gold-sponsor',
      'silver-sponsor',
      'bronze-sponsor',
      'vip-networking-reception-sponsor',
      'networking-luncheon-sponsor',
      'small-business-sponsor',
      'small-business-sponsor-without-exhibit-space'
    ],
    eligibleEventIds: [4, 5, 6],
    expirationDate: new Date('2026-12-31'),
    description: 'ADA20 - 20% off eligible passes and sponsorships for Navy & Marine Corps and Defense Technology conferences',
    isActive: true,
    autoApply: false
  },
  {
    code: 'ADA10',
    discountPercentage: 10,
    eligibleTicketTypes: [
      'attendee-pass',
      'vip-attendee-pass',
      'exhibit',
      'platinum-sponsor',
      'gold-sponsor',
      'silver-sponsor',
      'bronze-sponsor',
      'vip-networking-reception-sponsor',
      'networking-luncheon-sponsor',
      'small-business-sponsor',
      'small-business-sponsor-without-exhibit-space'
    ],
    eligibleEventIds: [4, 5, 6],
    expirationDate: new Date('2026-12-31'),
    description: 'ADA10 - 10% off eligible passes and sponsorships for Navy & Marine Corps and Defense Technology conferences',
    isActive: true,
    autoApply: false
  },
  {
    code: 'EARLY10',
    discountPercentage: 10,
    eligibleTicketTypes: [
      'attendee-pass',
      'vip-attendee-pass',
      'exhibit',
      'platinum-sponsor',
      'gold-sponsor',
      'silver-sponsor',
      'bronze-sponsor',
      'vip-networking-reception-sponsor',
      'networking-luncheon-sponsor',
      'small-business-sponsor',
      'small-business-sponsor-without-exhibit-space'
    ],
    eligibleEventIds: [5, 6],
    expirationDate: new Date('2025-08-18T04:00:00Z'),
    description: 'EARLY10 - 10% off eligible tickets for event (excludes additional passes)',
    isActive: true,
    autoApply: true
  },
  {
    code: 'NSIC20',
    discountPercentage: 20,
    eligibleTicketTypes: [
      'attendee-pass',
      'vip-attendee-pass',
      'exhibit',
      'platinum-sponsor',
      'gold-sponsor',
      'silver-sponsor',
      'bronze-sponsor',
      'vip-networking-reception-sponsor',
      'networking-luncheon-sponsor',
      'small-business-sponsor',
      'small-business-sponsor-without-exhibit-space'
    ],
    eligibleEventIds: [5],
    expirationDate: new Date('2026-11-18T04:00:00Z'),
    description: 'NSIC20 - 20% off eligible tickets for event (excludes additional passes)',
    isActive: true,
    autoApply: false
  },
  {
    code: 'BLACKFRIDAY',
    discountPercentage: 15,
    eligibleTicketTypes: [
      'attendee-pass',
      'vip-attendee-pass',
      'exhibit',
      'platinum-sponsor',
      'gold-sponsor',
      'silver-sponsor',
      'bronze-sponsor',
      'vip-networking-reception-sponsor',
      'networking-luncheon-sponsor',
      'small-business-sponsor',
      'small-business-sponsor-without-exhibit-space'
    ],
    eligibleEventIds: [5, 6],
    expirationDate: new Date('2025-12-02T05:00:00Z'),
    description: 'BLACKFRIDAY - 15% off eligible passes and sponsorships for 2026 Defense Technology & Aerospace and Navy & Marine Corps conferences',
    isActive: true,
    autoApply: false
  },
  {
    code: 'KDM10',
    discountPercentage: 10,
    eligibleTicketTypes: [
      'attendee-pass',
      'vip-attendee-pass',
      'exhibit',
      'platinum-sponsor',
      'gold-sponsor',
      'silver-sponsor',
      'bronze-sponsor',
      'vip-networking-reception-sponsor',
      'networking-luncheon-sponsor',
      'small-business-sponsor',
      'small-business-sponsor-without-exhibit-space'
    ],
    eligibleEventIds: [5, 6],
    expirationDate: new Date('2035-12-02T05:00:00Z'),
    description: 'KDM10 - 10% off eligible passes and sponsorships for 2026 Defense Technology & Aerospace and Navy & Marine Corps conferences',
    isActive: true,
    autoApply: false
  },
  {
    code: 'TECH10',
    discountPercentage: 10,
    eligibleTicketTypes: [
      'attendee-pass',
      'vip-attendee-pass',
      'exhibit',
      'platinum-sponsor',
      'gold-sponsor',
      'silver-sponsor',
      'bronze-sponsor',
      'vip-networking-reception-sponsor',
      'networking-luncheon-sponsor',
      'small-business-sponsor',
      'small-business-sponsor-without-exhibit-space'
    ],
    eligibleEventIds: [5],
    expirationDate: new Date('2026-12-02T05:00:00Z'),
    description: 'TECH10 - 10% off eligible passes and sponsorships for 2026 Defense Technology & Aerospace conference',
    isActive: true,
    autoApply: false
  },
  {
    code: 'PMB25',
    discountPercentage: 25,
    eligibleTicketTypes: [
      'attendee-pass',
      'vip-attendee-pass',
      'exhibit',
      'platinum-sponsor',
      'gold-sponsor',
      'silver-sponsor',
      'bronze-sponsor',
      'vip-networking-reception-sponsor',
      'networking-luncheon-sponsor',
      'small-business-sponsor',
      'small-business-sponsor-without-exhibit-space'
    ],
    eligibleEventIds: [6],
    expirationDate: new Date('2026-12-02T05:00:00Z'),
    description: 'PMB25 - 25% off eligible passes and sponsorships for 2026 Navy & Marine Corps conference',
    isActive: false,
    autoApply: false
  },
  {
    code: 'CSS25',
    discountPercentage: 25,
    eligibleTicketTypes: [
      'attendee-pass',
      'vip-attendee-pass',
      'exhibit',
      'platinum-sponsor',
      'gold-sponsor',
      'silver-sponsor',
      'bronze-sponsor',
      'vip-networking-reception-sponsor',
      'networking-luncheon-sponsor',
      'small-business-sponsor',
      'small-business-sponsor-without-exhibit-space'
    ],
    eligibleEventIds: [6],
    expirationDate: new Date('2026-12-02T05:00:00Z'),
    description: 'CSS25 - 25% off eligible passes and sponsorships for 2026 Navy & Marine Corps conference',
    isActive: false,
    autoApply: false
  },
  {
    code: 'CISEVE15',
    discountPercentage: 15,
    eligibleTicketTypes: [
      'attendee-pass',
      'vip-attendee-pass',
      'exhibit',
      'platinum-sponsor',
      'gold-sponsor',
      'silver-sponsor',
      'bronze-sponsor',
      'vip-networking-reception-sponsor',
      'networking-luncheon-sponsor',
      'small-business-sponsor',
      'small-business-sponsor-without-exhibit-space'
    ],
    eligibleEventIds: [5],
    expirationDate: new Date('2026-12-02T05:00:00Z'),
    description: 'CISEVE15 - 15% off eligible passes and sponsorships for 2026 Defense Technology conference',
    isActive: true,
    autoApply: false
  },
  {
    code: 'CISEVE20',
    discountPercentage: 20,
    eligibleTicketTypes: [
      'attendee-pass',
      'vip-attendee-pass',
      'exhibit',
      'platinum-sponsor',
      'gold-sponsor',
      'silver-sponsor',
      'bronze-sponsor',
      'vip-networking-reception-sponsor',
      'networking-luncheon-sponsor',
      'small-business-sponsor',
      'small-business-sponsor-without-exhibit-space'
    ],
    eligibleEventIds: [5, 6],
    expirationDate: new Date('2026-12-02T05:00:00Z'),
    description: 'CISEVE20 - 20% off eligible passes and sponsorships for 2025 Defense Technology & 2026 Navy & Marine Corps conference',
    isActive: true,
    autoApply: false
  },
  {
    code: 'ADA15',
    discountPercentage: 15,
    eligibleTicketTypes: [
      'attendee-pass',
      'vip-attendee-pass',
      'exhibit',
      'platinum-sponsor',
      'gold-sponsor',
      'silver-sponsor',
      'bronze-sponsor',
      'vip-networking-reception-sponsor',
      'networking-luncheon-sponsor',
      'small-business-sponsor',
      'small-business-sponsor-without-exhibit-space'
    ],
    eligibleEventIds: [5, 6],
    expirationDate: new Date('2027-12-02T05:00:00Z'),
    description: 'ADA15',
    isActive: true,
    autoApply: false
  },
  {
    code: 'CET10',
    discountPercentage: 10,
    eligibleTicketTypes: [
      'attendee-pass',
      'vip-attendee-pass',
      'exhibit',
      'platinum-sponsor',
      'gold-sponsor',
      'silver-sponsor',
      'bronze-sponsor',
      'vip-networking-reception-sponsor',
      'networking-luncheon-sponsor',
      'small-business-sponsor',
      'small-business-sponsor-without-exhibit-space'
    ],
    eligibleEventIds: [5],
    expirationDate: new Date('2027-12-02T05:00:00Z'),
    description: 'CET10',
    isActive: true,
    autoApply: false
  },
  {
    code: 'AEBC10',
    discountPercentage: 10,
    eligibleTicketTypes: [
      'attendee-pass',
      'vip-attendee-pass',
      'exhibit',
      'platinum-sponsor',
      'gold-sponsor',
      'silver-sponsor',
      'bronze-sponsor',
      'vip-networking-reception-sponsor',
      'networking-luncheon-sponsor',
      'small-business-sponsor',
      'small-business-sponsor-without-exhibit-space'
    ],
    eligibleEventIds: [5, 6],
    expirationDate: new Date('2027-12-31T05:00:00Z'),
    description: 'AEBC10',
    isActive: true,
    autoApply: false
  },
  {
    code: 'PMP10',
    discountPercentage: 10,
    eligibleTicketTypes: [
      'attendee-pass',
      'vip-attendee-pass',
      'exhibit',
      'platinum-sponsor',
      'gold-sponsor',
      'silver-sponsor',
      'bronze-sponsor',
      'vip-networking-reception-sponsor',
      'networking-luncheon-sponsor',
      'small-business-sponsor',
      'small-business-sponsor-without-exhibit-space'
    ],
    eligibleEventIds: [5, 6],
    expirationDate: new Date('2027-12-31T05:00:00Z'),
    description: 'PMP10',
    isActive: true,
    autoApply: false
  },
  {
    code: 'STARTUP10',
    discountPercentage: 10,
    eligibleTicketTypes: [
      'attendee-pass',
      'vip-attendee-pass',
      'exhibit',
      'platinum-sponsor',
      'gold-sponsor',
      'silver-sponsor',
      'bronze-sponsor',
      'vip-networking-reception-sponsor',
      'networking-luncheon-sponsor',
      'small-business-sponsor',
      'small-business-sponsor-without-exhibit-space'
    ],
    eligibleEventIds: [6],
    expirationDate: new Date('2027-12-31T05:00:00Z'),
    description: 'STARTUP10',
    isActive: true,
    autoApply: false
  }
]

async function migratePromoCodes() {
  console.log('Starting promo code migration to Sanity...\n')

  if (!process.env.SANITY_WRITE_TOKEN) {
    console.error('ERROR: SANITY_WRITE_TOKEN not found in environment variables')
    process.exit(1)
  }

  // Check for existing promo codes
  const existingCodes = await client.fetch<{ code: string }[]>(`
    *[_type == "promoCode"] { code }
  `)
  const existingCodeSet = new Set(existingCodes.map(c => c.code))

  console.log(`Found ${existingCodes.length} existing promo codes in Sanity`)

  let created = 0
  let skipped = 0

  for (const promo of PROMO_CODES) {
    if (existingCodeSet.has(promo.code)) {
      console.log(`  SKIP: ${promo.code} (already exists)`)
      skipped++
      continue
    }

    try {
      await client.create({
        _type: 'promoCode',
        code: promo.code,
        discountPercentage: promo.discountPercentage,
        eligibleTicketTypes: promo.eligibleTicketTypes,
        eligibleEventIds: promo.eligibleEventIds,
        expirationDate: promo.expirationDate.toISOString(),
        description: promo.description || '',
        isActive: promo.isActive,
        autoApply: promo.autoApply || false,
      })
      console.log(`  CREATE: ${promo.code} (${promo.discountPercentage}% off)`)
      created++
    } catch (error) {
      console.error(`  ERROR: Failed to create ${promo.code}:`, error)
    }
  }

  console.log('\n--- Migration Complete ---')
  console.log(`Created: ${created}`)
  console.log(`Skipped: ${skipped}`)
  console.log(`Total: ${PROMO_CODES.length}`)
}

migratePromoCodes().catch(console.error)
