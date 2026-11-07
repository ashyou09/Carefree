// All plan content + schedule logic. Shared by server and client.

export type Product = {
  id: string;
  name: string;
  size: string;
  does: string;
  when: string;
  price: string;
  url: string;
};

export const PRODUCTS: Product[] = [
  { id: "cleanser", name: "Cetaphil Gentle Skin Hydrating Face Wash", size: "118 ml", does: "Mild, soap-free face wash that won't dry the skin.", when: "Morning + Night", price: "₹331", url: "https://www.amazon.in/dp/B01CCGW4OE" },
  { id: "vitc", name: "Minimalist 10% Vitamin C Serum", size: "30 ml", does: "Brightens, fades spots, protects from sun damage.", when: "Morning", price: "₹615", url: "https://www.amazon.in/dp/B08MVBF4P8" },
  { id: "spf", name: "Re'equil Ultra Matte Sunscreen SPF 50 PA++++", size: "50 g", does: "Blocks UV rays. Light, no white cast.", when: "Morning", price: "₹580", url: "https://www.amazon.in/dp/B07VP5JFRB" },
  { id: "moist", name: "CeraVe Moisturizing Cream", size: "50 ml", does: "Repairs skin barrier; calms retinol dryness.", when: "Morning + Night", price: "₹367", url: "https://www.amazon.in/dp/B07CH8F17Q" },
  { id: "nia", name: "Minimalist 10% Niacinamide Serum", size: "30 ml", does: "Evens tone, reduces spots, strengthens skin.", when: "Night", price: "₹508", url: "https://www.amazon.in/dp/B08F9MF314" },
  { id: "arbutin", name: "Minimalist 2% Alpha Arbutin Serum", size: "30 ml", does: "Targets dark spots and pigmentation.", when: "Night (from Week 2)", price: "₹466", url: "https://www.amazon.in/dp/B08GGDRRQ8" },
  { id: "retinol", name: "Minimalist 0.3% Retinol + Q10 Serum", size: "30 ml", does: "Firmness, fine lines, smoother texture.", when: "Night (from Week 3)", price: "₹527", url: "https://www.amazon.in/dp/B091JG3GJ5" },
  { id: "eye", name: "Minimalist Vitamin K + Retinal Eye Cream", size: "14 g", does: "Under-eye darkness, puffiness, fine lines.", when: "Night", price: "₹449", url: "https://www.amazon.in/dp/B0CHYR58VF" },
  { id: "vite", name: "Evion 400 Vitamin E (skin use only)", size: "20 caps", does: "Extra nourishment mixed into moisturizer. Not to swallow (low BP).", when: "Night, 2–3×/week", price: "₹86", url: "https://www.amazon.in/dp/B0C3VCMHCN" },
  { id: "rose", name: "Dabur Gulabari Rose Water", size: "400 ml", does: "Gentle toner and for mixing face packs.", when: "Morning + Night", price: "₹94", url: "https://www.amazon.in/dp/B085QMJ3TS" },
];

export type Step = { id: string; title: string; detail: string; tag?: string };

export const AM_STEPS: Step[] = [
  { id: "am_wash", title: "Wash face", detail: "Cetaphil: 1 coin-size, massage 30 sec on wet face, rinse with normal water, pat dry. Rose water after (optional)." },
  { id: "am_vitc", title: "Vitamin C serum", detail: "3–4 drops, pat on face and neck. Avoid eyelids. Wait 1–2 min." },
  { id: "am_moist", title: "Moisturizer", detail: "Pea-size CeraVe, thin layer on face and neck." },
  { id: "am_spf", title: "Sunscreen SPF 50", detail: "2 finger-lengths for face & neck, ears, hairline. Even indoors. Reapply every 2–3 h if outside.", tag: "Most important" },
];

const PM: Record<string, Step> = {
  clean: { id: "pm_clean", title: "Remove sunscreen & wash", detail: "Few drops coconut oil on dry face 30 sec, wipe with damp cloth, then Cetaphil wash. Pat dry." },
  arbutin: { id: "pm_arbutin", title: "Alpha Arbutin serum", detail: "3 drops on face, focus on dark patches. Wait 1 min." },
  nia: { id: "pm_nia", title: "Niacinamide serum", detail: "3 drops, pat on face and neck." },
  retinol: { id: "pm_retinol", title: "Retinol serum", detail: "Wait 5 min after washing (skin fully dry). 1 pea-size for full face: dot and spread. Avoid eyes, nose corners, lips. Wait 10 min.", tag: "Retinol night" },
  pack: { id: "pm_pack", title: "Face pack", detail: "Besan–haldi–dahi OR aloe–honey OR rose water–dahi. 10–15 min, rinse gently. See Routine tab.", tag: "Face pack night" },
  eye: { id: "pm_eye", title: "Eye cream", detail: "Rice-grain amount per eye, tap under the eye bone only." },
  moist: { id: "pm_moist", title: "Moisturizer", detail: "Pea-size CeraVe. On dry areas add a little more." },
  vite: { id: "pm_vite", title: "Vitamin E (optional)", detail: "Prick 1 Evion capsule, mix oil into the moisturizer. Skin use only." },
};

