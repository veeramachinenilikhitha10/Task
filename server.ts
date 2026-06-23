import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  galleryImages: string[];
}

interface PricingRule {
  zipCode: string;
  surcharge: number;
  shippingEstimate: string;
  notes?: string;
}

// Initial Mock Datastore in-memory with real aesthetic premium products (50 high-fidelity items)
const PRODUCTS: Product[] = [
  {
    id: "prod_heirloom_table",
    name: "Onyx Heirloom Solid Oak Dining Table",
    description: "Handcrafted from slow-growth sustainable European White Oak. Every tabletop undergoes natural oil seasoning over 40 days, highlighting gorgeous custom grain variations. Built with hand-joined Mortise-and-Tenon legs designed to endure generations of dining.",
    basePrice: 1299,
    imageUrl: "https://images.unsplash.com/photo-1530019142907-295333ef4aeb?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1530019142907-295333ef4aeb?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_woven_chair",
    name: "Nordic Silhouette Woven Ashwood Chair",
    description: "Sculpted elegantly from a single continuous steam-bent ashwood frame. Woven with dual-ply Danish paper cord. This dining chair details a minimal, organic profile that provides supreme tactile comfort and lifetime structural integrity.",
    basePrice: 699,
    imageUrl: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_sylvan_desk",
    name: "Sylvan Walnut Writing Desk",
    description: "Made for custom workspaces, this premium desk is crafted from solid North American Walnut with premium solid brass joinery accents. Features three soft-closing flush drawers lined with premium leather felt.",
    basePrice: 1450,
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_burlwood_coffee",
    name: "Burlwood Block Coffee Table",
    description: "An architectural center statement block sliced cleanly from aged redwood burl. Features natural complex swirled rings and custom geometric brass feet detailing.",
    basePrice: 899,
    imageUrl: "https://images.unsplash.com/photo-1581428982868-e410dd047a90?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1581428982868-e410dd047a90?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_platform_bed",
    name: "Kyoto Minimalist Platform Wood Bed",
    description: "An incredibly elegant low-profile bedstead, crafted using pure traditional Japanese carpentry without screws or metal plates. Built with kiln-dried Hinoki Cypress wood.",
    basePrice: 1950,
    imageUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_driftwood_side",
    name: "Driftwood Organic Accent Table",
    description: "Sustainably harvested from weathered Pacific shores. This organic round accent table introduces an earthy, coast-weathered charm into minimalist corridors.",
    basePrice: 349,
    imageUrl: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_highland_bench",
    name: "Highland Rustic Oak Entry Bench",
    description: "Exquisite heavy entry bench crafted from reclaimed alpine timbers. Heavy square structure with classic raw weathered wood grains and protective clear-coat varnish.",
    basePrice: 420,
    imageUrl: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_tectonic_console",
    name: "Tectonic Cedar Console Table",
    description: "Slim-line floating look console, handcrafted from seasoned red cedar. Ideal for architectural entryways, displaying artwork, or keeping desktop accessories.",
    basePrice: 650,
    imageUrl: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1582298723682-7115561c51b7?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_eclipse_chair",
    name: "Eclipse Rounded Ash Dining Chair",
    description: "Ergonomic masterpiece with an oval sculptured back seat. Engineered in premium charcoal-stained Ashwood to blend modern luxury with exceptional lumbar support.",
    basePrice: 450,
    imageUrl: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_radial_stool",
    name: "Radial Cedar Counter Stool",
    description: "Features a modern circular seating surface, hand-lathed from a solid single piece of aromatic red cedar wood. Tapered minimalist legs with robust reinforcing steel cross-braces.",
    basePrice: 280,
    imageUrl: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_solitude_shelf",
    name: "Solitude Elm Wall Floating Shelf",
    description: "Ultra-heavy look live edge shelf showcasing stunning radial timber grain patterns. Concealed heavy steel anchors give it an incredibly clean floating look.",
    basePrice: 189,
    imageUrl: "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_cathedral_hutch",
    name: "Cathedral Maple Dining Sideboard",
    description: "Mid-century style sideboard crafted from hard rock maple. Incorporates sliding tambour doors, internal adjustable drawers, and pristine brass hardware details.",
    basePrice: 1599,
    imageUrl: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1582298723682-7115561c51b7?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_sequoia_coffee",
    name: "Sequoia Live-Edge Timber Coffee Table",
    description: "An incredibly rustic center table crafted from a gigantic solid cross-section of redwood timber. Features heavy-duty matte iron legs to keep it incredibly rigid.",
    basePrice: 1100,
    imageUrl: "https://images.unsplash.com/photo-1581428982868-e410dd047a90?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1581428982868-e410dd047a90?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_walnut_tray",
    name: "Artisan Walnut Valet Tray",
    description: "A gorgeous single hollow block of North American Walnut, polished meticulously by hand to hold keys, rings, writing utensils, or daily EDC items on counter boards.",
    basePrice: 95,
    imageUrl: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_obsidian_pedestal",
    name: "Obsidian Charred Oak Pedestal",
    description: "Constructed using ancient Japanese Shou Sugi Ban wood preservation techniques. A dramatic, velvet black display stand for showcase sculptures or plants.",
    basePrice: 380,
    imageUrl: "https://images.unsplash.com/photo-1596162954151-cd5400906471?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1596162954151-cd5400906471?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_spruce_armoire",
    name: "Alpine Spruce Contemporary Armoire",
    description: "A substantial wooden wardrobe built from premium mountain-pine spruce. Integrates dual soft-closing clothing segments and leather utility pulls.",
    basePrice: 1750,
    imageUrl: "https://images.unsplash.com/photo-1560185127-6a2806647f81?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1560185127-6a2806647f81?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_horizon_credenza",
    name: "Horizon Cherrywood Credenza",
    description: "Elegant media console crafted from wild American cherry. Features adjustable interior shelving, integrated wire routing vents, and soft-closing cabinet doors.",
    basePrice: 1399,
    imageUrl: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_teak_bench",
    name: "Zen Teak Bathroom Stool",
    description: "Waterproof, highly moisture-resistant, premium hand-joined Indonesian teak bench. Designed for spa areas or master bathroom wet setups.",
    basePrice: 220,
    imageUrl: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_canopy_drawers",
    name: "Canopy Mahogany Chest of Drawers",
    description: "Solid West African Mahogany storage chest features 5 tiered deep drawers. Employs classic interlocking dovetail joinery for supreme stability under heavy loads.",
    basePrice: 1100,
    imageUrl: "https://images.unsplash.com/photo-1560185127-6a2806647f81?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1560185127-6a2806647f81?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_hickory_rocker",
    name: "Heritage Hickory Rocking Chair",
    description: "An incredibly comfortable classic rocker. Utilizes steam-bent hickory curves designed to deliver smooth, calming motion across decades of study room use.",
    basePrice: 580,
    imageUrl: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_ember_sideboard",
    name: "Ember Charcoal Ash Sideboard",
    description: "Dramatic blackened ash buffet sideboard. Details hand-machined fluted doors and high-profile steel legs. Adds heavy architectural elegance to modern dining suites.",
    basePrice: 1250,
    imageUrl: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_cascade_bookcase",
    name: "Cascade Solid Birch Bookcase",
    description: "Sturdy geometric block patterns compose this contemporary tiered bookcase. Constructed cleanly from sustainable European birch wood.",
    basePrice: 720,
    imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_linden_mirror",
    name: "Gilded Lindenwood Frame Mirror",
    description: "Heavy master floor mirror featuring an organic, robust lindenwood raw-edge border that complements natural-stone floor tiles elegantly.",
    basePrice: 390,
    imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_nomad_chair",
    name: "Nomad Walnut Folding Stool",
    description: "Perfect portable utility stool featuring solid brass hardware and water-repellent canvas straps. Slips flat into custom travel envelopes.",
    basePrice: 180,
    imageUrl: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_whisper_nightstand",
    name: "Whisper Alderwood Bedside Stand",
    description: "Minimalist nightstand crafted in dense red Alder. Features single handleless push-to-open drawer and soft-grain round corner panels.",
    basePrice: 295,
    imageUrl: "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_sentinel_chest",
    name: "Sentinel Pine Trunk Chest",
    description: "Rustic storage trunk featuring handcrafted raw dovetails, thick black-iron strap hinges, and rich pine timber fragrance.",
    basePrice: 480,
    imageUrl: "https://images.unsplash.com/photo-1560185127-6a2806647f81?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1560185127-6a2806647f81?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_monolith_divider",
    name: "Monolith Cypress Room Divider",
    description: "Striking three-panel acoustic baffle screen crafted from aromatic Japanese Shinto Cypress slats. Blocks noise naturally while maintaining ambient light streams.",
    basePrice: 650,
    imageUrl: "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_zebrano_organizer",
    name: "Strata Zebrano Wood Desk Organizer",
    description: "Exotic African Zebrano wood featuring high-contrast dark banding. Formed carefully to house mechanical pens, business cards, and smart devices.",
    basePrice: 85,
    imageUrl: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_fir_coatrack",
    name: "Ridge Douglas Fir Coat Rack",
    description: "Stately architectural floor-standing stand crafted with robust branch hooks from deep-forest Douglas Fir timbers.",
    basePrice: 195,
    imageUrl: "https://images.unsplash.com/photo-1596162954151-cd5400906471?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1596162954151-cd5400906471?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_halo_lamp",
    name: "Halo Sassafras Table Lamp",
    description: "Warm atmospheric bedside lamp with standard translucent sassafras wood veneer shade that projects rich golden grain rings when illuminated.",
    basePrice: 240,
    imageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_olive_bowl",
    name: "Pebble Olivewood Nesting Bowls",
    description: "Three-piece nesting kitchen set, lathed flawlessly using thick sustainable oil-saturated Mediterranean Olivewood cores.",
    basePrice: 125,
    imageUrl: "https://images.unsplash.com/photo-1554009975-d74653b849f1?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1554009975-d74653b849f1?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_wave_susan",
    name: "Wave Beechwood Lazy Susan",
    description: "An elegant centerpiece for dining tables. Features integrated silent industrial steel bearing rollers beneath a gorgeous natural oiled Beech plywood disc.",
    basePrice: 110,
    imageUrl: "https://images.unsplash.com/photo-1532372320978-9b4d8a5a8a4c?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1532372320978-9b4d8a5a8a4c?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_origin_yew",
    name: "Origin Yew Wood Fruit Platter",
    description: "Irregular natural lip highlights this gorgeous yew carving, showcasing high-contrast golden core wood and ivory outer bark tones.",
    basePrice: 145,
    imageUrl: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_prism_pearwood",
    name: "Prism Pearwood Velvet Jewelry Box",
    description: "A secret keepsake drawer lined internally with premium micro-suede. Expertly constructed from native Austrian pearwood.",
    basePrice: 165,
    imageUrl: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_nomad_cane",
    name: "Nomad Chestnut Walking Cane",
    description: "Traditional dapper walking cane lathed from lightweight chestnut sapling roots. Features gorgeous natural burls and rubber safety tip.",
    basePrice: 135,
    imageUrl: "https://images.unsplash.com/photo-1596162954151-cd5400906471?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1596162954151-cd5400906471?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_tundra_larch",
    name: "Tundra Larchwood End-Grain Chopping Block",
    description: "Professional grade heavy butcher block. Resists deep kitchen blade scores naturally due to tightly aligned wood structures.",
    basePrice: 199,
    imageUrl: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_hearth_box",
    name: "Hearthside Brass & Birchwood Matches Holder",
    description: "An incredibly secure fireplace decor box made from sustainably harvested premium birch bark sheets and brass plating.",
    basePrice: 75,
    imageUrl: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_peak_sculpture",
    name: "Peak Sycamore Mountain Sculpture",
    description: "Minimal modern mantle shelf piece, machined carefully to resemble architectural alpine ridges from clean white Sycamore timbers.",
    basePrice: 120,
    imageUrl: "https://images.unsplash.com/photo-1596162954151-cd5400906471?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1596162954151-cd5400906471?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_helix_candles",
    name: "Helix Beech Spiral Candleholder Pair",
    description: "Contoured spiral wooden candlesticks machined using advanced 5-axis routers. Sanded to a silky organic oil finish.",
    basePrice: 65,
    imageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_dune_incense",
    name: "Dune Sandalwood Japanese Incense Burner",
    description: "A gorgeous single piece of carved sandalwood block styled to direct rising currents of aromatic sandalwood incense calmly.",
    basePrice: 80,
    imageUrl: "https://images.unsplash.com/photo-1596162954151-cd5400906471?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1596162954151-cd5400906471?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_timber_tissue",
    name: "Timber Box Elder Tissue Cover Case",
    description: "A gorgeous cover detailed in box elder wood. Sanded smooth to fit standard cardboard tissues cleanly and mask plastic packaging.",
    basePrice: 70,
    imageUrl: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_solace_tissue",
    name: "Solace Aspenwood Towel Cradle",
    description: "A functional countertop cradle. Carved out of a monolithic pale Aspen block to maintain absolute peace on primary master baths.",
    basePrice: 90,
    imageUrl: "https://images.unsplash.com/photo-1554009975-d74653b849f1?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1554009975-d74653b849f1?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_saltpepper_mill",
    name: "Ridge Redwood Salt & Pepper Grinders",
    description: "High-integrity ceramic cores wrapped in rich grained coastal redwood boards. Includes precision adjust heads to control grain sizing perfectly.",
    basePrice: 110,
    imageUrl: "https://images.unsplash.com/photo-1532372320978-9b4d8a5a8a4c?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1532372320978-9b4d8a5a8a4c?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_canopy_cart",
    name: "Canopy Figured Maple Rolling Cart",
    description: "Three tier wooden beverage cart featuring silent running rubber wheels and brass perimeter rails. Excellent for premium hosting.",
    basePrice: 450,
    imageUrl: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_basin_stand",
    name: "Basin Red Oak Umbrella Container",
    description: "Compact floor stand lined with moisture-wicking synthetic fibers and enclosed within beautiful tight red oak timber frames.",
    basePrice: 160,
    imageUrl: "https://images.unsplash.com/photo-1596162954151-cd5400906471?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1596162954151-cd5400906471?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_cradle_rocker",
    name: "Cradle Black Walnut Keepsake Crib",
    description: "An incredibly heirloom-worthy piece with smooth, natural rocking balance. Constructed flawlessly with bespoke interlocking wood rails.",
    basePrice: 950,
    imageUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_compass_clock",
    name: "Compass Bamboo Desk Clock",
    description: "Minimal desk dial styled elegantly without numbers. Enclosed in dual carbon-carburized steam-pressed premium bamboo frames.",
    basePrice: 95,
    imageUrl: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_meridian_clock",
    name: "Meridian Olive Wood Wall Clock",
    description: "A gorgeous cross slab sliced from ancient Mediterranean trunks. Showcases complex organic burl edges and precision Swiss Quartz mechanisms.",
    basePrice: 210,
    imageUrl: "https://images.unsplash.com/photo-1554009975-d74653b849f1?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1554009975-d74653b849f1?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_horizon_ladder",
    name: "Horizon Paulownia Floating Quilt Ladder",
    description: "Ultra-lightweight yet sturdy wall ladder crafted from soft Paulownia wood, sanded smooth to prevent fabric snagging in master suite dressings.",
    basePrice: 175,
    imageUrl: "https://images.unsplash.com/photo-1596162954151-cd5400906471?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1596162954151-cd5400906471?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "prod_summit_pedestal",
    name: "Summit Redwood Modern Plant Pedestal",
    description: "Tiered architectural display pedestal block. Crafted from red-toned West Coast timbers to give house plants a gorgeous structural accent.",
    basePrice: 220,
    imageUrl: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=1000",
    galleryImages: [
      "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=1000"
    ]
  }
];

