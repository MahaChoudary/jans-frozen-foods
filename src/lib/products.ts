import { supabase } from "./supabase";
import type { Product } from "@/data/products";

function normalizeProduct(product: any): Product {
  return {
    ...product,
    id: String(product.id),
  };
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(normalizeProduct);
}

export async function getProductById(
  id: string,
): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Product fetch error:", error);
    return null;
  }

  return normalizeProduct(data);
}

export async function getRelatedProducts(
  category: string,
  currentProductId: string,
): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", category)
    .neq("id", currentProductId)
    .limit(4);

  if (error) {
    console.error("Related products fetch error:", error);
    return [];
  }

  return (data ?? []).map(normalizeProduct);
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}