export const HABITS: Step[] = [
  { id: "h_warm", title: "Warm water + soaked dry fruits", detail: "5 almonds, 2 walnut halves, 6–8 raisins (good for low BP)." },
  { id: "h_jeera", title: "Jeera water", detail: "Empty stomach, 20 min before breakfast." },
  { id: "h_protein", title: "Protein breakfast", detail: "Chilla with paneer / sprouts, or 2 eggs." },
  { id: "h_fruit", title: "1 fruit", detail: "Amla, orange, guava, papaya or pomegranate." },
  { id: "h_dahi", title: "Dahi or chaas", detail: "With lunch, for gut health." },
  { id: "h_cucumber", title: "Cucumber–coriander water", detail: "1 litre with a pinch of sendha namak, sip 10 am–6 pm." },
  { id: "h_water", title: "2.5 litres total fluids", detail: "Water, cucumber water, coconut water, chaas all count." },
  { id: "h_walk", title: "Walk 20–30 min", detail: "Plus 10 min slow walk after lunch and dinner." },
  { id: "h_sleep", title: "Slept 7+ hours", detail: "Tick in the morning for last night." },
];

export const CHECK_IDS: string[] = [
  ...AM_STEPS.map((s) => s.id),
  ...Object.values(PM).map((s) => s.id),
  ...HABITS.map((s) => s.id),
];

// ---------- schedule ----------
export type NightType = "basic" | "normal" | "retinol" | "pack";
// rows = week 1..4, columns = Mon..Sun
const SCHEDULE: NightType[][] = [
  ["basic", "basic", "basic", "pack", "basic", "basic", "pack"],
  ["normal", "normal", "pack", "normal", "normal", "pack", "normal"],
  ["normal", "pack", "retinol", "normal", "normal", "pack", "retinol"],
  ["retinol", "normal", "retinol", "pack", "retinol", "normal", "pack"],
];

export const NIGHT_LABEL: Record<NightType, string> = {
  basic: "Basic night",
  normal: "Normal night",
  retinol: "Retinol night",
  pack: "Face pack night",
};

export const NIGHT_NOTE: Record<NightType, string> = {
  basic: "Week 1: only Niacinamide + moisturizer so the skin can get used to it.",
  normal: "Spot-fading night: Alpha Arbutin + Niacinamide.",
  retinol: "Keep it simple: only retinol + moisturizer. No face pack, no other serum.",
  pack: "Pamper night: face pack, then a gentle serum.",
};

export const WEEK_NEWS = [
  "Morning routine every day. Night: Niacinamide only. Eye cream every other night.",
  "Add Alpha Arbutin before Niacinamide. Eye cream every night if no irritation.",
  "Start Retinol 2 nights (Wed & Sun). Mild dryness is normal — add extra moisturizer.",
  "Retinol 3 nights (Mon, Wed, Fri) only if Week 3 went well. If not, stay at 2.",
];

export function parseDate(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}
export function addDays(s: string, n: number) {
  const t = new Date(parseDate(s) + n * 86400000);
  return t.toISOString().slice(0, 10);
}
export function dayNumber(start: string, date: string) {
  return Math.floor((parseDate(date) - parseDate(start)) / 86400000) + 1;
}
export function weekOf(day: number) {
  return Math.min(4, Math.max(1, Math.ceil(day / 7)));
}
// Monday = 0
export function weekdayIdx(date: string) {
  return (new Date(parseDate(date)).getUTCDay() + 6) % 7;
}
function rawNight(start: string, date: string): NightType {
  const day = dayNumber(start, date);
  if (day < 1) return "basic";
  return SCHEDULE[weekOf(day) - 1][weekdayIdx(date)];
}
// Never two retinol nights in a row (can happen where weeks meet).
export function nightType(start: string, date: string): NightType {
  const t = rawNight(start, date);
  if (t === "retinol" && rawNight(start, addDays(start, dayNumber(start, date) - 2)) === "retinol") return "normal";
  return t;
}

