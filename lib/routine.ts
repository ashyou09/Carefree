// Personal routine engine: profile (skin type, concerns, sun, age) -> chosen products -> daily steps + night schedule.
import { GOAL_CONCERNS, type Profile } from "./profile";
import { addDays, dayNumber, weekOf, weekdayIdx, type Step } from "./plan";

export type Role = "cleanser" | "vitc" | "ha" | "nia" | "arbutin" | "bha" | "retinoid" | "eye" | "moist" | "spf" | "vite" | "rose";
export type Product = {
  id: string; role: Role; name: string; short: string; size: string; price: number; asin: string;
  emoji: string; forSkin: string; does: string; how: string; step: string;
};

export const ROLES: Record<Role, { label: string; essential?: boolean; when: string }> = {
  cleanser: { label: "Face wash", essential: true, when: "Morning + night" },
  vitc: { label: "Vitamin C serum", when: "Morning" },
  ha: { label: "Hydrating serum", when: "Morning + night" },
  nia: { label: "Niacinamide serum", when: "Night" },
  arbutin: { label: "Spot serum", when: "Night (from Week 2)" },
  bha: { label: "Exfoliating serum", when: "2 nights a week (from Week 2)" },
  retinoid: { label: "Retinol / anti-ageing", when: "2–3 nights a week (from Week 3)" },
  eye: { label: "Eye cream", when: "Night" },
  moist: { label: "Moisturizer", essential: true, when: "Morning + night" },
  spf: { label: "Sunscreen", essential: true, when: "Every morning" },
  vite: { label: "Vitamin E (skin only)", when: "2–3 nights a week" },
  rose: { label: "Toner / rose water", when: "Morning + night (optional)" },
};

// Order steps are shown in (morning first, then night-only, then extras).
export const ROLE_ORDER: Role[] = ["cleanser", "rose", "vitc", "ha", "moist", "spf", "nia", "arbutin", "bha", "retinoid", "eye", "vite"];
export const ROLE_GROUP: { label: string; roles: Role[] }[] = [
  { label: "Face wash", roles: ["cleanser"] },
  { label: "Serums", roles: ["vitc", "ha", "nia", "arbutin", "bha", "retinoid"] },
  { label: "Moisturizer", roles: ["moist"] },
  { label: "Sunscreen", roles: ["spf"] },
  { label: "Eye", roles: ["eye"] },
  { label: "Extras", roles: ["rose", "vite"] },
];

