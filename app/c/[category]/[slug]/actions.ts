"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitProductFeedback(
  productId: number,
  helpful: boolean,
  pathname: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!Number.isFinite(productId) || productId <= 0) {
    return { ok: false, error: "bad_product_id" };
  }
  const sb = await createClient();
  const { error } = await sb.from("product_feedback").insert({
    product_id: productId,
    helpful,
  });
  if (error) {
    return { ok: false, error: error.message };
  }
  revalidatePath(pathname);
  return { ok: true };
}
