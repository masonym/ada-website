import { StaticImageData } from 'next/image';

export type SponsorSize = 'xs' | 'small' | 'medium' | 'large';

export type Sponsor = {
  id: string;
  name: string;
  logo: string;
  website?: string;
  description?: string;
  // For custom sizes that don't fit the standard sizes
  width?: number;
  height?: number;
  // For optimization
  priority?: boolean;
  // Standard size category for easier management
  size?: SponsorSize;
};

// All sponsors across all events
export const SPONSORS: Record<string, Sponsor> = {
  "modtech-solutions": {
    id: "modtech-solutions",
    name: "Modtech Solutions",
    logo: "/sponsors/modtech-scaled.webp",
    website: "https://modtechhawaii.com",
    description: "<b>Modtech Solutions is a Trusted Defense Technology Integrator specializing in Command and Control through Unified Communications (UC), High-Security Facilities, and Telecommunications Infrastructure</b>. Our mission—<b>\"To empower the warfighter for a safer world\"</b>— drives us to develop cutting-edge solutions that enhance security, operational readiness, and decision-making for the men and women serving our nation. In an environment where the fog of war can obscure clarity, Modtech Solutions delivers dependability to dominate the modern battle-space by ensuring the right information reaches <b>the right people at the right time—without doubt, delay, or disruption.</b>",
    priority: true,
    size: 'large'
  },
  "secure-itsm": {
    id: "secure-itsm",
    name: "Secure IT Service Management",
    logo: "/sponsors/secure-itsm.webp",
    website: "https://secureitsm.com/",
    description: "Secure IT Service Management, Inc. (SecureITSM) is a managed service provider (MSP) specializing in IT security and CMMC compliance. We deliver integrated IT management and cybersecurity solutions, including cloud and infrastructure management, security operations, ISSO support, and helpdesk services. By forming strategic partnerships with our clients, we manage their IT operations and compliance requirements while providing CIO and security guidance. Our goal is to reduce audit costs through automation and standardization of IT operations.",
    size: 'medium',
  },
  "pgi-steel": {
    id: "pgi-steel",
    name: "PGI Steel",
    logo: "/sponsors/pgi-steel.webp",
    website: "https://pgisteel.com/",
    size: 'small'
  },
  "deschamps": {
    id: "deschamps",
    name: "Deschamps",
    logo: "/sponsors/mobimat.webp",
    website: "https://defense.mobi-mat.com/",
    size: 'small'
  },
  "zero-waste": {
    id: "zero-waste",
    name: "Zero Waste Solutions",
    logo: "/sponsors/zero-waste.webp",
    website: "https://www.zerowastesolutions.com/",
    size: 'small'
  },
  "iuvo-systems": {
    id: "iuvo-systems",
    name: "Iuvo Systems",
    logo: "/sponsors/iuvo-systems.webp",
    website: "https://www.iuvosystems.com/",
    size: 'medium'
  },
  "atlas-flags": {
    id: "atlas-flags",
    name: "Atlas Flags",
    logo: "/sponsors/atlas-signature.webp",
    website: "https://atlassignature.com/",
    size: 'medium'
  },
  "itg": {
    id: "itg",
    name: "Integration Technologies Group",
    logo: "/sponsors/itg.webp",
    website: "https://www.itgonline.com/",
    size: 'medium'
  },
  "avery-group": {
    id: "avery-group",
    name: "The Avery Group",
    logo: "/sponsors/avery-group.webp",
    website: "https://theaverygroupllc.com/",
    size: 'medium'
  },
  "pmb-machine-works": {
    id: "pmb-machine-works",
    name: "PMB Machine Works",
    logo: "/sponsors/pmb-machine-works.webp",
    website: "https://pmbmachineworks.com/",
    size: 'medium'
  },
  "redstone": {
    id: "redstone",
    name: "Redstone Government Consulting",
    logo: "/sponsors/redstone.webp",
    website: "https://redstonegci.com/",
    size: 'medium'
  },
  "perimeter": {
    id: "perimeter",
    name: "Perimeter Office Products",
    logo: "/sponsors/perimeter.webp",
    website: "https://www.perimeteroffice.com/perimeter",
    size: 'small'
  },
  "css-energy": {
    id: "css-energy",
    name: "CSS Energy Solutions",
    logo: "/sponsors/css-energy.webp",
    website: "https://cssenergysolutions.com/",
    size: 'small'
  },
  "imsm": {
    id: "imsm",
    name: "IMSM",
    logo: "/sponsors/imsm.webp",
    website: "https://www.imsm.com/",
    size: 'small'
  },
  "cmpro": {
    id: "cmpro",
    name: "PSA, Inc./CMPRO",
    logo: "/sponsors/CMPRO.webp",
    website: "https://psasys.com/",
    size: 'small'
  },
  "safe-structure": {
    id: "safe-structure",
    name: "Safe Structure Designs",
    logo: "/sponsors/safe-structure.webp",
    website: "https://www.safestructuredesigns.com/",
    size: 'small'
  },
  "hungerford-terry": {
    id: "hungerford-terry",
    name: "Hungerford & Terry",
    logo: "/sponsors/ht.webp",
    website: "https://www.hungerfordterry.com/",
    size: 'small'
  },
  "dreamseat": {
    id: "dreamseat",
    name: "DreamSeat",
    logo: "/sponsors/dreamseat.webp",
    website: "https://www.dreamseat.com/",
    size: 'small'
  },
  // Event ID 3 sponsors
  "lockheed-martin": {
    id: "lockheed-martin",
    name: "Lockheed Martin",
    logo: "/sponsors/lockheed-martin.webp",
    website: "https://www.lockheedmartin.com/",
    size: 'large'
  },
  "anamo": {
    id: "anamo",
    name: "Anamo",
    logo: "/sponsors/anamo.webp",
    website: "https://anamo.io/",
    size: 'small'
  },
  "usprotech": {
    id: "usprotech",
    name: "US ProTech",
    logo: "/sponsors/usprotech.webp",
    website: "https://www.usprotech.com/",
    size: 'small'
  },
  "neat-and-nifty": {
    id: "neat-and-nifty",
    name: "Neat and Nifty",
    logo: "/sponsors/neat-and-nifty.webp",
    website: "https://www.neatandnifty.com/",
    size: 'small'
  },
  "national-association-of-spaceports": {
    id: "national-association-of-spaceports",
    name: "National Association of Spaceports",
    logo: "/sponsors/nass-logo.webp",
    website: "https://www.thenass.org/",
    size: 'small'
  },
  "american-defense-alliance": {
    id: "american-defense-alliance",
    name: "American Defense Alliance",
    logo: "/logo.webp",
    website: "https://www.americandefensealliance.org",
    size: 'small'
  },
  "the-astronauts-memorial-foundation": {
    id: "the-astronauts-memorial-foundation",
    name: "The Astronauts Memorial Foundation",
    logo: "/sponsors/amf-logo.webp",
    website: "https://www.amfcse.org",
    size: 'small'
  },
  "zarrellas-italian-and-wood-fired-pizza": {
    id: "zarrellas-italian-and-wood-fired-pizza",
    name: "Zarrellas Italian & Wood Fired Pizza",
    logo: "/sponsors/zarrellas.webp",
    website: "https://www.zarrellasitalian.com/",
    size: 'small'
  },
  // Event ID 4 sponsors
  "jbc-corp": {
    id: "jbc-corp",
    name: "JBC Corp",
    logo: "/sponsors/jbc.webp",
    website: "https://www.jbccorp.com/",
    size: 'small'
  },
  "cpisys": {
    id: "cpisys",
    name: "CPISYS",
    logo: "/sponsors/cpisys.webp",
    website: "https://cpisys.com/",
    size: 'medium'
  },
  "centurion-consulting-group": {
    id: "centurion-consulting-group",
    name: "Centurion Consulting Group",
    logo: "/sponsors/centurion.webp",
    website: "https://centurioncg.com/",
    size: 'small'
  },
  "unicor": {
    id: "unicor",
    name: "UNICOR",
    logo: "/sponsors/unicor.webp",
    website: "https://www.unicor.gov/",
    size: 'medium'
  },
  // Additional sponsors from exhibitors list
  "medava": {
    id: "medava",
    name: "Medava",
    logo: "/sponsors/medava-dark.webp",
    website: "https://medavausa.com/",
    size: 'medium'
  },
  "solid-platforms": {
    id: "solid-platforms",
    name: "Solid Platforms",
    logo: "/sponsors/solid-platforms.webp",
    website: "https://www.solidplatforms.com/",
    size: 'small'
  },
  "gt-apex": {
    id: "gt-apex",
    name: "GT Apex",
    logo: "/sponsors/gt-apex.webp",
    website: "https://gtapexaccelerator.org/",
    size: 'small'
  },
  "national-energy": {
    id: "national-energy",
    name: "National Energy",
    logo: "/sponsors/national-energy.webp",
    website: "https://nationalenergyusa.com/",
    size: 'small'
  },
  "precision-resource": {
    id: "precision-resource",
    name: "Precision Resource",
    logo: "/sponsors/precision-resource.webp",
    website: "https://www.precisionresource.com/",
    size: 'medium'
  },
  "the-avery-group": {
    id: "the-avery-group",
    name: "The Avery Group",
    logo: "/sponsors/avery-group.webp",
    website: "https://theaverygroupllc.com/",
    size: 'medium'
  },
  "ardmore": {
    id: "ardmore",
    name: "ardmore Consulting Group",
    logo: "/sponsors/ardmore.webp",
    website: "https://ardmore28.com/",
    size: 'medium'
  },
  "six-axis": {
    id: "six-axis",
    name: "Six Axis",
    logo: "/sponsors/sixaxis.webp",
    website: "https://www.sixaxisllc.com/",
    size: 'small'
  },
  "usace": {
    id: "usace",
    name: "USACE",
    logo: "/sponsors/usace.webp",
    website: "https://www.mvm.usace.army.mil/",
    size: 'small'
  },
  "foundation-technologies": {
    id: "foundation-technologies",
    name: "Foundation Technologies, Inc.",
    logo: "/sponsors/foundation-technologies.webp",
    website: "https://www.foundationtechnologies.com/",
    size: 'small'
  },
  "kdm": {
    id: "kdm",
    name: "KDM & Associates",
    logo: "/sponsors/kdm.webp",
    website: "https://kdm-assoc.com/",
    size: 'small'
  },
  "mbda": {
    id: "mbda",
    name: "MBDA Federal Procurement Center",
    logo: "/sponsors/mbda.webp",
    website: "https://www.mbda.gov/business-center/mbda-federal-procurement-center",
    size: 'small'
  },
  "absolute-supply": {
    id: "absolute-supply",
    name: "Absolute Supply & Services LLC",
    logo: "/sponsors/absolute-supply.webp",
    website: "https://absolutesupplyandservices.com/",
    size: 'small'
  },
  "new-wave": {
    id: "new-wave",
    name: "New Wave People",
    logo: "/sponsors/new-wave-people.webp",
    website: "https://nwpusa.com/",
    size: 'small'
  },
  "normandeau": {
    id: "normandeau",
    name: "Normandeau Associates",
    logo: "/sponsors/normandeau.webp",
    website: "https://www.normandeau.com/",
    size: 'small'
  },
  "melrose": {
    id: "melrose",
    name: "Melrose INC",
    logo: "/sponsors/melrose.webp",
    website: "https://melroseinc.com/",
    size: 'small'
  },
  "advance-safety-equipment": {
    id: "advance-safety-equipment",
    name: "Advance Safety Equipment",
    logo: "/sponsors/advance-safety-equipment.webp",
    website: "https://advancesafetyequip.com/",
    size: 'small'
  },
  "hartwood-consulting-group": {
    id: "hartwood-consulting-group",
    name: "Hartwood Consulting Group",
    logo: "/sponsors/hartwood-consulting-group.webp",
    website: "https://hartwoodcg.com/",
    size: 'small'
  },
  "us-hazmat-rentals": {
    id: "us-hazmat-rentals",
    name: "US Hazmat Rentals",
    logo: "/sponsors/us-hazmat-rentals.webp",
    website: "https://ushazmatrentals.com/",
    size: 'small'
  },
  "wise-technical-innovations": {
    id: "wise-technical-innovations",
    name: "Wise Technical Innovations",
    logo: "/sponsors/wise-technical-innovations.webp",
    website: "https://www.wtinetworks.com/",
    size: 'small'
  },
  "smart-choice-technologies": {
    id: "smart-choice-technologies",
    name: "Smart Choice Technologies",
    logo: "/sponsors/smart-choice-technologies.webp",
    website: "https://www.hiresmartchoice.com/",
    size: 'small'
  },
  "bn-inspection": {
    id: "bn-inspection",
    name: "B&N Inspection",
    logo: "/sponsors/bn-inspection.webp",
    website: "https://www.bninspects.com/",
    size: 'small'
  },
  "yadejs": {
    id: "yadejs",
    name: "Yadejs, Inc.",
    logo: "/sponsors/yadejs.webp",
    website: "https://www.yadejs.com/",
    size: 'xs'
  },
  "lysol": {
    id: "lysol",
    name: "Lysol",
    logo: "/sponsors/lysol.webp",
    website: "https://www.reckitt.com/",
    size: 'small'
  },
  "avanti": {
    id: "avanti",
    name: "Avanti Corporation",
    logo: "/sponsors/avanti.webp",
    website: "https://www.avanticorporation.com/",
    size: 'small'
  },
  "north-american-rescue": {
    id: "north-american-rescue",
    name: "North American Rescue",
    logo: "/sponsors/north-american-rescue.webp",
    website: "https://www.narescue.com/",
    size: 'small'
  },
  "curtis-power-solutions": {
    id: "curtis-power-solutions",
    name: "Curtis Power Solutions",
    logo: "/sponsors/curtis-power-solutions.webp",
    website: "https://www.curtispowersolutions.com/",
    size: 'small'
  },
  "nib": {
    id: "nib",
    name: "National Industries for the Blind",
    logo: "/sponsors/nib.webp",
    website: "https://www.nib.org/",
    size: 'small'
  },
  "one-blue-yonder": {
    id: "one-blue-yonder",
    name: "One Blue Yonder",
    logo: "/sponsors/one-blue-yonder.webp",
    website: "https://www.onenetwork.com/industries/public-sector-and-defense/",
    size: 'large',
    description: "One Network Enterprises (ONE), a Blue Yonder company, is the leader in supply chain control towers, and provider of the Digital Supply Chain NetworkTM. It is the only solution that gives supply chain managers and executives end-to-end visibility and control with one data model and one truth, from raw material to last mile delivery. Powered by NEO, One Network’s machine learning and intelligent agent technology, it enables seamless planning and execution, across inbound supply, outbound order fulfillment, and logistics, matching demand with available supply in real-time. Lead your industry by providing the highest service levels and product quality at the lowest possible cost.",
  },
  "westwind": {
    id: "westwind",
    name: "Westwind",
    logo: "/sponsors/westwind.webp",
    website: "https://www.wwcpinc.com/",
    size: 'small'
  },
  "training-concepts": {
    id: "training-concepts",
    name: "Training Concepts",
    logo: "/sponsors/training-concepts.webp",
    website: "https://www.trainingconcepts.com/",
    size: 'small'
  },
  "dronexus": {
    id: "dronexus",
    name: "Dronexus",
    logo: "/sponsors/dronexus.webp",
    size: 'small'
  },
  "ana-sourcing": {
    id: "ana-sourcing",
    name: "ANA Sourcing",
    logo: "/sponsors/ana-sourcing.webp",
    website: "https://www.anasourcing.com/",
    size: 'small'
  },
  "allied-materials": {
    id: "allied-materials",
    name: "Allied Materials",
    logo: "/sponsors/allied-materials-long.webp",
    website: "https://www.alliedmaterials.com/",
    size: 'small'
  },
  "reel-coh": {
    id: "reel-coh",
    name: "Reel COH",
    logo: "/sponsors/reel-coh.webp",
    website: "https://reel-coh.com/",
    size: 'small'
  },
  "cp2s-alytic": {
    id: "cp2s-alytic",
    name: "CP2S & Alytic, Inc.",
    logo: "/sponsors/cp2s-alytic.webp",
    website: "https://www.cp2susa.com/",
    size: 'small'
  },
  "hampton-roads-alliance": {
    id: "hampton-roads-alliance",
    name: "Hampton Roads Alliance",
    logo: "/sponsors/hampton-roads-alliance.webp",
    website: "https://www.hamptonroadsalliance.com/",
    size: 'medium'
  },
  "mcs-government-services": {
    id: "mcs-government-services",
    name: "MCS Government Services",
    logo: "/sponsors/mcs-government-services.webp",
    website: "https://www.mcs360.com/",
    size: 'small'
  },
  "virginia-apex": {
    id: "virginia-apex",
    name: "Virginia APEX Accelerator",
    logo: "/sponsors/virginia-apex.webp",
    website: "https://virginiaapex.org/",
    size: 'small'
  },
  "oak-theory": {
    id: "oak-theory",
    name: "Oak Theory",
    logo: "/sponsors/oak-theory.webp",
    website: "https://www.oaktheory.co/",
    size: 'small'
  },
  "mass-virtual": {
    id: "mass-virtual",
    name: "Mass Virtual",
    logo: "/sponsors/mass-virtual.webp",
    website: "https://www.massvirtual.com/",
    size: 'small'
  },
  "admark": {
    id: "admark",
    name: "AdMark",
    logo: "/sponsors/admark.webp",
    website: "https://www.admarkllc.com/",
    size: 'small'
  },
  "lgh": {
    id: "lgh",
    name: "LGH",
    logo: "/sponsors/lgh.webp",
    website: "https://www.rentlgh.com/",
    size: 'small'
  },
  "iti": {
    id: "iti",
    name: "ITI",
    logo: "/sponsors/iti.webp",
    website: "https://www.infintech.com/",
    size: 'small'
  },
  "conductive-containers": {
    id: "conductive-containers",
    name: "Conductive Containers, Inc.",
    logo: "/sponsors/conductive-containers.webp",
    website: "https://www.conductivecontainers.com/",
    size: 'small'
  },
};

// Helper function to get a sponsor by ID
export const getSponsor = (id: string): Sponsor | undefined => {
  return SPONSORS[id];
};

// Helper function to get multiple sponsors by IDs
export const getSponsors = (ids: string[]): Sponsor[] => {
  return ids.map(id => SPONSORS[id]).filter(sponsor => sponsor !== undefined);
};

// Standard size dimensions - can be used for styling
export const SPONSOR_SIZES = {
  xs: {
    maxWidth: 200,
    maxHeight: 100
  },
  small: {
    maxWidth: 300,
    maxHeight: 200
  },
  medium: {
    maxWidth: 400,
    maxHeight: 300
  },
  large: {
    maxWidth: 1000,
    maxHeight: 400
  }
};