// Seed initial required ZIP code prices as requested:
// ZIP 75028: Total Price $1,499 (Base $1,299 + $200 surcharge)
// ZIP 10001: Total Price $1,699 (Base $1,299 + $400 surcharge)
// ZIP 90210: Total Price $1,799 (Base $1,299 + $500 surcharge)
let pricingRules: PricingRule[] = [
  {
    zipCode: "75028",
    surcharge: 200,
    shippingEstimate: "3-5 business days (Standard Ground)",
    notes: "Flower Mound, Texas warehouse routing.",
  },
  {
    zipCode: "10001",
    surcharge: 400,
    shippingEstimate: "1-2 business days (Priority Urban Express)",
    notes: "New York Metropolitan Hub high-density zone fee.",
  },
  {
    zipCode: "90210",
    surcharge: 500,
    shippingEstimate: "2-4 business days (White Glove Delivery)",
    notes: "Beverly Hills West Coast premium freight service.",
  },
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Get available products
  app.get("/api/products", (req, res) => {
    res.json(PRODUCTS);
  });

  // API Route: Get all pricing rules
  app.get("/api/rules", (req, res) => {
    res.json(pricingRules);
  });

  // API Route: Create or update a pricing rule
  app.post("/api/rules", (req, res) => {
    const { zipCode, surcharge, shippingEstimate, notes } = req.body;
    
    if (!zipCode || typeof surcharge !== "number" || surcharge < 0) {
      return res.status(400).json({ error: "Invalid data. Ensure zipCode is provided and surcharge is a positive number." });
    }

    const trimmedZip = String(zipCode).trim();
    const existingIndex = pricingRules.findIndex(r => r.zipCode === trimmedZip);

    const newRule: PricingRule = {
      zipCode: trimmedZip,
      surcharge,
      shippingEstimate: shippingEstimate || "3-7 business days",
      notes: notes || "Configured via merchant app admin panel.",
    };

    if (existingIndex > -1) {
      pricingRules[existingIndex] = newRule;
    } else {
      pricingRules.push(newRule);
    }

    res.json({ success: true, rule: newRule });
  });

  // API Route: Delete a pricing rule
  app.delete("/api/rules/:zip", (req, res) => {
    const targetZip = req.params.zip;
    const initialLength = pricingRules.length;
    pricingRules = pricingRules.filter(r => r.zipCode !== targetZip);
    
    if (pricingRules.length === initialLength) {
      return res.status(404).json({ error: "Pricing rule not found for ZIP: " + targetZip });
    }
    res.json({ success: true, message: "Rule deleted successfully." });
  });

  // API Route: Check dynamic price based on product and ZIP code
  app.get("/api/pricing", (req, res) => {
    const { productId, zipCode } = req.query;

    if (!productId || !zipCode) {
      return res.status(400).json({ error: "Missing required query parameters: productId and zipCode" });
    }

    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const zipStr = String(zipCode).trim();
    const rule = pricingRules.find(r => r.zipCode === zipStr);

    if (rule) {
      const calculatedPrice = product.basePrice + rule.surcharge;
      return res.json({
        productId: product.id,
        productName: product.name,
        zipCode: zipStr,
        ruleApplied: true,
        basePrice: product.basePrice,
        surcharge: rule.surcharge,
        calculatedPrice,
        shippingEstimate: rule.shippingEstimate,
        notes: rule.notes
      });
    } else {
      // Return base pricing with standard surcharge / free ground if no specific rule
      const defaultSurcharge = 99; // Standard flat-rate delivery for other zip codes
      const calculatedPrice = product.basePrice + defaultSurcharge;
      return res.json({
        productId: product.id,
        productName: product.name,
        zipCode: zipStr,
        ruleApplied: false,
        basePrice: product.basePrice,
        surcharge: defaultSurcharge,
        calculatedPrice,
        shippingEstimate: "5-10 business days (Standard Flat Rate)",
        notes: "No custom ZIP rule applied. Charging default oversize residential flat rate."
      });
    }
  });

  // Vite Integration for frontend preview / built bundle
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Shopify Pricing Demo App] Express microservice running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server", err);
});
