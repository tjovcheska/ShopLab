// Draws an illustration for every seeded product into public/products/.
// The output is committed, so this only needs to run again when products
// are added or renamed in src/lib/seed/data.ts:
//   npx tsx scripts/generate-product-images.ts
//
// Every product has its own drawing below (flat vector style, 400×300).
// A product without a drawing makes the script fail, so new products are
// never shipped with a missing image.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { products } from "../src/lib/seed/data";

const outDir = join(process.cwd(), "public", "products");
mkdirSync(outDir, { recursive: true });

// Light background gradient per category (top, bottom).
const BACKGROUNDS: Record<string, [string, string]> = {
  electronics: ["#eff6ff", "#dbeafe"],
  "home-kitchen": ["#f0fdf4", "#dcfce7"],
  clothing: ["#fdf2f8", "#fce7f3"],
  books: ["#faf5ff", "#f3e8ff"],
  "sports-outdoors": ["#fff7ed", "#ffedd5"],
};

const INK = "#1f2937"; // outlines
const shadow = (rx = 110) =>
  `<ellipse cx="200" cy="262" rx="${rx}" ry="12" fill="#0f172a" opacity="0.10"/>`;

function escapeXml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/'/g, "&apos;")
    .replace(/"/g, "&quot;");
}

// ---------- shared shapes ----------

function tshirt(
  x: number,
  y: number,
  scale: number,
  fill: string,
  stroke = INK,
) {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <path d="M-38 -70 L-80 -50 L-100 -10 L-72 2 L-60 -18 L-60 80 L60 80 L60 -18 L72 2 L100 -10 L80 -50 L38 -70 Q0 -48 -38 -70 Z"
      fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M-38 -70 Q0 -40 38 -70" fill="none" stroke="${stroke}" stroke-width="4"/>
  </g>`;
}

function mug(x: number, y: number, scale: number, fill: string) {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <path d="M40 -20 Q80 -20 80 15 Q80 50 40 50" fill="none" stroke="${INK}" stroke-width="12"/>
    <path d="M40 -20 Q80 -20 80 15 Q80 50 40 50" fill="none" stroke="${fill}" stroke-width="6"/>
    <rect x="-50" y="-50" width="95" height="120" rx="12" fill="${fill}" stroke="${INK}" stroke-width="4"/>
    <ellipse cx="-2" cy="-50" rx="47" ry="8" fill="#78350f" stroke="${INK}" stroke-width="3"/>
    <rect x="-38" y="-30" width="10" height="70" rx="5" fill="#ffffff" opacity="0.35"/>
  </g>`;
}

/** A book seen slightly from the side, with a cover emblem and title. */
function book(
  cover: string,
  emblem: string,
  title: string[],
  options: { small?: boolean; ink?: string } = {},
) {
  const s = options.small ? 0.8 : 1;
  const ink = options.ink ?? "#ffffff";
  const lines = title
    .map(
      (line, i) =>
        `<text x="-4" y="${52 + i * 22}" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="700" fill="${ink}" text-anchor="middle">${escapeXml(line)}</text>`,
    )
    .join("");
  return `<g transform="translate(195 142) scale(${s})">
    <path d="M62 -100 L80 -88 L80 108 L62 100 Z" fill="#f3f4f6" stroke="${INK}" stroke-width="3"/>
    <path d="M67 -95 L67 101 M72 -92 L72 103 M76 -89 L76 105" stroke="#d1d5db" stroke-width="2"/>
    <rect x="-70" y="-100" width="132" height="200" rx="6" fill="${cover}" stroke="${INK}" stroke-width="4"/>
    <rect x="-70" y="-100" width="14" height="200" rx="4" fill="#000000" opacity="0.2"/>
    <g transform="translate(-4 -38)">${emblem}</g>
    ${lines}
  </g>`;
}

// ---------- one drawing per product ----------