export const CATALOG: Product[] = [
  // face wash
  { id: "cleanser", role: "cleanser", name: "Cetaphil Gentle Skin Hydrating Face Wash", short: "Cetaphil", size: "118 ml", price: 331, asin: "B01CCGW4OE", emoji: "🧴", forSkin: "Normal · sensitive · combination", does: "Mild, soap-free face wash that won't dry the skin.", how: "1 coin-size on wet face, massage 30 sec, rinse with normal (not hot) water, pat dry.", step: "1 coin-size, massage 30 sec on wet face, rinse with normal water, pat dry." },
  { id: "c_cerave", role: "cleanser", name: "CeraVe Hydrating Cleanser (non-foaming)", short: "CeraVe cleanser", size: "88 ml", price: 287, asin: "B0D37HZG5C", emoji: "🧴", forSkin: "Dry · normal", does: "Cream face wash with ceramides and hyaluronic acid; cleans without the tight feeling.", how: "Massage on damp skin 30 sec, rinse with lukewarm water. No scrubbing.", step: "Massage on damp skin 30 sec, rinse with lukewarm water, pat dry." },
  { id: "c_sal", role: "cleanser", name: "Minimalist 2% Salicylic Acid Face Wash", short: "Salicylic face wash", size: "100 ml", price: 269, asin: "B096PJMGPL", emoji: "🫧", forSkin: "Oily · acne-prone", does: "Salicylic acid + LHA clean inside pores and control oil and pimples.", how: "Massage 60 sec on wet face (let it work), rinse. If skin gets dry, use only at night.", step: "Massage 60 sec on wet face, rinse well, pat dry." },
  // vitamin c
  { id: "vitc", role: "vitc", name: "Minimalist 10% Vitamin C Serum", short: "Vitamin C", size: "30 ml", price: 615, asin: "B08MVBF4P8", emoji: "🍊", forSkin: "All skin types", does: "Brightens, fades spots and protects from sun damage.", how: "Morning after washing: 3–4 drops on face and neck, pat in. Wait 1–2 min, then moisturizer and sunscreen. Keep away from light.", step: "3–4 drops, pat on face and neck. Avoid eyelids. Wait 1–2 min." },
  // hydrating
  { id: "ha", role: "ha", name: "Minimalist 2% Hyaluronic Acid + PGA Serum", short: "Hyaluronic acid", size: "30 ml", price: 527, asin: "B08FB972DT", emoji: "💦", forSkin: "Dry · dehydrated · sensitive", does: "Pulls water into the skin: plumper, smoother, less tight.", how: "2–3 drops on slightly damp skin, then moisturizer straight away to lock it in.", step: "2–3 drops on slightly damp skin, then moisturizer right away." },
  // niacinamide
  { id: "nia", role: "nia", name: "Minimalist 10% Niacinamide Serum", short: "Niacinamide", size: "30 ml", price: 508, asin: "B08F9MF314", emoji: "💧", forSkin: "All · great for oily & spots", does: "Evens tone, reduces spots and oil, strengthens the skin barrier.", how: "3 drops after washing, pat in, wait 1 min, then the next step.", step: "3 drops, pat on face and neck." },
  // spots
  { id: "arbutin", role: "arbutin", name: "Minimalist 2% Alpha Arbutin Serum", short: "Alpha Arbutin", size: "30 ml", price: 466, asin: "B08GGDRRQ8", emoji: "✨", forSkin: "Dark spots · tan · pigmentation", does: "Targets dark spots and pigmentation.", how: "Night from Week 2: 3 drops on dry skin, focus on patches. Can be used with niacinamide.", step: "3 drops on face, focus on dark patches. Wait 1 min." },
  // exfoliant
  { id: "bha", role: "bha", name: "Minimalist 2% Salicylic Acid Serum", short: "Salicylic serum", size: "30 ml", price: 494, asin: "B08GG9M863", emoji: "🧪", forSkin: "Acne · blackheads · open pores", does: "Unclogs pores, reduces pimples and blackheads.", how: "Only on exfoliating nights: 2–3 drops on dry skin, avoid eyes and lips, then moisturizer. Never on retinol nights.", step: "2–3 drops on dry skin (T-zone and breakout areas), wait 2 min." },
  // retinoid
  { id: "retinol", role: "retinoid", name: "Minimalist 0.3% Retinol + Q10 Serum", short: "Retinol", size: "30 ml", price: 527, asin: "B091JG3GJ5", emoji: "🌙", forSkin: "Fine lines · loose skin · 30+", does: "Firmness, fine lines, smoother texture.", how: "Retinol nights only (from Week 3): wait 5 min after washing, 1 pea-size for the face, avoid eyes, nose corners, lips. Moisturizer after 10 min. Sunscreen next day.", step: "Wait 5 min after washing (skin fully dry). 1 pea-size for full face: dot and spread. Avoid eyes, nose corners, lips. Wait 10 min." },
  { id: "retinoid_g", role: "retinoid", name: "Minimalist 2% Retinoid Night Cream (gentle)", short: "Gentle retinoid", size: "50 g", price: 596, asin: "B08F8W91F8", emoji: "🌛", forSkin: "Sensitive · first-time · 50+", does: "Gentler retinoid (granactive) for lines and texture with less dryness.", how: "From Week 3 on retinoid nights: pea-size on dry skin as the last step. Sunscreen next day.", step: "Pea-size on dry skin as your last step (it is also a cream)." },
  // eye
  { id: "eye", role: "eye", name: "Minimalist Vitamin K + Retinal Eye Cream", short: "Eye cream", size: "14 g", price: 449, asin: "B0CHYR58VF", emoji: "👁️", forSkin: "Dark circles · puffiness", does: "Under-eye darkness, puffiness, fine lines.", how: "Night: a rice-grain amount per eye, tap with the ring finger along the under-eye bone. Not on the eyelid.", step: "Rice-grain amount per eye, tap under the eye bone only." },
  // moisturizer
  { id: "moist", role: "moist", name: "CeraVe Moisturizing Cream", short: "CeraVe cream", size: "50 ml", price: 365, asin: "B07CH8F17Q", emoji: "🫙", forSkin: "Normal · dry", does: "Repairs skin barrier; calms retinol dryness.", how: "Pea-size for the face, a little more for the neck. Morning after serum, and last step at night.", step: "Pea-size CeraVe, thin layer on face and neck." },
  { id: "m_b5", role: "moist", name: "Minimalist 10% Vitamin B5 Oil-Free Gel Moisturizer", short: "B5 gel moisturizer", size: "50 g", price: 296, asin: "B09Q3MWP2S", emoji: "🫧", forSkin: "Oily · combination · acne-prone", does: "Light, oil-free gel that hydrates without feeling greasy.", how: "Pea-size after serum, morning and night. Thin layer is enough.", step: "Pea-size gel, thin layer on face and neck." },
  { id: "m_hydro", role: "moist", name: "Neutrogena Hydro Boost Water Gel", short: "Hydro Boost gel", size: "50 g", price: 549, asin: "B07MTX97N7", emoji: "💠", forSkin: "Oily · combination · normal", does: "Water-gel with hyaluronic acid; very light, good for humid weather.", how: "Pea-size after serum, morning and night.", step: "Pea-size water-gel on face and neck." },
  { id: "m_ceramide", role: "moist", name: "Minimalist 0.3% Ceramide Barrier Repair Moisturizer", short: "Ceramide moisturizer", size: "50 g", price: 539, asin: "B09P3FR9DD", emoji: "🛡️", forSkin: "Sensitive · dry · damaged barrier", does: "Ceramides rebuild a weak, easily-irritated skin barrier.", how: "Pea-size morning and night; extra on dry patches.", step: "Pea-size on face and neck; a little extra on dry patches." },
  { id: "m_cetaphil", role: "moist", name: "Cetaphil Moisturising Cream", short: "Cetaphil cream", size: "100 g", price: 646, asin: "B01HMLB0LW", emoji: "🫙", forSkin: "Very dry · sensitive", does: "Rich, fragrance-free cream for very dry skin; also for body.", how: "Small amount on face and neck, morning and night.", step: "Small amount on face and neck." },
  // sunscreen
  { id: "spf", role: "spf", name: "Re'equil Ultra Matte Sunscreen SPF 50 PA++++", short: "Re'equil matte", size: "50 g", price: 580, asin: "B07VP5JFRB", emoji: "☀️", forSkin: "Normal · oily · combination", does: "Blocks UV rays. Light, matte, no white cast.", how: "Last step every morning: 2 finger-lengths for face and neck, plus ears.", step: "2 finger-lengths for face & neck, ears, hairline." },
  { id: "spf_mini", role: "spf", name: "Minimalist SPF 50 Sunscreen (with Niacinamide)", short: "Minimalist SPF 50", size: "50 g", price: 338, asin: "B09FPS9D5T", emoji: "🌤️", forSkin: "Normal · sensitive · all", does: "Lightweight, hydrating sunscreen with multi-vitamins; budget pick.", how: "Last step every morning: 2 finger-lengths for face and neck.", step: "2 finger-lengths for face & neck, ears, hairline." },
  { id: "spf_dewy", role: "spf", name: "Aqualogica Hydrate+ Dewy Sunscreen SPF 50", short: "Aqualogica dewy SPF", size: "50 g", price: 395, asin: "B09RKP4LBK", emoji: "🌞", forSkin: "Dry · normal", does: "Moisturizing, dewy finish; good for dry skin and winter.", how: "Last step every morning: 2 finger-lengths for face and neck.", step: "2 finger-lengths for face & neck, ears, hairline." },
  // extras
  { id: "vite", role: "vite", name: "Evion 400 Vitamin E (skin use only)", short: "Vitamin E", size: "20 caps", price: 86, asin: "B0C3VCMHCN", emoji: "💊", forSkin: "Dry · mature skin", does: "Extra nourishment mixed into the night moisturizer. Not to swallow.", how: "2–3 nights a week: pierce 1 capsule, mix the oil into your night moisturizer. Do not swallow (low BP).", step: "Prick 1 Evion capsule, mix the oil into the moisturizer. Skin use only." },
  { id: "rose", role: "rose", name: "Dabur Gulabari Rose Water", short: "Rose water", size: "400 ml", price: 94, asin: "B085QMJ3TS", emoji: "🌹", forSkin: "All skin types", does: "Gentle toner and for mixing face packs.", how: "Toner after washing: spray or pat with cotton. Also for face packs.", step: "Pat on with cotton after washing (optional)." },
];

