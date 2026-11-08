// Who the plan is for. Drives tips, food focus and which remedies are highlighted.
export type Gender = "female" | "male";
export type AgeGroup = "20s" | "30s" | "40s" | "50+";
export type Diet = "veg" | "egg" | "nonveg";
export type Skin = "normal" | "dry" | "oily" | "combination" | "sensitive";
export type Concern = "spots" | "undereye" | "lines" | "acne" | "dull" | "pores";
export type Sun = "indoor" | "some" | "outdoor";
export type Goal = "auto" | "basic" | "glow" | "spots" | "ageing" | "clear";
export type Profile = { gender: Gender; age: AgeGroup; diet: Diet; skin: Skin; concerns: Concern[]; sun: Sun; goal?: Goal };

// Routine styles. "auto" builds from the person's answers; the others are ready-made plans.
export const GOALS: { id: Goal; emoji: string; title: string; line: string }[] = [
  { id: "auto", emoji: "🧭", title: "From my answers", line: "Built from your skin type and what bothers you" },
  { id: "basic", emoji: "🌿", title: "Basic care", line: "Just healthy skin: wash, moisturize, sunscreen" },
  { id: "glow", emoji: "✨", title: "Glow", line: "Brighter, hydrated skin. No strong actives" },
  { id: "spots", emoji: "🎯", title: "Spot fading", line: "Dark spots, tan and uneven tone" },
  { id: "ageing", emoji: "⏳", title: "Anti-ageing", line: "Fine lines, loose skin, dark circles" },
  { id: "clear", emoji: "🫧", title: "Clear skin", line: "Pimples, oil and open pores" },
];
export const GOAL_CONCERNS: Record<Exclude<Goal, "auto">, Concern[]> = {
  basic: [], glow: ["dull"], spots: ["spots", "dull"], ageing: ["lines", "undereye"], clear: ["acne", "pores"],
};

export const SKIN_LABEL: Record<Skin, string> = { normal: "Normal", dry: "Dry", oily: "Oily", combination: "Combination", sensitive: "Sensitive" };
export const SKIN_HINT: Record<Skin, string> = {
  normal: "Feels comfortable most of the day",
  dry: "Feels tight or flaky after washing",
  oily: "Shiny all over by afternoon",
  combination: "Oily forehead/nose, normal or dry cheeks",
  sensitive: "Turns red, itches or stings easily",
};
export const CONCERN_LABEL: Record<Concern, string> = {
  spots: "Dark spots / tan", undereye: "Dark circles", lines: "Fine lines / loose skin", acne: "Pimples / acne", dull: "Dull skin", pores: "Oil & open pores",
};
export const SUN_LABEL: Record<Sun, string> = { indoor: "Mostly indoors", some: "Some sun daily", outdoor: "Outdoors a lot" };

export const AGE_GROUPS: AgeGroup[] = ["20s", "30s", "40s", "50+"];
export const AGE_LABEL: Record<AgeGroup, string> = { "20s": "20–29", "30s": "30–39", "40s": "40–49", "50+": "50+" };
export const DIET_LABEL: Record<Diet, string> = { veg: "Vegetarian", egg: "Veg + eggs", nonveg: "Non-veg" };
export const DEFAULT_PROFILE: Profile = { gender: "female", age: "30s", diet: "veg", skin: "normal", concerns: [], sun: "some" };
// The starter account (Manorama): woman, 40s, veg + eggs, normal skin, spots + dark circles + loose skin.
export const SEED_PROFILE: Profile = { gender: "female", age: "40s", diet: "egg", skin: "normal", concerns: ["spots", "undereye", "lines"], sun: "some" };

/** Validate anything coming from the browser or an older saved profile; fills missing fields. */
export function cleanProfile(x: unknown, base: Profile = DEFAULT_PROFILE): Profile | null {
  const p = (x || {}) as Record<string, unknown>;
  if (!["female", "male"].includes(p.gender as string) || !AGE_GROUPS.includes(p.age as AgeGroup) || !["veg", "egg", "nonveg"].includes(p.diet as string)) return null;
  const skin = (Object.keys(SKIN_LABEL) as Skin[]).includes(p.skin as Skin) ? (p.skin as Skin) : base.skin;
  const concerns = Array.isArray(p.concerns) ? [...new Set((p.concerns as string[]).filter((c) => c in CONCERN_LABEL))] as Concern[] : base.concerns;
  const sun = (["indoor", "some", "outdoor"] as Sun[]).includes(p.sun as Sun) ? (p.sun as Sun) : base.sun;
  const goal = GOALS.some((g) => g.id === p.goal) ? (p.goal as Goal) : base.goal || "auto";
  return { gender: p.gender as Gender, age: p.age as AgeGroup, diet: p.diet as Diet, skin, concerns, sun, goal };
}


