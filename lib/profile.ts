// Who the plan is for. Drives tips, food focus and which remedies are highlighted.
export type Gender = "female" | "male";
export type AgeGroup = "20s" | "30s" | "40s" | "50+";
export type Diet = "veg" | "egg" | "nonveg";
export type Profile = { gender: Gender; age: AgeGroup; diet: Diet };

export const AGE_GROUPS: AgeGroup[] = ["20s", "30s", "40s", "50+"];
export const AGE_LABEL: Record<AgeGroup, string> = { "20s": "20–29", "30s": "30–39", "40s": "40–49", "50+": "50+" };
export const DIET_LABEL: Record<Diet, string> = { veg: "Vegetarian", egg: "Veg + eggs", nonveg: "Non-veg" };
export const DEFAULT_PROFILE: Profile = { gender: "female", age: "30s", diet: "veg" };

export function isProfile(p: Partial<Profile> | undefined): p is Profile {
  return !!p && (p.gender === "female" || p.gender === "male") && AGE_GROUPS.includes(p.age as AgeGroup) && ["veg", "egg", "nonveg"].includes(p.diet as string);
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

  if (p.diet === "veg") tips.push("Vegetarian: get B12 checked once a year, and have dahi, paneer or sprouts at every meal for protein.");
  return { title, tags: [...tags], tips, skin };
}

export const TAG_LABEL: Record<Tag, string> = {
  protein: "Protein", vitc: "Vitamin C", omega3: "Omega-3", zinc: "Zinc", iron: "Iron", calcium: "Calcium",
  collagen: "Collagen", antioxidant: "Antioxidants", gut: "Gut", hydration: "Hydration", phyto: "Hormone balance",
  lowsugar: "Low sugar", vitE: "Vitamin E", b12: "B12", energy: "Energy",
};