export const byPid = Object.fromEntries(CATALOG.map((p) => [p.id, p])) as Record<string, Product>;
export const amazonUrl = (p: Product) => `https://www.amazon.in/dp/${p.asin}`;
export const rupees = (n: number) => "₹" + n.toLocaleString("en-IN");

export type Picks = Partial<Record<Role, string>>; // role -> product id, or "none"
export type Selection = Partial<Record<Role, Product>>;

/** Best default products for this person. */
export function defaultPicks(p: Profile): Picks {
  const goal = p.goal || "auto";
  const c = new Set(goal === "auto" ? p.concerns : GOAL_CONCERNS[goal]);
  const oily = p.skin === "oily" || p.skin === "combination";
  const out: Picks = {};
  out.cleanser = c.has("acne") || p.skin === "oily" ? "c_sal" : p.skin === "dry" ? "c_cerave" : "cleanser";
  out.moist = oily ? "m_b5" : p.skin === "sensitive" ? "m_ceramide" : "moist";
  out.spf = oily || c.has("acne") ? "spf" : p.skin === "dry" ? "spf_dewy" : p.skin === "sensitive" ? "spf_mini" : "spf";
  if (c.has("spots") || c.has("dull") || c.has("lines") || p.sun === "outdoor") out.vitc = "vitc";
  if (goal === "basic") return out; // wash, moisturize, sunscreen only
  if (p.skin === "dry" || p.skin === "sensitive" || goal === "glow") out.ha = "ha";
  if (c.has("spots") || c.has("pores") || c.has("acne") || c.has("dull") || oily || (goal === "auto" && (p.age === "40s" || p.age === "50+"))) out.nia = "nia";
  if (c.has("spots")) out.arbutin = "arbutin";
  if (c.has("acne") || c.has("pores")) out.bha = "bha";
  if (c.has("lines")) out.retinoid = p.skin === "sensitive" || p.age === "50+" || p.age === "20s" ? "retinoid_g" : "retinol";
  if (c.has("undereye")) out.eye = "eye";
  if (goal === "auto" && (p.skin === "dry" || p.age === "40s" || p.age === "50+") && !oily && !c.has("acne")) out.vite = "vite";
  out.rose = "rose";
  return out;
}

