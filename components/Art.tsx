export function Logo() {
  return (
    <svg className="logo" viewBox="0 0 32 32" aria-hidden>
      <circle cx="16" cy="16" r="16" fill="#F3DCD0" />
      <path d="M9 22c2-7 8-11 15-10-1 7-6 12-15 10z" fill="#A8604A" />
      <path d="M9 22c4-3 7-5 11-7" stroke="#F3DCD0" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Leaves() {
  return (
    <svg className="leaves" viewBox="0 0 200 200" aria-hidden>
      <path d="M150 20c-40 10-70 50-60 110 50-10 80-50 60-110z" fill="#E9C3B2" opacity=".55" />
      <path d="M150 20C130 60 110 95 90 130" stroke="#D9A892" strokeWidth="2" fill="none" />
      <path d="M190 90c-30 0-55 25-55 70 35-5 60-30 55-70z" fill="#C9D5C3" opacity=".7" />
      <path d="M190 90c-20 20-40 45-55 70" stroke="#A9BBA3" strokeWidth="2" fill="none" />
      <circle cx="70" cy="40" r="10" fill="#F1D3C6" />
    </svg>
  );
}
