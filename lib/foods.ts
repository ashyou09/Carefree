// Food & drink catalog + the slot planner. Each item has ONE best time slot; picking it puts it there.
import type { Diet, Profile, Tag } from "./profile";
import { dayNumber, type Step } from "./plan";

export type SlotId = "early" | "breakfast" | "mid" | "lunch" | "evening" | "dinner" | "bed";
export const SLOTS: { id: SlotId; label: string; time: string; optional?: boolean }[] = [
  { id: "early", label: "Early morning", time: "6–7 am · empty stomach" },
  { id: "breakfast", label: "Breakfast", time: "8–9 am" },
  { id: "mid", label: "Mid-morning", time: "11 am", optional: true },
  { id: "lunch", label: "Lunch", time: "1–2 pm" },
  { id: "evening", label: "Evening snack", time: "4–5 pm", optional: true },
  { id: "dinner", label: "Dinner", time: "7–8 pm" },
  { id: "bed", label: "Bedtime", time: "9:30 pm", optional: true },
];

export type Food = {
  id: string; name: string; emoji: string; slot: SlotId; kind: "food" | "drink"; diet: Diet;
  tags: Tag[]; helps: string; how: string; caution?: string;
};

export const FOODS: Food[] = [
  // early morning
  { id: "soaked_nuts", name: "Soaked almonds & walnuts", emoji: "🌰", slot: "early", kind: "food", diet: "veg", tags: ["vitE", "omega3", "protein"], helps: "Vitamin E and omega-3 keep skin soft and the barrier strong; walnuts calm inflammation.", how: "Soak 5 almonds + 2 walnut halves + 6 raisins overnight. Peel almonds, eat with warm water." },
  { id: "jeera_water", name: "Jeera water", emoji: "🫖", slot: "early", kind: "drink", diet: "veg", tags: ["gut"], helps: "Settles digestion and bloating. A calm gut shows as calmer, less puffy skin.", how: "Boil 1 tsp jeera in 1 glass water 5 min, sip warm 20 min before breakfast." },
  { id: "chia_water", name: "Chia seed water", emoji: "🥛", slot: "early", kind: "drink", diet: "veg", tags: ["omega3", "gut", "hydration"], helps: "Plant omega-3 and fibre; keeps skin hydrated from inside and helps regular digestion.", how: "Soak 1 tsp chia in a glass of water for 20 min (or overnight). Add a squeeze of lemon. Drink slowly." },
  { id: "amla_shot", name: "Amla juice", emoji: "🟢", slot: "early", kind: "drink", diet: "veg", tags: ["vitc", "collagen", "antioxidant"], helps: "Richest Indian source of vitamin C: builds collagen and fades dull spots.", how: "20 ml amla juice in 1 glass water. Or 1 fresh amla with a pinch of salt.", caution: "Skip if it causes acidity." },
  { id: "methi_water", name: "Methi water", emoji: "🌱", slot: "early", kind: "drink", diet: "veg", tags: ["gut", "lowsugar"], helps: "Steadies blood sugar, which reduces breakouts and sugar-related dullness.", how: "Soak 1 tsp methi seeds overnight, drink the water, chew the seeds." },
  // breakfast
  { id: "chilla", name: "Besan / moong chilla with paneer", emoji: "🥞", slot: "breakfast", kind: "food", diet: "veg", tags: ["protein", "iron"], helps: "Protein is the raw material for collagen; paneer adds calcium.", how: "2 chillas with grated paneer, onion, tomato, coriander. Cook in 1 tsp oil." },
  { id: "oats_chia", name: "Oats bowl with chia & fruit", emoji: "🥣", slot: "breakfast", kind: "food", diet: "veg", tags: ["gut", "omega3", "antioxidant"], helps: "Soluble fibre feeds good gut bacteria; berries/papaya add antioxidants.", how: "½ cup oats cooked in milk, top with 1 tsp chia, ½ cup papaya or apple, few nuts. No sugar." },
  { id: "sprouts_poha", name: "Poha with peanuts & sprouts", emoji: "🍛", slot: "breakfast", kind: "food", diet: "veg", tags: ["iron", "protein", "energy"], helps: "Iron + protein for brighter, less tired-looking skin.", how: "1 plate poha with peanuts, ½ cup moong sprouts, lemon on top (vitamin C helps absorb iron)." },
  { id: "ragi_dosa", name: "Ragi dosa / idli + sambar", emoji: "🫓", slot: "breakfast", kind: "food", diet: "veg", tags: ["calcium", "gut", "iron"], helps: "Fermented batter is gut-friendly; ragi gives calcium and iron.", how: "2 ragi dosas or 3 idlis with a bowl of sambar. Coconut chutney in small amount." },
  { id: "boiled_eggs", name: "2 boiled eggs + toast", emoji: "🥚", slot: "breakfast", kind: "food", diet: "egg", tags: ["protein", "b12", "zinc"], helps: "Complete protein, biotin and B12 for skin repair, hair and nails.", how: "2 boiled eggs with 1 multigrain toast and cucumber–tomato slices." },
  { id: "egg_bhurji", name: "Egg bhurji with veggies", emoji: "🍳", slot: "breakfast", kind: "food", diet: "egg", tags: ["protein", "b12"], helps: "Protein + veggies in one plate; keeps you full till lunch.", how: "2 eggs scrambled with onion, tomato, capsicum, palak in 1 tsp oil. 1 roti." },
  // mid-morning
  { id: "fruit", name: "Seasonal fruit", emoji: "🍊", slot: "mid", kind: "food", diet: "veg", tags: ["vitc", "antioxidant", "hydration"], helps: "Vitamin C and antioxidants protect from sun damage and fade spots.", how: "1 bowl: orange, guava, papaya, pomegranate or apple. Whole fruit, not juice." },
  { id: "coconut_water", name: "Coconut water", emoji: "🥥", slot: "mid", kind: "drink", diet: "veg", tags: ["hydration"], helps: "Natural electrolytes keep skin plump; good for low BP and hot days.", how: "1 fresh coconut, mid-morning or after a walk." },
  { id: "cucumber_water", name: "Cucumber–coriander water", emoji: "🥒", slot: "mid", kind: "drink", diet: "veg", tags: ["hydration", "antioxidant"], helps: "Easy way to drink more water; coriander adds antioxidants.", how: "Slice ½ cucumber + a handful of coriander into 1 litre water. Sip from 10 am to 6 pm." },
  { id: "green_tea", name: "Green tea", emoji: "🍵", slot: "mid", kind: "drink", diet: "veg", tags: ["antioxidant"], helps: "Catechins protect skin from UV damage and calm redness.", how: "1 cup, steep 2–3 min, no sugar. Not on an empty stomach." },
  { id: "black_coffee", name: "Black coffee", emoji: "☕", slot: "mid", kind: "drink", diet: "veg", tags: ["antioxidant", "energy"], helps: "Fine in moderation; has antioxidants.", how: "Have after breakfast, not first thing in the morning. Max 1–2 cups a day, none after 3 pm.", caution: "Coffee dehydrates: drink an extra glass of water with it." },
  // lunch
  { id: "dal_roti", name: "Dal, roti, sabzi & dahi", emoji: "🍲", slot: "lunch", kind: "food", diet: "veg", tags: ["protein", "gut", "iron"], helps: "Balanced Indian thali: protein, fibre and probiotic dahi for gut and skin.", how: "1 bowl dal, 2 rotis (or 1 cup rice), 1 bowl green sabzi, 1 bowl dahi, salad." },
  { id: "rajma_rice", name: "Rajma / chole with rice & salad", emoji: "🍛", slot: "lunch", kind: "food", diet: "veg", tags: ["protein", "iron", "zinc"], helps: "Beans give zinc and iron that help heal spots and marks.", how: "1 bowl rajma or chole, ¾ cup rice, big salad with lemon." },
  { id: "palak_paneer", name: "Palak paneer + roti", emoji: "🥬", slot: "lunch", kind: "food", diet: "veg", tags: ["iron", "calcium", "protein"], helps: "Iron, calcium and vitamin A from spinach for even tone.", how: "1 bowl palak paneer, 2 rotis, salad. Squeeze lemon on the salad." },
  { id: "fish_curry", name: "Fish curry + rice", emoji: "🐟", slot: "lunch", kind: "food", diet: "nonveg", tags: ["omega3", "protein"], helps: "Omega-3 from fish reduces inflammation and keeps skin supple.", how: "1 piece rohu / pomfret / mackerel curry, ¾ cup rice, sabzi. 2–3 times a week." },
  { id: "chicken_curry", name: "Chicken curry + roti", emoji: "🍗", slot: "lunch", kind: "food", diet: "nonveg", tags: ["protein", "zinc", "b12"], helps: "Lean protein and zinc for repair and collagen.", how: "1 bowl home-style chicken curry, 2 rotis, salad. Less oil." },
  // evening
  { id: "makhana", name: "Roasted makhana", emoji: "🍿", slot: "evening", kind: "food", diet: "veg", tags: ["protein", "antioxidant"], helps: "Light, low-sugar snack with antioxidants; replaces biscuits and namkeen.", how: "1 cup makhana roasted in ½ tsp ghee with salt and pepper." },
  { id: "seeds_mix", name: "Pumpkin & sunflower seeds", emoji: "🌻", slot: "evening", kind: "food", diet: "veg", tags: ["zinc", "vitE", "omega3"], helps: "Zinc (pumpkin) and vitamin E (sunflower) for clearer, smoother skin.", how: "1 tbsp each, plain or lightly roasted. Can add to salad or dahi." },
  { id: "chaas", name: "Masala chaas", emoji: "🥛", slot: "evening", kind: "drink", diet: "veg", tags: ["gut", "hydration"], helps: "Probiotics for gut health; cooling and hydrating.", how: "½ cup dahi + 1 cup water, roasted jeera, pinch of salt, mint." },
  { id: "abc_juice", name: "Carrot–beetroot juice", emoji: "🥕", slot: "evening", kind: "drink", diet: "veg", tags: ["antioxidant", "iron"], helps: "Beta-carotene and iron for a healthy glow.", how: "1 small carrot + ½ beetroot + ½ apple, blend, don't strain too much. Drink fresh." },
  { id: "sprout_chaat", name: "Sprouts chaat", emoji: "🥗", slot: "evening", kind: "food", diet: "veg", tags: ["protein", "vitc", "iron"], helps: "Protein + vitamin C together help collagen building.", how: "1 cup moong sprouts, onion, tomato, cucumber, lemon, chaat masala." },
  // dinner
  { id: "khichdi", name: "Moong dal khichdi + dahi", emoji: "🍚", slot: "dinner", kind: "food", diet: "veg", tags: ["gut", "protein"], helps: "Easy to digest at night, so the body can focus on repair while you sleep.", how: "1 bowl khichdi with ghee, 1 bowl dahi or kadhi, salad." },
  { id: "millet_roti", name: "Millet roti + sabzi + dal", emoji: "🫓", slot: "dinner", kind: "food", diet: "veg", tags: ["calcium", "lowsugar", "gut"], helps: "Jowar/bajra/ragi keep blood sugar steady and add calcium.", how: "2 jowar or bajra rotis, 1 bowl sabzi, ½ bowl dal. Finish by 8 pm." },
  { id: "soup_paneer", name: "Veg soup + grilled paneer / tofu", emoji: "🥣", slot: "dinner", kind: "food", diet: "veg", tags: ["protein", "phyto", "hydration"], helps: "Light dinner with protein; tofu adds soy for hormone balance.", how: "1 big bowl mixed veg soup + 100 g grilled paneer or tofu." },
  { id: "egg_curry", name: "Egg curry + roti", emoji: "🍛", slot: "dinner", kind: "food", diet: "egg", tags: ["protein", "b12"], helps: "Protein for overnight skin repair.", how: "2 eggs in tomato–onion gravy, 2 rotis, salad." },
  { id: "grilled_fish", name: "Grilled fish + veggies", emoji: "🐠", slot: "dinner", kind: "food", diet: "nonveg", tags: ["omega3", "protein"], helps: "Omega-3 + protein; light enough for dinner.", how: "1 fillet grilled with lemon and spices, sautéed veggies." },
  // bedtime
  { id: "haldi_doodh", name: "Haldi doodh", emoji: "🥛", slot: "bed", kind: "drink", diet: "veg", tags: ["calcium", "antioxidant"], helps: "Turmeric calms inflammation; warm milk helps sleep, and sleep is when skin repairs.", how: "1 cup warm milk + ¼ tsp haldi + pinch of black pepper. No sugar." },
  { id: "chamomile", name: "Chamomile tea", emoji: "🌼", slot: "bed", kind: "drink", diet: "veg", tags: ["antioxidant"], helps: "Calming, caffeine-free; better sleep = fewer dark circles.", how: "1 cup, steep 5 min, 30 min before bed." },
  { id: "flax_dahi", name: "1 tbsp flaxseed", emoji: "🌾", slot: "bed", kind: "food", diet: "veg", tags: ["omega3", "phyto", "gut"], helps: "Omega-3 + lignans that support hormone balance and dry skin.", how: "1 tbsp roasted ground flax in dahi, roti dough or warm water. Can also go at breakfast." },
];