export function selection(p: Profile, overrides: Picks = {}): Selection {
  const picks = { ...defaultPicks(p), ...overrides };
  const sel: Selection = {};
  (Object.keys(picks) as Role[]).forEach((r) => {
    const id = picks[r];
    if (id && id !== "none" && byPid[id]?.role === r) sel[r] = byPid[id];
  });
  return sel;
}

// ---------------- steps ----------------
const slowRetinoid = (p: Profile, s: Selection) => p.skin === "sensitive" || p.age === "50+" || s.retinoid?.id === "retinoid_g";

export function amSteps(s: Selection, p: Profile): Step[] {
  const out: Step[] = [];
  if (s.cleanser) out.push({ id: "am_wash", title: "Wash face", detail: `${s.cleanser.short}: ${s.cleanser.step}${p.gender === "male" ? " Shave now if needed, then wait 2 min before serum." : ""}` });
  if (s.vitc) out.push({ id: "am_vitc", title: "Vitamin C serum", detail: s.vitc.step });
  if (s.ha) out.push({ id: "am_ha", title: "Hyaluronic acid serum", detail: s.ha.step });
  if (s.moist) out.push({ id: "am_moist", title: "Moisturizer", detail: `${s.moist.short}: ${s.moist.step}` });
  if (s.spf) out.push({
    id: "am_spf", title: "Sunscreen SPF 50", tag: "Most important",
    detail: s.spf.step + (p.sun === "outdoor" ? " Reapply every 2 hours outside; add a cap or dupatta." : p.sun === "indoor" ? " Indoors, once is enough; reapply if you step out." : " Even indoors near windows. Reapply every 2–3 h if outside."),
  });
  return out;
}

