"use client";
import { AGE_GROUPS, AGE_LABEL, DIET_LABEL, type Profile, type Diet } from "@/lib/profile";

// Three small choice rows: I am · Age · Food. Used on sign-up and in Settings.
export default function ProfilePicker({ value, onChange }: { value: Profile; onChange: (p: Profile) => void }) {
  return (
    <div className="pp">
      <div className="pp-row">
        <span className="pp-l">I am</span>
        <div className="seg-mini">
          {(["female", "male"] as const).map((g) => (
            <button type="button" key={g} className={value.gender === g ? "on" : ""} onClick={() => onChange({ ...value, gender: g })}>{g === "female" ? "Woman" : "Man"}</button>
          ))}
        </div>
      </div>
      <div className="pp-row">
        <span className="pp-l">Age</span>
        <div className="seg-mini">
          {AGE_GROUPS.map((a) => (
            <button type="button" key={a} className={value.age === a ? "on" : ""} onClick={() => onChange({ ...value, age: a })}>{AGE_LABEL[a]}</button>
          ))}
        </div>
      </div>
      <div className="pp-row">
        <span className="pp-l">Food</span>
        <div className="seg-mini">
          {(Object.keys(DIET_LABEL) as Diet[]).map((d) => (
            <button type="button" key={d} className={value.diet === d ? "on" : ""} onClick={() => onChange({ ...value, diet: d })}>{DIET_LABEL[d]}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