export function nightSteps(start: string, date: string): Step[] {
  const day = Math.max(1, dayNumber(start, date));
  const week = weekOf(day);
  const t = nightType(start, date);
  const eyeTonight = week > 1 || day % 2 === 1;
  switch (t) {
    case "basic":
      return [PM.clean, PM.nia, ...(eyeTonight ? [PM.eye] : []), PM.moist];
    case "normal":
      return [PM.clean, PM.arbutin, PM.nia, PM.eye, PM.moist, PM.vite];
    case "retinol":
      return [PM.clean, PM.retinol, PM.moist];
    case "pack":
      return [PM.clean, PM.pack, ...(week > 1 ? [PM.arbutin] : []), PM.nia, ...(eyeTonight ? [PM.eye] : []), PM.moist, PM.vite];
  }
}

// ---------- reference content ----------
export const RULES = [
  ["Sunscreen every morning", "Even at home. Without it, serums cannot fade dark spots."],
  ["Patch test new products", "Behind the ear or jawline for 24 h. Red, itchy or burning → don't use."],
  ["One new product at a time", "The schedule adds them slowly for you."],
  ["Never lemon, baking soda, toothpaste", "They burn the skin and make patches darker."],
  ["Low BP care", "Don't skip meals or cut salt; stand up slowly. Vitamin E on skin only."],
  ["Retinol nights = simple nights", "Only retinol + moisturizer."],
];

export const PACKS = [
  { name: "Besan–haldi–dahi", recipe: "2 tsp besan + 1 pinch haldi + 1–2 tsp plain dahi.", use: "10–12 min. Wet hands, rub very gently while washing.", benefit: "Brightens, removes dead skin" },
  { name: "Aloe–honey", recipe: "1 tbsp fresh aloe gel + ½ tsp honey.", use: "15 min, rinse with normal water.", benefit: "Hydrates, calms, glow" },
  { name: "Rose water–dahi", recipe: "1 tbsp dahi + 1 tsp rose water.", use: "10 min, rinse.", benefit: "Softens skin gently" },
];

export const MEALS = [
  { time: "6:30 am", title: "Wake up", veg: "1 glass warm water, then 5 soaked almonds + 2 walnut halves + 6–8 soaked raisins.", egg: "Same", note: "Raisins help with low BP and iron." },
  { time: "7:15 am", title: "Jeera water", veg: "Recipe in Drinks.", egg: "Same", note: "Empty stomach." },
  { time: "8:30 am", title: "Breakfast", veg: "2 moong dal chilla with paneer / besan chilla with veggies / poha with peanuts + sprouts.", egg: "2 boiled eggs or veg omelette + 1 multigrain toast or roti.", note: "Never skip (low BP). Protein helps firmness." },
  { time: "11:00 am", title: "Mid-morning", veg: "1 fruit (amla, orange, guava, papaya, pomegranate) or coconut water.", egg: "Same", note: "Vitamin C fruits support collagen." },
  { time: "1:30 pm", title: "Lunch", veg: "2 roti / 1 bowl rice + dal/rajma/chole + green sabzi + salad + dahi.", egg: "2–3 days a week: egg curry instead of dal.", note: "Walk 10 min after. Chaas helps digestion." },
  { time: "4:30 pm", title: "Evening", veg: "1 cup tea + roasted chana / makhana / pumpkin seeds.", egg: "Or 1 boiled egg with pepper.", note: "Keep sipping cucumber water." },
  { time: "7:30 pm", title: "Dinner", veg: "Moong dal khichdi with ghee / veg dalia / 2 roti + paneer bhurji + soup.", egg: "Egg bhurji (2 eggs) + 2 roti + sabzi.", note: "Finish 2 h before sleep." },
  { time: "Bedtime", title: "Optional", veg: "1 cup warm milk with a pinch of haldi.", egg: "Same", note: "Skip if it causes acidity." },
];

export const DRINKS = [
  { name: "Cucumber–coriander water", recipe: "1 litre water + ½ cucumber (thin slices) + handful coriander + 4–5 mint leaves + pinch of sendha namak. Rest 1–2 h.", when: "Sip 10 am–6 pm. Fresh daily." },
  { name: "Jeera water", recipe: "Soak 1 tsp jeera overnight in 1 glass water. Boil 3–4 min, strain, drink warm.", when: "Empty stomach." },
  { name: "Coconut water", recipe: "1 fresh coconut.", when: "Mid-morning, 3–4 days a week." },
  { name: "Nimbu–namak paani", recipe: "1 glass water + ½ lemon + pinch of salt + 1 tsp sugar/honey.", when: "When dizzy, weak, or on hot days." },
  { name: "Chaas", recipe: "Dahi + water + roasted jeera + pinch of salt + coriander.", when: "After lunch." },
];

export const LOW_BP = [
  "Eat small meals every 3–4 hours.",
  "Don't cut salt unless a doctor says so.",
  "Get up slowly from bed or a chair.",
  "Avoid very long standing and very hot baths.",
  "Dizzy, faint or very tired often? Check BP and see a doctor.",
];