const DRAWINGS: Record<string, () => string> = {
  // ---- Electronics ----
  "wireless-headphones": () => `${shadow(100)}
    <path d="M118 180 C110 50 290 50 282 180" fill="none" stroke="${INK}" stroke-width="20" stroke-linecap="round"/>
    <path d="M118 180 C110 50 290 50 282 180" fill="none" stroke="#475569" stroke-width="12" stroke-linecap="round"/>
    <rect x="88" y="150" width="58" height="100" rx="26" fill="#111827"/>
    <rect x="254" y="150" width="58" height="100" rx="26" fill="#111827"/>
    <rect x="128" y="165" width="20" height="70" rx="10" fill="#4b5563"/>
    <rect x="252" y="165" width="20" height="70" rx="10" fill="#4b5563"/>
    <circle cx="112" cy="200" r="9" fill="#2563eb"/>
    <circle cx="288" cy="200" r="9" fill="#2563eb"/>`,

  "mechanical-keyboard": () => {
    let keys = "";
    const accent = new Set(["0,0", "1,11", "2,11"]);
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 12; col++) {
        const fill = accent.has(`${row},${col}`) ? "#3b82f6" : "#e5e7eb";
        keys += `<rect x="${82 + col * 20}" y="${116 + row * 20}" width="16" height="16" rx="3" fill="${fill}"/>`;
      }
    }
    return `${shadow(140)}
      <rect x="68" y="102" width="264" height="134" rx="14" fill="#334155" stroke="${INK}" stroke-width="4"/>
      ${keys}
      <rect x="82" y="196" width="36" height="16" rx="3" fill="#cbd5e1"/>
      <rect x="122" y="196" width="156" height="16" rx="3" fill="#e5e7eb"/>
      <rect x="282" y="196" width="36" height="16" rx="3" fill="#cbd5e1"/>`;
  },

  "usb-c-charger-65w": () => `${shadow(80)}
    <path d="M200 225 C200 262 280 262 300 230 C315 205 330 205 340 215" fill="none" stroke="#9ca3af" stroke-width="8" stroke-linecap="round"/>
    <rect x="334" y="206" width="22" height="16" rx="4" fill="#6b7280"/>
    <rect x="145" y="70" width="110" height="155" rx="22" fill="#f9fafb" stroke="${INK}" stroke-width="4"/>
    <rect x="158" y="82" width="10" height="130" rx="5" fill="#e5e7eb"/>
    <rect x="178" y="98" width="44" height="12" rx="6" fill="${INK}"/>
    <rect x="178" y="122" width="44" height="12" rx="6" fill="${INK}"/>
    <rect x="172" y="146" width="56" height="20" rx="3" fill="${INK}"/>
    <text x="200" y="202" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" fill="#6b7280" text-anchor="middle">65W</text>`,

  "smart-watch": () => `${shadow(70)}
    <rect x="168" y="30" width="64" height="80" rx="10" fill="#1f2937"/>
    <rect x="168" y="190" width="64" height="70" rx="10" fill="#1f2937"/>
    <path d="M174 45 h52 M174 60 h52 M174 225 h52 M174 240 h52" stroke="#374151" stroke-width="3"/>
    <rect x="262" y="135" width="10" height="28" rx="4" fill="#6b7280"/>
    <rect x="140" y="88" width="124" height="124" rx="30" fill="#111827" stroke="#6b7280" stroke-width="5"/>
    <rect x="154" y="102" width="96" height="96" rx="20" fill="#020617"/>
    <circle cx="202" cy="150" r="34" fill="none" stroke="#ef4444" stroke-width="7" stroke-dasharray="160 214" stroke-linecap="round" transform="rotate(-90 202 150)"/>
    <circle cx="202" cy="150" r="24" fill="none" stroke="#22c55e" stroke-width="7" stroke-dasharray="100 151" stroke-linecap="round" transform="rotate(-90 202 150)"/>
    <circle cx="202" cy="150" r="14" fill="none" stroke="#38bdf8" stroke-width="7" stroke-dasharray="70 88" stroke-linecap="round" transform="rotate(-90 202 150)"/>`,

  "portable-speaker": () => {
    let dots = "";
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 11; col++) {
        dots += `<circle cx="${125 + col * 15}" cy="${132 + row * 15}" r="3.5" fill="#1e3a8a"/>`;
      }
    }
    return `${shadow(130)}
      <path d="M110 112 Q120 60 200 60 Q280 60 290 112" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
      <rect x="78" y="100" width="244" height="124" rx="62" fill="#2563eb" stroke="${INK}" stroke-width="4"/>
      <ellipse cx="100" cy="162" rx="14" ry="50" fill="#1e40af"/>
      <ellipse cx="300" cy="162" rx="14" ry="50" fill="#1e40af"/>
      ${dots}
      <rect x="180" y="106" width="40" height="8" rx="4" fill="#93c5fd"/>`;
  },

  "webcam-hd": () => `${shadow(90)}
    <path d="M170 195 L230 195 L250 250 L150 250 Z" fill="#374151" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <rect x="110" y="95" width="180" height="100" rx="50" fill="#1f2937" stroke="${INK}" stroke-width="4"/>
    <circle cx="200" cy="145" r="38" fill="#374151"/>
    <circle cx="200" cy="145" r="28" fill="#0f172a"/>
    <circle cx="200" cy="145" r="16" fill="#1d4ed8"/>
    <circle cx="193" cy="138" r="5" fill="#ffffff" opacity="0.8"/>
    <circle cx="260" cy="125" r="5" fill="#22c55e"/>
    <rect x="132" y="140" width="22" height="10" rx="5" fill="#4b5563"/>`,

  "wireless-mouse": () => `${shadow(70)}
    <path d="M200 45 C255 45 270 110 268 165 C266 225 240 255 200 255 C160 255 134 225 132 165 C130 110 145 45 200 45 Z" fill="#e5e7eb" stroke="${INK}" stroke-width="4"/>
    <path d="M200 45 L200 135 M134 135 Q200 150 266 135" fill="none" stroke="${INK}" stroke-width="3"/>
    <rect x="192" y="70" width="16" height="36" rx="8" fill="#1f2937"/>
    <path d="M150 170 Q152 230 190 245" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round" opacity="0.7"/>
    <rect x="186" y="170" width="28" height="6" rx="3" fill="#22c55e"/>`,

  "4k-monitor": () => `${shadow(110)}
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#38bdf8"/><stop offset="1" stop-color="#bae6fd"/></linearGradient></defs>
    <rect x="182" y="200" width="36" height="45" fill="#6b7280"/>
    <ellipse cx="200" cy="250" rx="70" ry="10" fill="#4b5563"/>
    <rect x="60" y="45" width="280" height="165" rx="10" fill="#111827" stroke="${INK}" stroke-width="4"/>
    <rect x="72" y="57" width="256" height="141" rx="3" fill="url(#sky)"/>
    <polygon points="72,198 140,120 190,170 240,100 328,198" fill="#16a34a"/>
    <polygon points="140,120 155,137 125,137" fill="#ffffff"/>
    <polygon points="240,100 258,121 222,121" fill="#ffffff"/>
    <circle cx="290" cy="88" r="14" fill="#fde047"/>
    <text x="84" y="74" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="700" fill="#ffffff">4K</text>`,

  // ---- Home & Kitchen ----
  "coffee-grinder": () => `${shadow(80)}
    <path d="M150 50 L250 50 L232 125 L168 125 Z" fill="#ecfdf5" stroke="${INK}" stroke-width="4"/>
    <ellipse cx="185" cy="108" rx="9" ry="6" fill="#78350f"/><ellipse cx="205" cy="114" rx="9" ry="6" fill="#92400e"/>
    <ellipse cx="220" cy="102" rx="9" ry="6" fill="#78350f"/><ellipse cx="196" cy="94" rx="9" ry="6" fill="#92400e"/>
    <ellipse cx="212" cy="88" rx="9" ry="6" fill="#78350f"/>
    <rect x="140" y="40" width="120" height="14" rx="6" fill="#374151"/>
    <rect x="148" y="125" width="104" height="125" rx="12" fill="#374151" stroke="${INK}" stroke-width="4"/>
    <circle cx="200" cy="160" r="18" fill="#9ca3af" stroke="${INK}" stroke-width="3"/>
    <path d="M200 146 L200 160" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
    <rect x="166" y="195" width="68" height="44" rx="6" fill="#4b5563"/>
    <rect x="172" y="215" width="56" height="20" rx="4" fill="#78350f"/>`,

  "french-press": () => `${shadow(80)}
    <rect x="196" y="28" width="8" height="60" fill="#9ca3af"/>
    <circle cx="200" cy="26" r="12" fill="#111827"/>
    <path d="M255 115 Q300 115 300 165 Q300 215 255 215" fill="none" stroke="#111827" stroke-width="14" stroke-linecap="round"/>
    <rect x="145" y="82" width="110" height="20" rx="6" fill="#9ca3af" stroke="${INK}" stroke-width="3"/>
    <rect x="150" y="100" width="100" height="145" rx="8" fill="#e0f2fe" stroke="${INK}" stroke-width="4"/>
    <rect x="153" y="150" width="94" height="92" rx="6" fill="#78350f"/>
    <rect x="153" y="138" width="94" height="14" fill="#a16207" opacity="0.8"/>
    <path d="M150 120 H250 M150 225 H250" stroke="#9ca3af" stroke-width="6"/>
    <rect x="160" y="106" width="10" height="130" rx="5" fill="#ffffff" opacity="0.5"/>
    <rect x="140" y="244" width="120" height="10" rx="4" fill="#9ca3af"/>`,

  "chefs-knife": () => `${shadow(150)}
    <g transform="rotate(-14 200 160)">
      <path d="M50 168 L250 138 L250 184 Q150 202 50 168 Z" fill="#e5e7eb" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M75 168 L245 148" stroke="#ffffff" stroke-width="5" opacity="0.8"/>
      <rect x="248" y="134" width="14" height="54" rx="3" fill="#9ca3af" stroke="${INK}" stroke-width="3"/>
      <rect x="262" y="142" width="96" height="38" rx="12" fill="#1f2937" stroke="${INK}" stroke-width="3"/>
      <circle cx="285" cy="161" r="5" fill="#d1d5db"/><circle cx="310" cy="161" r="5" fill="#d1d5db"/><circle cx="335" cy="161" r="5" fill="#d1d5db"/>
    </g>`,

  "cast-iron-skillet": () => `${shadow(140)}
    <rect x="245" y="138" width="120" height="26" rx="12" fill="#1f2937" stroke="${INK}" stroke-width="3"/>
    <circle cx="345" cy="151" r="7" fill="#dcfce7"/>
    <circle cx="170" cy="150" r="92" fill="#111827" stroke="${INK}" stroke-width="4"/>
    <circle cx="170" cy="150" r="74" fill="#374151"/>
    <circle cx="170" cy="150" r="74" fill="none" stroke="#4b5563" stroke-width="6"/>
    <path d="M115 115 Q140 90 175 92" fill="none" stroke="#6b7280" stroke-width="6" stroke-linecap="round"/>
    <ellipse cx="150" cy="160" rx="26" ry="22" fill="#ffffff"/>
    <circle cx="154" cy="162" r="10" fill="#facc15"/>`,

  "electric-kettle": () => `${shadow(90)}
    <path d="M258 100 Q312 100 306 160 Q300 212 262 218" fill="none" stroke="#1f2937" stroke-width="16" stroke-linecap="round"/>
    <path d="M142 112 L108 86 L118 78 L156 100 Z" fill="#d1d5db" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M150 80 L250 80 L268 225 L132 225 Z" fill="#d1d5db" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <rect x="182" y="66" width="36" height="16" rx="6" fill="#1f2937"/>
    <rect x="218" y="110" width="14" height="90" rx="7" fill="#38bdf8" stroke="${INK}" stroke-width="2"/>
    <rect x="160" y="92" width="10" height="120" rx="5" fill="#ffffff" opacity="0.6"/>
    <rect x="120" y="225" width="160" height="22" rx="8" fill="#1f2937"/>
    <circle cx="245" cy="236" r="4" fill="#22c55e"/>`,

  "cutting-board": () => `${shadow(140)}
    <rect x="70" y="70" width="260" height="170" rx="22" fill="#d6a75c" stroke="${INK}" stroke-width="4"/>
    <path d="M110 72 V238 M150 72 V238 M190 72 V238 M230 72 V238 M270 72 V238 M310 72 V238" stroke="#c3914a" stroke-width="4"/>
    <rect x="88" y="88" width="224" height="134" rx="14" fill="none" stroke="#a0722f" stroke-width="4"/>
    <circle cx="298" cy="104" r="9" fill="#dcfce7" stroke="#a0722f" stroke-width="3"/>
    <path d="M140 170 Q160 140 190 150 Q215 160 205 185 Q190 205 160 195 Q135 188 140 170 Z" fill="#ef4444" stroke="${INK}" stroke-width="3"/>
    <path d="M175 148 Q178 135 188 132" fill="none" stroke="#16a34a" stroke-width="4" stroke-linecap="round"/>`,

  "ceramic-mug": () => `${shadow(80)}
    <path d="M165 78 q-8 -10 0 -20 q8 -10 0 -20 M190 78 q-8 -10 0 -20 q8 -10 0 -20 M215 78 q-8 -10 0 -20 q8 -10 0 -20" fill="none" stroke="#94a3b8" stroke-width="5" stroke-linecap="round"/>
    ${mug(185, 165, 1.15, "#14b8a6")}`,

  "ceramic-mug-set": () => `${shadow(150)}
    ${mug(110, 125, 0.62, "#f97316")}${mug(220, 125, 0.62, "#14b8a6")}${mug(155, 205, 0.62, "#8b5cf6")}${mug(265, 205, 0.62, "#facc15")}`,

  // ---- Clothing ----
  "classic-t-shirt": () => `${shadow(100)}${tshirt(200, 160, 1.05, "#f9fafb")}`,

  "classic-t-shirt-pack-of-3": () => `${shadow(150)}
    ${tshirt(130, 145, 0.75, "#111827", "#000000")}${tshirt(270, 145, 0.75, "#9ca3af")}${tshirt(200, 170, 0.75, "#f9fafb")}`,

  "denim-jacket": () => `${shadow(120)}
    <path d="M150 50 L100 70 L70 200 L105 210 L120 120 L120 250 L280 250 L280 120 L295 210 L330 200 L300 70 L250 50 L200 95 Z"
      fill="#3b6db3" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M150 50 L175 110 L200 95 L225 110 L250 50" fill="#2c5591" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M200 95 V250" stroke="${INK}" stroke-width="3"/>
    <circle cx="210" cy="140" r="4" fill="#e5e7eb"/><circle cx="210" cy="175" r="4" fill="#e5e7eb"/><circle cx="210" cy="210" r="4" fill="#e5e7eb"/>
    <rect x="135" y="140" width="45" height="38" rx="4" fill="none" stroke="#bfdbfe" stroke-width="2.5" stroke-dasharray="5 4"/>
    <rect x="222" y="140" width="45" height="38" rx="4" fill="none" stroke="#bfdbfe" stroke-width="2.5" stroke-dasharray="5 4"/>
    <path d="M120 230 H280" stroke="#bfdbfe" stroke-width="2.5" stroke-dasharray="5 4"/>`,

  "running-shoes": () => `${shadow(150)}
    <path d="M60 205 Q58 175 85 170 L170 150 Q195 110 230 112 L250 140 Q300 150 335 175 Q350 190 345 210 Z"
      fill="#db2777" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M55 205 L345 210 Q350 232 330 236 L80 236 Q55 232 55 205 Z" fill="#f9fafb" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M80 225 H330" stroke="#d1d5db" stroke-width="3"/>
    <path d="M110 190 Q200 160 300 195" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>
    <path d="M195 128 L215 150 M210 122 L230 146 M225 118 L243 140" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>`,

  "wool-beanie": () => `${shadow(110)}
    <circle cx="200" cy="54" r="24" fill="#e5e7eb" stroke="${INK}" stroke-width="4"/>
    <path d="M110 190 Q105 72 200 72 Q295 72 290 190 Z" fill="#dc2626" stroke="${INK}" stroke-width="4"/>
    <path d="M140 110 V185 M170 86 V185 M200 76 V185 M230 86 V185 M260 110 V185" stroke="#b91c1c" stroke-width="5"/>
    <rect x="95" y="180" width="210" height="58" rx="14" fill="#b91c1c" stroke="${INK}" stroke-width="4"/>
    <path d="M115 185 V233 M135 185 V233 M155 185 V233 M175 185 V233 M195 185 V233 M215 185 V233 M235 185 V233 M255 185 V233 M275 185 V233" stroke="#991b1b" stroke-width="4"/>`,

  "rain-jacket": () => `${shadow(120)}
    <path d="M155 75 Q160 30 200 30 Q240 30 245 75 L300 95 L330 210 L298 220 L280 140 L280 250 L120 250 L120 140 L102 220 L70 210 L100 95 Z"
      fill="#facc15" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M168 78 Q172 48 200 48 Q228 48 232 78 Q200 90 168 78 Z" fill="#a16207" opacity="0.5"/>
    <path d="M200 90 V250" stroke="${INK}" stroke-width="4"/>
    <path d="M196 100 h8 M196 125 h8 M196 150 h8 M196 175 h8 M196 200 h8 M196 225 h8" stroke="#6b7280" stroke-width="3"/>
    <path d="M140 170 h40 M220 170 h40" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
    <path d="M185 78 L180 110 M215 78 L220 110" stroke="${INK}" stroke-width="2.5"/>`,

  "leather-belt": () => `${shadow(150)}
    <path d="M110 150 C110 90 150 80 200 80 C250 80 290 90 290 150 C290 210 250 220 200 220" fill="none" stroke="${INK}" stroke-width="40" stroke-linecap="round"/>
    <path d="M110 150 C110 90 150 80 200 80 C250 80 290 90 290 150 C290 210 250 220 200 220" fill="none" stroke="#92400e" stroke-width="32" stroke-linecap="round"/>
    <path d="M200 220 L330 220" stroke="${INK}" stroke-width="40" stroke-linecap="round"/>
    <path d="M200 220 L330 220" stroke="#92400e" stroke-width="32" stroke-linecap="round"/>
    <circle cx="265" cy="220" r="4" fill="#451a03"/><circle cx="285" cy="220" r="4" fill="#451a03"/><circle cx="305" cy="220" r="4" fill="#451a03"/>
    <path d="M110 150 C110 210 150 220 175 220" fill="none" stroke="${INK}" stroke-width="40"/>
    <path d="M110 150 C110 210 150 220 175 220" fill="none" stroke="#92400e" stroke-width="32"/>
    <rect x="160" y="192" width="44" height="56" rx="8" fill="none" stroke="#d1d5db" stroke-width="9"/>
    <rect x="160" y="192" width="44" height="56" rx="8" fill="none" stroke="${INK}" stroke-width="2"/>
    <path d="M182 196 V222" stroke="#d1d5db" stroke-width="6" stroke-linecap="round"/>`,

  hoodie: () => `${shadow(120)}
    <path d="M150 85 Q145 35 200 35 Q255 35 250 85 L300 100 L330 220 L298 230 L280 150 L280 255 L120 255 L120 150 L102 230 L70 220 L100 100 Z"
      fill="#6b7280" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M165 88 Q168 55 200 55 Q232 55 235 88 Q200 105 165 88 Z" fill="#374151"/>
    <path d="M188 100 L185 150 M212 100 L215 150" stroke="#f9fafb" stroke-width="4" stroke-linecap="round"/>
    <path d="M150 195 H250 L260 240 H140 Z" fill="#4b5563" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M122 246 H278" stroke="#4b5563" stroke-width="8"/>`,

  // ---- Books ----
  "learning-typescript": () =>
    `${shadow(90)}${book(
      "#2563eb",
      `<rect x="-30" y="-30" width="60" height="60" rx="8" fill="#ffffff"/><text x="0" y="12" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="800" fill="#2563eb" text-anchor="middle">TS</text>`,
      ["Learning", "TypeScript"],
    )}`,

  "the-testing-mindset": () =>
    `${shadow(90)}${book(
      "#0f766e",
      `<circle cx="-6" cy="-6" r="22" fill="none" stroke="#ffffff" stroke-width="8"/><path d="M10 10 L30 30" stroke="#ffffff" stroke-width="10" stroke-linecap="round"/><path d="M-16 -6 L-8 2 L6 -14" fill="none" stroke="#5eead4" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`,
      ["The Testing", "Mindset"],
    )}`,

  "web-accessibility-handbook": () =>
    `${shadow(90)}${book(
      "#7c3aed",
      `<circle cx="0" cy="0" r="32" fill="#ffffff"/><circle cx="0" cy="-17" r="6" fill="#7c3aed"/><path d="M-18 -5 H18 M0 -5 V10 M0 10 L-10 24 M0 10 L10 24" stroke="#7c3aed" stroke-width="5" stroke-linecap="round"/>`,
      ["Web Access-", "ibility"],
    )}`,

  "clean-code-patterns": () =>
    `${shadow(90)}${book(
      "#111827",
      `<text x="0" y="14" font-family="Courier New, monospace" font-size="44" font-weight="700" fill="#22c55e" text-anchor="middle">{ }</text>`,
      ["Clean Code", "Patterns"],
    )}`,

  "mystery-at-midnight": () =>
    `${shadow(90)}${book(
      "#1e1b4b",
      `<path d="M10 -28 A28 28 0 1 0 26 14 A22 22 0 1 1 10 -28 Z" fill="#fde047"/><circle cx="-30" cy="-24" r="2.5" fill="#ffffff"/><circle cx="32" cy="-26" r="2" fill="#ffffff"/><circle cx="-34" cy="14" r="2" fill="#ffffff"/>`,
      ["Mystery at", "Midnight"],
    )}`,

  "cooking-for-beginners": () =>
    `${shadow(90)}${book(
      "#f97316",
      `<path d="M-30 -2 H30 V20 Q30 30 20 30 H-20 Q-30 30 -30 20 Z" fill="#ffffff"/><path d="M-36 -2 H36" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/><path d="M-12 -12 Q-6 -22 -12 -32 M6 -12 Q12 -22 6 -32" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>`,
      ["Cooking for", "Beginners"],
    )}`,

  "space-a-visual-guide": () =>
    `${shadow(90)}${book(
      "#0f172a",
      `<circle cx="0" cy="0" r="22" fill="#f59e0b"/><ellipse cx="0" cy="0" rx="40" ry="11" fill="none" stroke="#fde68a" stroke-width="4" transform="rotate(-18)"/><circle cx="-34" cy="-30" r="2" fill="#ffffff"/><circle cx="34" cy="26" r="2.5" fill="#ffffff"/>`,
      ["Space: A", "Visual Guide"],
    )}`,

  "pocket-dictionary": () =>
    `${shadow(70)}${book(
      "#b91c1c",
      `<text x="0" y="12" font-family="Georgia, serif" font-size="34" font-weight="700" fill="#fde68a" text-anchor="middle">A–Z</text>`,
      ["Pocket", "Dictionary"],
      { small: true, ink: "#fde68a" },
    )}`,

  // ---- Sports & Outdoors ----
  "yoga-mat": () => `${shadow(130)}
    <rect x="120" y="110" width="200" height="100" rx="10" fill="#8b5cf6" stroke="${INK}" stroke-width="4"/>
    <path d="M150 112 V208 M180 112 V208 M210 112 V208 M240 112 V208 M270 112 V208 M300 112 V208" stroke="#7c3aed" stroke-width="3"/>
    <path d="M140 108 V212 M300 108 V212" stroke="#111827" stroke-width="6"/>
    <ellipse cx="120" cy="160" rx="36" ry="50" fill="#a78bfa" stroke="${INK}" stroke-width="4"/>
    <path d="M120 160 m0 -38 a26 38 0 1 0 0.1 0 M120 160 m0 -24 a16 24 0 1 0 0.1 0 M120 160 m0 -10 a7 10 0 1 0 0.1 0" fill="none" stroke="#7c3aed" stroke-width="3"/>`,

  "water-bottle": () => `${shadow(60)}
    <rect x="180" y="28" width="40" height="18" rx="6" fill="#111827"/>
    <path d="M208 30 Q236 22 232 48" fill="none" stroke="#111827" stroke-width="7" stroke-linecap="round"/>
    <rect x="175" y="44" width="50" height="26" rx="8" fill="#374151" stroke="${INK}" stroke-width="3"/>
    <path d="M168 75 Q168 68 176 68 L224 68 Q232 68 232 75 L240 105 L240 245 Q240 258 227 258 L173 258 Q160 258 160 245 L160 105 Z"
      fill="#ea580c" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <rect x="162" y="150" width="76" height="36" fill="#fdba74"/>
    <rect x="172" y="90" width="10" height="150" rx="5" fill="#ffffff" opacity="0.35"/>`,

  "camping-tent": () => `${shadow(150)}
    <path d="M45 245 L200 60 L355 245 Z" fill="#ea580c" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M200 60 L270 245 L355 245 Z" fill="#c2410c"/>
    <path d="M200 60 L150 245 L250 245 Z" fill="#7c2d12" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M200 60 L178 245" stroke="#fed7aa" stroke-width="3"/>
    <path d="M200 60 L200 40" stroke="${INK}" stroke-width="4"/>
    <path d="M30 245 H370" stroke="#65a30d" stroke-width="6" stroke-linecap="round"/>`,

  "hiking-backpack": () => `${shadow(90)}
    <path d="M140 110 Q118 115 123 170" fill="none" stroke="#14532d" stroke-width="10" stroke-linecap="round"/>
    <path d="M260 110 Q282 115 277 170" fill="none" stroke="#14532d" stroke-width="10" stroke-linecap="round"/>
    <rect x="130" y="60" width="140" height="190" rx="36" fill="#16a34a" stroke="${INK}" stroke-width="4"/>
    <path d="M130 105 Q200 80 270 105 L270 120 Q200 100 130 120 Z" fill="#15803d" stroke="${INK}" stroke-width="3"/>
    <rect x="155" y="160" width="90" height="70" rx="16" fill="#15803d" stroke="${INK}" stroke-width="3"/>
    <path d="M155 182 H245" stroke="${INK}" stroke-width="3"/>
    <rect x="193" y="150" width="14" height="22" rx="3" fill="#facc15"/>
    <circle cx="200" cy="72" r="8" fill="none" stroke="#9ca3af" stroke-width="4"/>`,

  "resistance-bands": () => `${shadow(130)}
    <ellipse cx="160" cy="155" rx="95" ry="60" fill="none" stroke="#ef4444" stroke-width="14"/>
    <ellipse cx="235" cy="145" rx="95" ry="60" fill="none" stroke="#facc15" stroke-width="14"/>
    <ellipse cx="200" cy="180" rx="95" ry="52" fill="none" stroke="#22c55e" stroke-width="14"/>
    <ellipse cx="195" cy="120" rx="80" ry="45" fill="none" stroke="#3b82f6" stroke-width="14"/>`,

  "tennis-racket": () => {
    let strings = "";
    for (let i = -60; i <= 60; i += 15) {
      strings += `<path d="M${200 + i} 20 V200" stroke="#e5e7eb" stroke-width="2"/><path d="M110 ${110 + i} H290" stroke="#e5e7eb" stroke-width="2"/>`;
    }
    return `${shadow(110)}
      <defs><clipPath id="head"><ellipse cx="200" cy="110" rx="66" ry="80"/></clipPath></defs>
      <g transform="translate(-20 10) rotate(-25 200 150) scale(0.9)">
        <rect x="190" y="185" width="20" height="45" fill="#374151"/>
        <rect x="186" y="225" width="28" height="70" rx="8" fill="#111827" stroke="${INK}" stroke-width="3"/>
        <ellipse cx="200" cy="110" rx="66" ry="80" fill="#fff7ed" opacity="0.6"/>
        <g clip-path="url(#head)">${strings}</g>
        <ellipse cx="200" cy="110" rx="66" ry="80" fill="none" stroke="#ea580c" stroke-width="12"/>
      </g>
      <circle cx="300" cy="215" r="26" fill="#bef264" stroke="${INK}" stroke-width="3"/>
      <path d="M278 200 Q300 215 280 232 M322 200 Q300 215 320 232" fill="none" stroke="#ffffff" stroke-width="3"/>`;
  },

  "bike-helmet": () => `${shadow(140)}
    <path d="M70 200 Q75 70 210 65 Q330 65 335 185 L300 200 Z" fill="#ea580c" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M110 140 Q150 95 195 92 L190 130 Q150 135 125 150 Z" fill="#1f2937"/>
    <path d="M215 92 Q265 95 295 130 L280 150 Q250 128 215 128 Z" fill="#1f2937"/>
    <path d="M170 150 Q200 140 235 150 L230 175 Q200 168 175 175 Z" fill="#1f2937"/>
    <path d="M60 200 L310 200 L300 215 L75 215 Z" fill="#111827"/>
    <path d="M120 215 Q140 260 180 245 M270 215 Q260 255 225 248" fill="none" stroke="${INK}" stroke-width="4"/>
    <circle cx="320" cy="172" r="7" fill="#ef4444"/>`,

  "jump-rope": () => `${shadow(140)}
    <path d="M110 115 C70 280 330 280 290 115" fill="none" stroke="#2563eb" stroke-width="7" stroke-linecap="round"/>
    <g transform="rotate(-12 110 85)">
      <rect x="96" y="50" width="28" height="70" rx="12" fill="#ea580c" stroke="${INK}" stroke-width="4"/>
      <path d="M100 70 h20 M100 90 h20" stroke="#9a3412" stroke-width="3"/>
    </g>
    <g transform="rotate(12 290 85)">
      <rect x="276" y="50" width="28" height="70" rx="12" fill="#ea580c" stroke="${INK}" stroke-width="4"/>
      <path d="M280 70 h20 M280 90 h20" stroke="#9a3412" stroke-width="3"/>
    </g>`,
};

const missing = products.filter((p) => !DRAWINGS[p.slug]);
if (missing.length > 0) {
  throw new Error(
    `No drawing for: ${missing.map((p) => p.slug).join(", ")}. Add one to DRAWINGS.`,
  );
}

for (const product of products) {
  const [top, bottom] = BACKGROUNDS[product.category];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300" role="img" aria-label="${escapeXml(product.name)}">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs>
  <rect width="400" height="300" fill="url(#bg)"/>
  ${DRAWINGS[product.slug]()}
</svg>
`;
  writeFileSync(join(outDir, `${product.slug}.svg`), svg);
}

console.log(`Wrote ${products.length} images to ${outDir}`);
