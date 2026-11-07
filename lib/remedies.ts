// Home remedies with ingredient "pictures" (emoji) — shown as flip cards on the Routine tab.
export type Remedy = {
  id: string; name: string; pics: string[]; concern: string; skin: string[];
  make: string; use: string; often: string; helps: string; avoid?: string;
};

export const REMEDIES: Remedy[] = [
  { id: "besan", name: "Besan–haldi–dahi pack", pics: ["🫘", "🟡", "🥛"], concern: "Dullness & tan", skin: ["all", "spots", "oily"], make: "2 tsp besan + 1 pinch haldi + 1–2 tsp plain dahi into a smooth paste.", use: "Apply a thin layer, leave 10–12 min. Wet your hands and rub very gently while washing off.", often: "Once a week (face-pack night)", helps: "Lifts dead skin and tan gently; dahi's lactic acid brightens.", avoid: "Too much haldi stains. Skip on retinol nights." },
  { id: "aloe", name: "Aloe–honey mask", pics: ["🌿", "🍯"], concern: "Dryness & redness", skin: ["all", "dry"], make: "1 tbsp fresh aloe gel (scraped from the leaf) + ½ tsp honey.", use: "15 min on clean skin, rinse with normal water, moisturize.", often: "1–2 times a week", helps: "Hydrates, calms irritation, gives a soft glow." },
  { id: "rose_dahi", name: "Rose water–dahi mask", pics: ["🌹", "🥛"], concern: "Rough texture", skin: ["all", "dry"], make: "1 tbsp thick dahi + 1 tsp rose water.", use: "10 min, rinse with cool water.", often: "Once a week", helps: "Very gentle exfoliation and softening; safe for sensitive skin." },
  { id: "potato", name: "Potato juice for under-eyes", pics: ["🥔", "👁️"], concern: "Dark circles", skin: ["eyes"], make: "Grate ½ raw potato, squeeze the juice through a cloth.", use: "Dip 2 cotton pads, keep on closed eyes 10 min, rinse.", often: "4–5 times a week", helps: "Mild natural brightening (catecholase) for under-eye darkness." },
  { id: "teabags", name: "Cold green-tea bags", pics: ["🍵", "❄️"], concern: "Puffy eyes", skin: ["eyes"], make: "Steep 2 green-tea bags, squeeze, chill in the fridge 15 min.", use: "Place on closed eyes 10 min in the morning.", often: "Whenever puffy", helps: "Caffeine and cold shrink puffiness; antioxidants calm skin." },
  { id: "cucumber", name: "Cucumber slices", pics: ["🥒"], concern: "Tired eyes", skin: ["eyes", "all"], make: "2 thick slices of chilled cucumber.", use: "10 min on closed eyes while lying down.", often: "Daily, anytime", helps: "Cooling and hydrating; reduces the tired look." },
  { id: "multani", name: "Multani mitti + rose water", pics: ["🟤", "🌹"], concern: "Oily T-zone & open pores", skin: ["oily"], make: "1 tbsp multani mitti + rose water to a smooth paste.", use: "Only on forehead, nose and chin. Wash off before it fully dries (8–10 min).", often: "Once a week", helps: "Absorbs excess oil and tightens the look of pores.", avoid: "Not for dry skin or the cheeks of 40+ skin." },
  { id: "oats", name: "Oats–honey soft scrub", pics: ["🌾", "🍯"], concern: "Flaky skin", skin: ["dry", "all"], make: "1 tbsp powdered oats + 1 tsp honey + few drops milk.", use: "Massage in light circles 30 sec, leave 5 min, rinse.", often: "Once a week (not with retinol)", helps: "Removes flakes without scratching; oats soothe." },
  { id: "rice_water", name: "Rice water toner", pics: ["🍚", "💧"], concern: "Uneven tone", skin: ["all", "spots"], make: "Rinse ½ cup rice, then soak in 1 cup water 30 min. Strain, keep in fridge up to 3 days.", use: "Pat on with cotton after washing, let dry, then serum.", often: "Daily, morning or night", helps: "Gentle brightening and a smoother feel." },
  { id: "coconut", name: "Coconut oil for lips & cuticles", pics: ["🥥", "👄"], concern: "Dark, dry lips", skin: ["all", "dry"], make: "A drop of virgin coconut oil.", use: "Massage into lips and nails at bedtime.", often: "Every night", helps: "Softens dry lips and dark patches from dryness." },
];

export const NEVER = ["Lemon juice directly on face", "Baking soda", "Toothpaste on spots", "Raw garlic", "Hot water on face"];