export type NightType = "basic" | "normal" | "retinol" | "pack" | "bha";
// rows = week 1..4, columns = Mon..Sun
const BASE: NightType[][] = [
  ["basic", "basic", "basic", "pack", "basic", "basic", "pack"],
  ["normal", "normal", "pack", "normal", "normal", "pack", "normal"],
  ["normal", "pack", "retinol", "normal", "normal", "pack", "retinol"],
  ["retinol", "normal", "retinol", "pack", "retinol", "normal", "pack"],
];

function weekRow(week: number, s: Selection, p: Profile): NightType[] {
  const row = BASE[week - 1].map((t) => (t === "retinol" && !s.retinoid ? "normal" : t));
  if (week === 4 && s.retinoid && slowRetinoid(p, s)) row[0] = "normal"; // slower: stay at 2 nights
  if (s.bha && week >= 2) {
    let n = 0;
    for (let i = 0; i < 7 && n < 2; i++) {
      // never next to a retinol night
      if (row[i] === "normal" && row[i - 1] !== "retinol" && row[i + 1] !== "retinol") { row[i] = "bha"; n++; i++; }
    }
  }
  return row;
}

function rawNight(start: string, date: string, s: Selection, p: Profile): NightType {
  const day = dayNumber(start, date);
  if (day < 1) return "basic";
  return weekRow(weekOf(day), s, p)[weekdayIdx(date)];
}
export function nightType(start: string, date: string, s: Selection, p: Profile): NightType {
  const t = rawNight(start, date, s, p);
  const prev = rawNight(start, addDays(date, -1), s, p);
  if ((t === "retinol" || t === "bha") && (prev === "retinol" || prev === "bha")) return "normal"; // no two strong nights in a row
  return t;
}

export function weekGrid(start: string, s: Selection, p: Profile): NightType[][] {
  const startWd = weekdayIdx(start);
  return [1, 2, 3, 4].map((w) => [0, 1, 2, 3, 4, 5, 6].map((i) => nightType(start, addDays(start, (w - 1) * 7 + ((i - startWd + 7) % 7)), s, p)));
}

export const NIGHT_LABEL: Record<NightType, string> = {
  basic: "Basic night", normal: "Normal night", retinol: "Retinol night", pack: "Face pack night", bha: "Exfoliating night",
};

export function nightNote(t: NightType, s: Selection): string {
  switch (t) {
    case "basic": return `Week 1: ${[s.nia && "Niacinamide", s.ha && "hyaluronic acid", "moisturizer"].filter(Boolean).join(" + ")} only, so the skin can get used to it.`;
    case "normal": return s.arbutin ? "Spot-fading night: Alpha Arbutin + Niacinamide." : "Calm night: your serums + moisturizer.";
    case "retinol": return "Keep it simple: only retinol + moisturizer. No face pack, no other serum.";
    case "bha": return "Pore-clearing night: salicylic serum + moisturizer only. No retinol tonight.";
    case "pack": return "Pamper night: face pack, then a gentle serum.";
  }
}

