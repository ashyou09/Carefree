"use client";
import {
  AGE_GROUPS, AGE_LABEL, CONCERN_LABEL, DIET_LABEL, SKIN_HINT, SKIN_LABEL, SUN_LABEL,
  type Concern, type Diet, type Profile, type Skin, type Sun,
} from "@/lib/profile";

// Six quick questions. Used on sign-up and in Settings; the routine, food and tips are built from these.
export default function ProfilePicker({ value, onChange }: { value: Profile; onChange: (p: Profile) => void }) {
  const set = (patch: Partial<Profile>) => onChange({ ...value, ...patch });
  const toggleConcern = (c: Concern) =>
    set({ concerns: value.concerns.includes(c) ? value.concerns.filter((x) => x !== c) : [...value.concerns, c] });
  return (
    <div className="pp">
      <Row label="1 · I am">
        {(["female", "male"] as const).map((g) => <Opt key={g} on={value.gender === g} onClick={() => set({ gender: g })}>{g === "female" ? "Woman" : "Man"}</Opt>)}
      </Row>
      <Row label="2 · Age">
        {AGE_GROUPS.map((a) => <Opt key={a} on={value.age === a} onClick={() => set({ age: a })}>{AGE_LABEL[a]}</Opt>)}
      </Row>
      <Row label="3 · Skin type" hint={SKIN_HINT[value.skin]}>
        {(Object.keys(SKIN_LABEL) as Skin[]).map((k) => <Opt key={k} on={value.skin === k} onClick={() => set({ skin: k })}>{SKIN_LABEL[k]}</Opt>)}
      </Row>
      <Row label="4 · What bothers you? (pick any)" hint={value.concerns.length ? undefined : "Nothing picked = a simple, basic routine"}>
        {(Object.keys(CONCERN_LABEL) as Concern[]).map((c) => <Opt key={c} on={value.concerns.includes(c)} onClick={() => toggleConcern(c)}>{value.concerns.includes(c) ? "✓ " : ""}{CONCERN_LABEL[c]}</Opt>)}
      </Row>
      <Row label="5 · Sun">
        {(Object.keys(SUN_LABEL) as Sun[]).map((k) => <Opt key={k} on={value.sun === k} onClick={() => set({ sun: k })}>{SUN_LABEL[k]}</Opt>)}
      </Row>
      <Row label="6 · Food">
        {(Object.keys(DIET_LABEL) as Diet[]).map((d) => <Opt key={d} on={value.diet === d} onClick={() => set({ diet: d })}>{DIET_LABEL[d]}</Opt>)}
      </Row>
    </div>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="pp-row">
      <span className="pp-l">{label}</span>
      <div className="seg-mini">{children}</div>
      {hint && <span className="pp-hint">{hint}</span>}
    </div>
  );
}
function Opt({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" className={on ? "on" : ""} aria-pressed={on} onClick={onClick}>{children}</button>;
}