export const LIFESTYLE: Step[] = [
  { id: "h_water", title: "2.5 litres total fluids", detail: "Water, coconut water, chaas, soups all count." },
  { id: "h_walk", title: "Walk 20–30 min", detail: "Plus a 10-min slow walk after lunch and dinner." },
  { id: "h_sleep", title: "Slept 7+ hours", detail: "Tick in the morning for last night." },
];

export const allowed = (diet: Diet) => (f: Food) => diet === "nonveg" || f.diet === "veg" || (diet === "egg" && f.diet === "egg");

export function defaultPicks(p: Profile): string[] {
  const picks = ["soaked_nuts", "chilla", "fruit", "dal_roti", "makhana", "khichdi", "haldi_doodh"];
  if (p.diet !== "veg") picks.push("boiled_eggs");
  if (p.diet === "nonveg") picks.push("fish_curry");
  if (p.gender === "female" && (p.age === "40s" || p.age === "50+")) picks.push("flax_dahi");
  return picks;
}

export const byId = Object.fromEntries(FOODS.map((f) => [f.id, f])) as Record<string, Food>;

/** Picks grouped by slot (only ones allowed by diet). */
export function slotPicks(picks: string[], diet: Diet): Record<SlotId, Food[]> {
  const out = Object.fromEntries(SLOTS.map((s) => [s.id, [] as Food[]])) as Record<SlotId, Food[]>;
  picks.map((id) => byId[id]).filter(Boolean).filter(allowed(diet)).forEach((f) => out[f.slot].push(f));
  return out;
}

/** Today's food steps: one item per slot; several in a slot rotate day by day. */
export function foodSteps(picks: string[], diet: Diet, start: string, date: string): Step[] {
  const grouped = slotPicks(picks, diet);
  const n = Math.max(1, dayNumber(start, date));
  const steps: Step[] = [];
  for (const s of SLOTS) {
    const items = grouped[s.id];
    if (!items.length) continue;
    const f = items[(n - 1) % items.length];
    steps.push({
      id: `f_${f.id}`,
      title: `${f.emoji} ${f.name}`,
      detail: `${s.label} · ${s.time}. ${f.how}`,
      tag: items.length > 1 ? `Option ${((n - 1) % items.length) + 1} of ${items.length}` : undefined,
    });
  }
  return steps;
}
