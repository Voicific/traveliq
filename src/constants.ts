import { Supplier, SupplierType } from './types.ts';

export const VEE_ELEVENLABS_AGENT_ID = 'agent_9701k60px56gezba55q83jamzhbk';
export const VEE_ELEVENLABS_VOICE_ID = 'Hh0rE70WfnSFN80K8uJC';

// NOTE: All suppliers below are FICTIONAL demo brands created to showcase the
// TravelIQ AI Sales Assistant. They do not represent real companies. Logos use
// branded demo logos served from /public/imgs (added 5 Jun 2026). "Skyline
// Airways" is the flagship demo profile and
// carries a full agent-facing knowledge base.
export const SEED_SUPPLIERS: Supplier[] = [
  {
    id: 'skyline-airways',
    name: 'Skyline Airways',
    type: SupplierType.Airline,
    logoUrl: '/imgs/skyline_airways_logo.png',
    bannerUrl: 'https://images.unsplash.com/photo-1570299434827-c30b0a8c64b3?q=80&w=2070&auto=format&fit=crop',
    shortDescription: 'A fictional flagship carrier connecting the UK and Europe to long-haul destinations with award-style service and a generous trade programme.',
    longDescription: 'Skyline Airways is a demonstration airline created to showcase how TravelIQ\'s AI Sales Assistant supports travel agents. Operating from its primary hub at London Gateway (LGW-demo) with a secondary European base in Amsterdam, Skyline serves a fictional network of long-haul and short-haul destinations. It offers four cabins — First, Skyline Business, Premium and Economy — and a loyalty programme called SkyMiles Club. Ask the AI about routes, cabin features, baggage, fare rules, group bookings and trade commission.',
    avatarImageUrl: 'https://picsum.photos/seed/skyline_avatar/512/512',
    websiteUrl: '#',
    knowledgeBaseUrl: '',
    knowledgeBaseText: `SKYLINE AIRWAYS — TRAVEL TRADE KNOWLEDGE BASE (fictional demo content)

ABOUT
Skyline Airways is a fictional full-service carrier used to demonstrate the TravelIQ AI Sales Assistant. Primary hub: London Gateway (code SKG, demo). Secondary European hub: Amsterdam (code AMS-demo). Fleet: modern wide-body and narrow-body aircraft. All figures below are illustrative and for demonstration only.

ROUTE NETWORK
- Long-haul from London: New York, Toronto, Dubai, Singapore, Bangkok, Cape Town, Los Angeles.
- Short/medium-haul from London & Amsterdam: Barcelona, Rome, Lisbon, Athens, Vienna, Dublin, Geneva.
- Seasonal leisure routes (Apr–Oct): Faro, Palma, Heraklion, Dubrovnik.
- Codeshare partners (fictional): Northwind Air (domestic US connections) and Coralline feeder routes.

CABIN CLASSES
1. First — private suites, lie-flat 200cm bed, direct aisle access, dine-on-demand. Available on long-haul wide-body only.
2. Skyline Business — lie-flat seat, 1-2-1 layout, lounge access, fast-track security.
3. Premium — wider seat, 38" pitch, enhanced meal service, priority boarding.
4. Economy — 31" pitch, complimentary meal and bag on long-haul; hand baggage only on the lowest "Light" short-haul fare.

BAGGAGE (illustrative)
- First: 3 x 32kg checked, 2 x cabin. Business: 2 x 32kg, 2 x cabin. Premium: 2 x 23kg, 1 x cabin + personal item. Economy Classic: 1 x 23kg. Economy Light: cabin bag only (checked bag purchasable).
- Excess/extra bags can be pre-purchased up to 4 hours before departure at a discount versus airport rates.

FARE FAMILIES & RULES
- Light: hand baggage only, no changes, no seat selection.
- Classic: 1 checked bag, changes permitted for a fee + fare difference, standard seat selection.
- Flex: 2 checked bags, free changes, free seat selection, refundable less an admin fee.
- Infants (under 2) travel at 10% of the adult fare without a seat; children 2–11 receive a 25% discount in Economy and Premium.

SKYMILES CLUB (loyalty)
- Tiers: Blue, Silver, Gold, Platinum. Members earn miles by distance and fare family.
- Silver and above: extra checked bag, priority check-in, lounge access on Business fares.
- Miles can be redeemed for reward flights, upgrades and partner hotel stays.

TRAVEL TRADE / AGENT INFORMATION
- Standard trade commission: 7% on published Flex and Classic fares; 3% on Light fares (illustrative).
- Group bookings (10+ passengers): dedicated desk, held seats for 14 days without deposit, complimentary tour-conductor seat for every 20 paying passengers.
- Agents book via the Skyline Trade Portal (demo) or through major GDS using the fictional code "SK".
- Name changes permitted up to 48 hours before departure on Classic/Flex for an admin fee.
- Ancillary commission paid on pre-purchased seats, bags and lounge passes.

COMMON AGENT QUESTIONS
- "Can my client change a Light fare?" No — Light fares are non-changeable and non-refundable; recommend Classic if flexibility is needed.
- "What's the baggage for a Premium passenger to New York?" 2 x 23kg checked plus a cabin bag and personal item.
- "Is there a child discount?" Yes — 25% off Economy/Premium for ages 2–11; infants under 2 at 10% without a seat.
- "How do groups hold seats?" 10+ passengers can hold seats for 14 days with no deposit via the group desk.

CONTACT (demo)
- Trade support: trade@skyline-demo.example (illustrative, not monitored).
- Group desk: groups@skyline-demo.example (illustrative).
All details above are fictional and provided to demonstrate AI-assisted agent support within TravelIQ.`,
    geminiVoiceName: 'Charon',
  },
  {
    id: 'northwind-air',
    name: 'Northwind Air',
    type: SupplierType.Airline,
    logoUrl: '/imgs/northwind_air_logo.png',
    bannerUrl: 'https://images.unsplash.com/photo-1554992309-5a10f3747416?q=80&w=1974&auto=format&fit=crop',
    shortDescription: 'A fictional regional and short-haul airline offering friendly service and value fares across the UK and Europe.',
    longDescription: 'Northwind Air is a demonstration short-haul carrier built to show how TravelIQ helps agents get fast answers. It operates a fictional point-to-point network across UK regional cities and European leisure destinations, with simple fare families and a focus on value. Ask the AI about routes, baggage, seat selection and trade booking.',
    avatarImageUrl: 'https://picsum.photos/seed/northwind_avatar/512/512',
    websiteUrl: '#',
    knowledgeBaseUrl: '',
    knowledgeBaseText: '',
    geminiVoiceName: 'Puck',
  },
  {
    id: 'azure-cruises',
    name: 'Azure Cruises',
    type: SupplierType.CruiseLine,
    logoUrl: '/imgs/azure_cruises_logo.png',
    bannerUrl: 'https://images.unsplash.com/photo-1563404227-993c8cf14227?q=80&w=2070&auto=format&fit=crop',
    shortDescription: 'A fictional premium cruise line sailing Mediterranean and Caribbean itineraries with modern ships and inclusive fares.',
    longDescription: 'Azure Cruises is a demonstration cruise brand created for TravelIQ. Its fictional fleet sails Mediterranean, Caribbean and Northern Europe itineraries, with cabin grades from interior staterooms to suites. Ask the AI about itineraries, cabin types, dining, inclusions and agent commission.',
    avatarImageUrl: 'https://picsum.photos/seed/azure_avatar/512/512',
    websiteUrl: '#',
    knowledgeBaseUrl: '',
    knowledgeBaseText: '',
    geminiVoiceName: 'Kore',
  },
  {
    id: 'coralline-cruise-line',
    name: 'Coralline Cruise Line',
    type: SupplierType.CruiseLine,
    logoUrl: '/imgs/coralline_cruise_line_logo.png',
    bannerUrl: 'https://images.unsplash.com/photo-1599640842225-85d111c60e6b?q=80&w=2070&auto=format&fit=crop',
    shortDescription: 'A fictional boutique, small-ship cruise line focused on immersive coastal and expedition voyages.',
    longDescription: 'Coralline Cruise Line is a demonstration small-ship brand for TravelIQ, specialising in fictional expedition and coastal sailings with an emphasis on destination immersion and relaxed onboard atmosphere. Ask the AI about expedition itineraries, suite categories, what\'s included and group rates.',
    avatarImageUrl: 'https://picsum.photos/seed/coralline_avatar/512/512',
    websiteUrl: '#',
    knowledgeBaseUrl: '',
    knowledgeBaseText: '',
    geminiVoiceName: 'Aoide',
  },
  {
    id: 'meridian-collection',
    name: 'The Meridian Collection',
    type: SupplierType.HotelResort,
    logoUrl: '/imgs/meridian_collection_logo.png',
    bannerUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop',
    shortDescription: 'A fictional luxury hotel collection offering design-led city and resort properties across the UK and Europe.',
    longDescription: 'The Meridian Collection is a demonstration luxury hotel group built for TravelIQ. Its fictional portfolio spans flagship city hotels and coastal resorts, with a preferred-partner programme for agents. Ask the AI about properties, room categories, amenities, rates and group bookings.',
    avatarImageUrl: 'https://picsum.photos/seed/meridian_avatar/512/512',
    websiteUrl: '#',
    knowledgeBaseUrl: '',
    knowledgeBaseText: '',
    geminiVoiceName: 'Icarus',
  },
  {
    id: 'hartwell-hotels',
    name: 'Hartwell Hotels',
    type: SupplierType.HotelResort,
    logoUrl: '/imgs/hartwell_hotels_logo.png',
    bannerUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=2071&auto=format&fit=crop',
    shortDescription: 'A fictional mid-market hotel chain blending comfort, value and central locations across UK and European cities.',
    longDescription: 'Hartwell Hotels is a demonstration hotel chain for TravelIQ, offering fictional city-centre and airport properties aimed at both business and leisure travellers. Ask the AI about locations, room types, amenities, corporate rates and group booking policies.',
    avatarImageUrl: 'https://picsum.photos/seed/hartwell_avatar/512/512',
    websiteUrl: '#',
    knowledgeBaseUrl: '',
    knowledgeBaseText: '',
    geminiVoiceName: 'Chara',
  },
];
