import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { readFileSync } from "node:fs";
import { config } from "dotenv";
config({ path: "/Users/dhritigupta/foodpharmer-approved/.env.local" });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const cache = "/Users/dhritigupta/.claude/image-cache/b4fc46a2-fd0c-41c3-a6d1-683a33d65607";

// 1) Promote all paneer products to lab_tested
{
  const { data: cat } = await sb.from("categories").select("id").eq("slug", "paneer").single();
  const { data, error } = await sb
    .from("products")
    .update({ certification_method: "lab_tested" })
    .eq("category_id", cat.id)
    .select("slug, certification_method, lab_report_url");
  if (error) { console.error("paneer cert update:", error); process.exit(1); }
  console.log("paneer cert updates:");
  for (const p of data) console.log(`  ${p.slug}: cert=${p.certification_method}  lab_report=${p.lab_report_url ? "YES" : "no"}`);
}

// 2) Insert new Nut Roasters HP PB product
{
  const { data: brand } = await sb.from("brands").select("id").eq("slug", "nut-roasters").single();
  const { data: cat } = await sb.from("categories").select("id").eq("slug", "peanut-butter").single();

  const slug = "nut-roasters-hp-whey-pb";

  // Cover
  const coverJpg = await sharp(readFileSync(`${cache}/28.png`))
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer();
  await sb.storage.from("products").upload(`${slug}.jpg`, coverJpg, { contentType: "image/jpeg", upsert: true });

  // Label
  const labelJpg = await sharp(readFileSync(`${cache}/29.png`))
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer();
  await sb.storage.from("labels").upload(`${slug}.jpg`, labelJpg, { contentType: "image/jpeg", upsert: true });

  const productUrl = sb.storage.from("products").getPublicUrl(`${slug}.jpg`).data.publicUrl;
  const labelUrl = sb.storage.from("labels").getPublicUrl(`${slug}.jpg`).data.publicUrl;

  const row = {
    slug,
    name: "Zero Sugar High Protein Peanut Butter with Whey",
    brand_id: brand.id,
    category_id: cat.id,
    status: "Live",
    certification_method: "label_tested",
    rating: "A+",
    verdict: "Approved",
    variant_size: "Crunchy · Unsweetened · 38g protein",
    ingredients_raw: "Peanuts, Whey Protein Isolate",
    product_photo_url: productUrl,
    label_image_url: labelUrl,
    last_verified_at: new Date().toISOString(),
  };

  const { data, error } = await sb
    .from("products")
    .upsert(row, { onConflict: "slug" })
    .select("slug, name, status")
    .single();
  if (error) { console.error("nut roasters insert:", error); process.exit(1); }
  console.log("\nnut roasters product:", data);
  console.log(`  cover ${coverJpg.length}B  label ${labelJpg.length}B`);
}
