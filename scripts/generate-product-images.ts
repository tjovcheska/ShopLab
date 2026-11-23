// Generates simple placeholder SVG images into public/products/.
// The output is committed, so this only needs to run again when products
// are added or renamed in prisma/seed-data.ts:
//   npx tsx scripts/generate-product-images.ts
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { categories, products } from "../prisma/seed-data";

const outDir = join(process.cwd(), "public", "products");
mkdirSync(outDir, { recursive: true });

function escapeXml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/'/g, "&apos;")
    .replace(/"/g, "&quot;");
}

for (const product of products) {
  const category = categories.find((c) => c.slug === product.category)!;
  const initials = product.name
    .split(/\s+/)
    .filter((word) => /^[A-Za-z0-9]/.test(word))
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300" role="img" aria-label="${escapeXml(product.name)}">
  <rect width="400" height="300" fill="${category.color}" opacity="0.15"/>
  <circle cx="200" cy="125" r="62" fill="${category.color}"/>
  <text x="200" y="146" font-family="Arial, Helvetica, sans-serif" font-size="56" font-weight="700" fill="#ffffff" text-anchor="middle">${escapeXml(initials)}</text>
  <text x="200" y="245" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#1f2937" text-anchor="middle">${escapeXml(product.name)}</text>
</svg>
`;
  writeFileSync(join(outDir, `${product.slug}.svg`), svg);
}

console.log(`Wrote ${products.length} images to ${outDir}`);
