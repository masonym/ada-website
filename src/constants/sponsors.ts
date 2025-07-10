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
    size: 'medium',
    description: "PMB Machine Works is the specialty machining division of Pioneer Motor Bearing Company that incorporates the vast machining experience of the legacy 100+ year old business, which has proudly served the DOD since the 1950s. PMB has provided high quality machined parts and engineering services to the U.S. Navy for multiple Navy vessels including nuclear submarines. PMB has also served the Department of Energy’s nuclear laboratories, as well as performed work for the Army Corps of Engineers on multiple hydro and gas turbine power generation facilities. Our history of high reliability, superior quality and getting it right the first time is what we are known for. PMB Machine Works’ legacy unit is the exclusive bearing licensee of GE Vernova and the senior bearing licensee of Siemens Energy. Furthermore, they have served the majority of electrical utilities in the USA and are sought after throughout the world for their turn-key engineering and manufacturing expertise.",
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
  "blue-yonder": {
    id: "blue-yonder",
    name: "Blue Yonder",
    logo: "/sponsors/blue-yonder.webp",
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
    size: 'medium',
    description: "MCS Government Services brings nearly 40 years of experience delivering comprehensive property preservation, facilities maintenance, and asset management services across government and private sectors.  Our core capabilities include inspection services, general maintenance, landscaping, plumbing, renovations, disaster response, and full-spectrum facility support—enabled by a cloud-based platform that ensures real-time visibility and performance tracking. We are actively seeking small business partners who bring specialized trade skills, federal government experience, or mission-aligned capabilities in areas such as grounds maintenance, emergency management, and O&M. Whether you're a niche provider or a growing firm with federal experience, we’re looking to build long-term, mutually beneficial relationships that expand our reach and strengthen our delivery. Let’s connect and explore how we can team together to serve government customers more effectively."
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
  "cinch": {
    id: "cinch",
    name: "Cinch Systems",
    logo: "/sponsors/cinch.webp",
    website: "https://www.cinchsystems.com/",
    size: 'small'
  },
  "didlake": {
    id: "didlake",
    name: "Didlake, Inc.",
    logo: "/sponsors/didlake.webp",
    website: "https://www.didlake.org/",
    size: 'small'
  },
  "equipment-share": {
    id: "equipment-share",
    name: "EquipmentShare",
    logo: "/sponsors/equipment-share.webp",
    website: "https://www.equipmentshare.com/",
    size: 'small'
  },
  "dmg-mori": {
    id: "dmg-mori",
    name: "DMG Mori",
    logo: "/sponsors/dmg-mori.webp",
    website: "https://www.dmgmori-fs.com/",
    size: 'large',
    description: "The DMG MORI Group is a leading innovator in the machine tool industry with an expansive portfolio of manufacturing equipment. We are focused on customer support, quality, service, and advanced technology. Our product line includes 5-Axis Milling machines, 4 and 5-Axis Horizontal Machining Centers, Additive machines, Hybrid machines, Vertical Machining Centers, CNC Turning machines, CNC Boring mills, and a variety of Palletized systems and Grinding machines. With over 12,000 team members world-wide, our group companies specialize in providing unmatched applications support, service and training to large OEMs, Tier-one contractors, and the US government itself. DMG MORI Federal Services (DMFS) works exclusively with US federal and State government agencies to support government initiatives while focusing on federal acquisition regulations and cybersecurity compliance. DMFS is also (ITAR) Registered, (CMMC) 2.0 level 2 compliant ready, and (NIST) compliant. We currently have active projects with the Army, Navy, Air Force, Department of Energy, and NASA.",
  },
  "visit-norfolk": {
    id: "visit-norfolk",
    name: "Visit Norfolk",
    logo: "/sponsors/visit-norfolk.webp",
    website: "https://www.visitnorfolktoday.com/",
    size: 'medium',
  },
  "don-office-of-small-business-programs": {
    id: "don-office-of-small-business-programs",
    name: "DON Office of Small Business Programs",
    logo: "/sponsors/don-office-of-small-business-programs.webp",
    website: "https://www.secnav.navy.mil/smallbusiness",
    size: 'small'
  },
  "navsup-fleet-logistics-center-norfolk": {
    id: "navsup-fleet-logistics-center-norfolk",
    name: "NAVSUP Fleet Logistics Center Norfolk",
    logo: "/sponsors/navsup-fleet-logistics-center-norfolk.webp",
    website: "https://www.navsup.navy.mil/navsup-enterprise/navsup-flc-norfolk",
    size: 'small',
    description: "We are the U.S. Navy’s oldest and largest Fleet Logistics Center, providing quality supply and logistics support on the Norfolk waterfront for more than a century. Our command footprint includes 30 naval installations in 13 states, plus the District of Columbia. Our team of more than 1,800 dedicated military, civil service, and contractor professionals provides support across twelve distinct products and services, tailored to the needs of each individual customer",
  },
  "norfolk-naval-shipyard": {
    id: "norfolk-naval-shipyard",
    name: "Norfolk Naval Shipyard",
    logo: "/sponsors/norfolk-naval-shipyard.webp",
    website: "https://www.navsea.navy.mil/home/shipyards/norfolk",
    size: 'small',
    description: "Norfolk Naval Shipyard’s mission is to repair, modernize, and inactivate our Navy’s warships and training platforms. We do that by winning as a team, being excellent in all that we do, and continuously improving our processes and flow. Our vision is to deliver on time, every time, and everywhere to protect America."
  },
  "cignys": {
    id: "cignys",
    name: "CIGNYS",
    logo: "/sponsors/cignys.webp",
    website: "https://www.cignys.com/",
    size: 'small'
  },
  "metgreen-solutions": {
    id: "metgreen-solutions",
    name: "MetGreen Solutions",
    logo: "/sponsors/metgreen-solutions.webp",
    website: "https://metgreensolutions.com/",
    size: 'small'
  },
  "marzen-group-llc": {
    id: "marzen-group-llc",
    name: "Marzen Group, LLC",
    logo: "/sponsors/marzen-group-llc.webp",
    website: "https://www.marzen-group.com/",
    size: 'small'
  },
  "rite-in-the-rain": {
    id: "rite-in-the-rain",
    name: "Rite in the Rain",
    logo: "/sponsors/rite-in-the-rain.webp",
    website: "https://www.riteintherain.com/",
    size: 'small'
  },
  "bounce-imaging": {
    id: "bounce-imaging",
    name: "Bounce Imaging",
    logo: "/sponsors/bounce-imaging.webp",
    website: "https://bounceimaging.com/",
    size: 'small'
  },
  "hanwha-defense-usa": {
    id: "hanwha-defense-usa",
    name: "Hanwha Defense USA",
    logo: "/sponsors/hanwha-defense-usa.webp",
    website: "https://hanwhadefenseusa.com/",
    size: 'large',
    description: "Hanwha Defense USA develops and supplies advanced ground and sea combat systems, including manned and unmanned platforms, artillery, and ammunition, to enhance the capabilities and survivability of military forces We specialize in providing advanced ground combat platforms, maritime solutions, and ammunition systems. We develop and supply a wide array of manned and unmanned combat systems, including state-of-the-art artillery and advanced ammunition designed to meet the rigorous demands of modern warfare. Our products aim to enhance the firepower, mobility, and survivability of military forces, ensuring they remain highly effective and adaptable in diverse combat scenarios With a focus on innovation and operational efficiency, Hanwha Defense USA is committed to delivering mission-oriented solutions that significantly improve the operational capabilities of ground and maritime forces. Our expertise encompasses developing technologies that ensure superior performance in the field, thereby contributing to the safety and effectiveness of military personnel.",
  },
  "trust-consulting-services": {
    id: "trust-consulting-services",
    name: "Trust Consulting Services",
    logo: "/sponsors/trust-consulting-services.webp",
    website: "https://www.trustconsultingservices.com/",
    size: 'small'
  },
  "pc-campana": {
    id: "pc-campana",
    name: "PC Campana",
    logo: "/sponsors/pc-campana.webp",
    website: "https://www.pccampana.com/",
    size: 'small'
  },
  "pferd-tools": {
    id: "pferd-tools",
    name: "Pferd Tools",
    logo: "/sponsors/pferd-tools.webp",
    website: "https://www.pferd.com/",
    size: 'small'
  },
  "turbo-federal": {
    id: "turbo-federal",
    name: "Turbo Federal",
    logo: "/sponsors/turbo-federal.webp",
    website: "https://www.turbofederal.com/",
    size: 'small'
  },
  "bae-systems": {
    id: "bae-systems",
    name: "BAE Systems",
    logo: "/sponsors/bae-systems.webp",
    website: "https://www.baesystems.com/",
    size: 'small',
    description: "BAE Systems and its partners develop, engineer, manufacture and support products and systems to deliver military capability, protect national security and keep critical information and infrastructure secure. Our products and services include radar, satellite & marine services, sensors, electronic warfare and systems engineering to the Department of Defense, NASA and civilian agencies supporting security initiatives.",
  },
  "marmc": {
    id: "marmc",
    name: "Mid-Atlantic Regional Maintenance Center (MARMC)",
    logo: "/sponsors/marmc.webp",
    website: "https://www.navsea.navy.mil/Home/RMC/MARMC/",
    size: 'small',
    description: "The Department of the Navy (DON) Office of Small Business Programs (OSBP) is dedicated to maximizing opportunities for small businesses in its acquisitions. The OSBP focuses on fostering acquisition opportunities where small businesses can best support the needs of Sailors and Marines, ensuring they receive the necessary resources and products at affordable prices. OSPB also works to create a culture of small business inclusivity within the Department of the Navy. MARMC is a directorate under Naval Sea Systems Command. MARMC is the leader of the ship repair industry in all aspects of ship maintenance."
  },
  "navair": {
    id: "navair",
    name: "Naval Air Systems Command (NAVAIR)",
    logo: "/sponsors/navair.webp",
    website: "https://www.navair.navy.mil/",
    size: 'small',
    description: "Naval Air Systems Command (NAVAIR) Office of Small Business (OSBP) focuses on providing the Warfighter with creative solutions, brought to them through small businesses, that are fully aligned with NAVAIR’s Strategic Imperatives. NAVAIR OSBP strives to be the premier Department of Defense Small Business Office advocating for the Best Solutions for the Warfighter, while promoting NAVAIR’s Strategic imperatives, through maximizing opportunities for small business participation. NAVAIR delivers integrated air warfare capabilities to enable the fleet to compete, deter and win – tonight, tomorrow and in the future. Providing the Nation's warfighters with air warfare capabilities to fight and win in every domain is NAVAIR’s unequivocal focus. Our dedication and commitment to deliver advanced, integrated capabilities has a single objective – equipping our warfighters for victory."
  },
  "general-dynamics-information-technology": {
    id: "general-dynamics-information-technology",
    name: "General Dynamics Information Technology",
    logo: "/sponsors/general-dynamics-information-technology.webp",
    website: "https://www.gdit.com/",
    size: 'small',
    description: "General Dynamics Information Technology (GDIT) is a global technology and professional services company that delivers technology solutions and mission services to every major agency across the U.S. government, defense and intelligence community. GDIT recognizes the importance of small businesses and is committed to ensuring it remains an integral part of our strategic sourcing, procurement, and teaming processes. Areas of interest and need of small businesses support include extensive logistics support, system integration, operational and task analysis, documentation and technical support of mission critical systems, strategic IT policy and technical services, portfolio management, Information Technology (IT) Governance and Enterprise Architecture (EA) solutions, help desk, medical IT, training, simulation, and environmental services support, zero trust, multi-cloud management, automation for IT operations, software factory, mission AI/ML, and 5G. Through our Small Business Program, GDIT continues to actively seek and establish mutually beneficial relationships with small businesses capable of providing products and services that meet our supply needs and service requirements."
  },
  "us-army-contracting-command": {
    id: "us-army-contracting-command",
    name: "US Army Contracting Command",
    logo: "/sponsors/us-army-contracting-command.webp",
    website: "https://www.army.mil/ACC",
    size: 'small',
    description: "The Army Contracting Command Office of Small Business Programs serves as a small business industrial base advocate seeking to maximize small business opportunities that support Army materiel readiness, by aiding in the growth of current and future sources of innovative and sustaining solutions for globally dominant Warfighter capabilities. We actively seek collaboration and partnership with industry in order to operationalize contracting in support of the HCA and Secretary of the Army priorities while capitalizing on small business opportunities.",
  },
  "newport-news-shipbuilding": {
    id: "newport-news-shipbuilding",
    name: "Newport News Shipbuilding",
    logo: "/sponsors/newport-news-shipbuilding.webp",
    website: "https://hii.com/what-we-do/divisions/newport-news-shipbuilding/",
    size: 'small',
  },
  "amazon-business": {
    id: "amazon-business",
    name: "Amazon Business",
    logo: "/sponsors/amazon-business.webp",
    website: "https://business.amazon.com/",
    size: 'small'
  },
  "isi-defense": {
    id: "isi-defense",
    name: "ISI Defense",
    logo: "/sponsors/isi-defense.webp",
    website: "https://www.isidefense.com/",
    size: 'small'
  }
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