// Nutrient / skin focus tags used to mark "Good for you" on food and remedy cards.
export type Tag =
  | "protein" | "vitc" | "omega3" | "zinc" | "iron" | "calcium" | "collagen" | "antioxidant"
  | "gut" | "hydration" | "phyto" | "lowsugar" | "vitE" | "b12" | "energy";

export function focusFor(p: Profile): { title: string; tags: Tag[]; tips: string[]; skin: string[] } {
  const tags = new Set<Tag>(["antioxidant", "hydration", "gut", "protein"]);
  const tips: string[] = [];
  const skin: string[] = ["all"];
  let title = "";

  if (p.age === "20s") {
    title = "Clear, even skin";
    ["zinc", "omega3", "lowsugar"].forEach((t) => tags.add(t as Tag));
    tips.push("Breakouts and oil are the main concern now. Keep sugar, milk tea and fried snacks low.");
    tips.push("Retinol is optional before your late 20s. Niacinamide + sunscreen do most of the work.");
    skin.push("oily", "spots");
  } else if (p.age === "30s") {
    title = "Prevent early lines";
    ["vitc", "collagen", "omega3"].forEach((t) => tags.add(t as Tag));
    tips.push("Collagen starts dropping in the 30s. Vitamin C in the morning + retinol at night is the best pair.");
    tips.push("Under-eyes thin first: use the eye cream every night once Week 2 starts.");
    skin.push("spots", "eyes");
  } else if (p.age === "40s") {
    title = "Firmness & even tone";
    ["collagen", "calcium", "iron", "phyto", "vitc"].forEach((t) => tags.add(t as Tag));
    tips.push("Skin gets drier and slower to repair. Use moisturizer twice a day, even if skin feels fine.");
    tips.push("Retinol 2–3 nights a week is enough. More is not faster, it only irritates.");
    skin.push("dry", "spots", "eyes");
  } else {
    title = "Comfort, moisture & strength";
    ["calcium", "b12", "phyto", "collagen", "vitE"].forEach((t) => tags.add(t as Tag));
    tips.push("Skin barrier is thinner: choose gentle, fragrance-free products and skip scrubs.");
    tips.push("Retinol twice a week only, on top of moisturizer if it stings (\"sandwich\" method).");
    skin.push("dry", "eyes");
  }

  if (p.gender === "female") {
    if (p.age === "40s" || p.age === "50+") {
      tags.add("phyto");
      tips.push("Around perimenopause, flaxseed, soy/tofu and sesame support skin and bones. Add 1 tbsp flax daily.");
    } else {
      tags.add("iron");
      tips.push("Low iron shows as dull skin and dark circles. Pair iron foods (palak, chana, jaggery) with vitamin C.");
    }
    tips.push("Remove kajal and makeup with a little oil before washing at night.");
  } else {
    ["zinc", "protein"].forEach((t) => tags.add(t as Tag));
    tips.push("Shave after washing your face, then wait 2 min before serum. Skip alcohol-based aftershave.");
    tips.push("Men's skin is oilier: a thin gel or light cream moisturizer is enough, but don't skip it.");
    tips.push("Sunscreen on ears, back of neck and any bald patches too.");
    if (!skin.includes("oily")) skin.push("oily");
  }

  if (p.skin === "dry") { tips.unshift("Dry skin: lukewarm water only, apply moisturizer on slightly damp skin, and keep a cream for the night."); skin.push("dry"); }
  if (p.skin === "oily") { tips.unshift("Oily skin still needs moisturizer: a light gel stops the skin making extra oil."); if (!skin.includes("oily")) skin.push("oily"); }
  if (p.skin === "combination") tips.unshift("Combination skin: treat the T-zone (forehead, nose) for oil, keep cheeks moisturized.");
  if (p.skin === "sensitive") tips.unshift("Sensitive skin: add one new product every 2 weeks and patch test each on the jaw for 2 days.");
  if (p.concerns.includes("acne")) tips.unshift("Pimples: don't pop or scrub them; salicylic acid works slowly over 4–6 weeks. Change pillow covers twice a week.");
  if (p.sun === "outdoor") tips.unshift("A lot of sun: reapply sunscreen every 2 hours outside and wear a cap or dupatta. This matters more than any serum.");
  if (p.concerns.length === 0) tips.unshift("No big skin problems? Keep it simple: face wash, moisturizer and sunscreen are enough. Add serums only if you want.");
  if (p.diet === "veg") tips.push("Vegetarian: get B12 checked once a year, and have dahi, paneer or sprouts at every meal for protein.");
  return { title, tags: [...tags], tips, skin };
}

export const TAG_LABEL: Record<Tag, string> = {
  protein: "Protein", vitc: "Vitamin C", omega3: "Omega-3", zinc: "Zinc", iron: "Iron", calcium: "Calcium",
  collagen: "Collagen", antioxidant: "Antioxidants", gut: "Gut", hydration: "Hydration", phyto: "Hormone balance",
  lowsugar: "Low sugar", vitE: "Vitamin E", b12: "B12", energy: "Energy",
};