export function nightSteps(start: string, date: string, s: Selection, p: Profile): Step[] {
  const day = Math.max(1, dayNumber(start, date));
  const week = weekOf(day);
  const t = nightType(start, date, s, p);
  const eyeTonight = !!s.eye && (week > 1 || day % 2 === 1);
  const oilFirst = p.gender === "female" || p.skin === "dry" || p.skin === "normal";
  const name = s.cleanser?.short || "face wash";
  const clean: Step = {
    id: "pm_clean", title: "Remove sunscreen & wash",
    detail: (p.gender === "female" ? "Remove kajal / makeup first. " : "") + (oilFirst ? `Few drops coconut oil on dry face 30 sec, wipe with a damp cloth, then ${name}. Pat dry.` : `Wash twice with ${name} to remove sunscreen. Pat dry.`),
  };
  const st = (id: string, title: string, prod?: Product, tag?: string): Step[] => (prod ? [{ id, title, detail: prod.step, ...(tag ? { tag } : {}) }] : []);
  const nia = st("pm_nia", "Niacinamide serum", s.nia);
  const ha = st("pm_ha", "Hyaluronic acid serum", s.ha);
  const arb = st("pm_arbutin", "Alpha Arbutin serum", s.arbutin);
  const eye = eyeTonight ? st("pm_eye", "Eye cream", s.eye) : [];
  const moist: Step[] = s.moist ? [{ id: "pm_moist", title: "Moisturizer", detail: `${s.moist.short}: ${s.moist.step} On dry areas add a little more.` }] : [];
  const vite = st("pm_vite", "Vitamin E (optional)", s.vite);
  const pack: Step = { id: "pm_pack", title: "Face pack", detail: "Pick one from Routine → Remedies (besan–dahi, aloe–honey, rose–dahi…). 10–15 min, rinse gently.", tag: "Face pack night" };
  switch (t) {
    case "basic": return [clean, ...nia, ...ha, ...eye, ...moist];
    case "normal": return [clean, ...(week > 1 ? arb : []), ...nia, ...ha, ...eye, ...moist, ...vite];
    case "retinol":
      return s.retinoid?.id === "retinoid_g"
        ? [clean, ...ha, { id: "pm_retinol", title: "Retinoid night cream", detail: s.retinoid.step, tag: "Retinol night" }]
        : [clean, ...st("pm_retinol", "Retinol serum", s.retinoid, "Retinol night"), ...moist];
    case "bha": return [clean, ...st("pm_bha", "Salicylic acid serum", s.bha, "Exfoliating night"), ...moist];
    case "pack": return [clean, pack, ...(week > 1 ? arb : []), ...nia, ...eye, ...moist, ...vite];
  }
}

export function weekNews(s: Selection, p: Profile): string[] {
  const serums = [s.nia && "Niacinamide", s.ha && "Hyaluronic acid"].filter(Boolean).join(" + ") || "only moisturizer";
  return [
    `Morning routine every day. Night: ${serums}.${s.eye ? " Eye cream every other night." : ""}`,
    [s.arbutin && "Add Alpha Arbutin before Niacinamide.", s.bha && "Start salicylic serum 2 nights a week.", s.eye && "Eye cream every night if no irritation."].filter(Boolean).join(" ") || "Same routine; add face-pack nights.",
    s.retinoid ? `Start ${s.retinoid.short} 2 nights a week. Mild dryness is normal: add extra moisturizer.` : "Keep going. Consistency matters more than adding products.",
    s.retinoid ? (slowRetinoid(p, s) ? `Stay at 2 ${s.retinoid.short} nights a week (gentler for your skin).` : `${s.retinoid.short} 3 nights a week only if Week 3 went well. If not, stay at 2.`) : "Same routine. Results show from week 4–8.",
  ];
}

export const ALL_CHECK_IDS = ["am_wash", "am_vitc", "am_ha", "am_moist", "am_spf", "pm_clean", "pm_nia", "pm_ha", "pm_arbutin", "pm_eye", "pm_moist", "pm_vite", "pm_pack", "pm_retinol", "pm_bha"];
