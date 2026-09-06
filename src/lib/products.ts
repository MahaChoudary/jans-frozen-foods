import { supabase } from "./supabase";
import type { Product } from "@/data/products";

function normalizeProduct(product: any): Product {
  return {
    ...product,

    // Supabase id int8 hai, frontend string use karta hai
    id: String(product.id),

    // Numeric values ko safely number me convert karo
    price: Number(product.price ?? 0),
    rating: Number(product.rating ?? 0),

    // Database me discount null ho sakta hai
    discount:
      product.discount === null ||
      product.discount === undefined
        ? undefined
        : Number(product.discount),

    // Boolean values
    halal: Boolean(product.halal),
    featured: Boolean(product.featured),
    bestseller: Boolean(product.bestseller),
    deal: Boolean(product.deal),
  };
}

/* ======================================================
   GET ALL PRODUCTS
====================================================== */

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

/* ======================================================
   GET SINGLE PRODUCT
====================================================== */

export async function getProductById(
  id: string,
): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Product fetch error:", error);
    return null;
  }

  if (!data) {
    return null;
  }

  return normalizeProduct(data);
}

/* ======================================================
   RELATED PRODUCTS
====================================================== */

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
    console.error(
      "Related products fetch error:",
      error,
    );

    return [];
  }

  return (data ?? []).map(normalizeProduct);
}

/* ======================================================
   FEATURED PRODUCTS
====================================================== */

export async function getFeaturedProducts(): Promise<
  Product[]
> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("featured", true)
    .order("created_at", { ascending: true })
    .limit(6);

  if (error) {
    console.error(
      "Featured products fetch error:",
      error,
    );

    return [];
  }

  return (data ?? []).map(normalizeProduct);
}

/* ======================================================
   BESTSELLERS
====================================================== */

export async function getBestsellers(): Promise<
  Product[]
> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("bestseller", true)
    .order("created_at", { ascending: true })
    .limit(4);

  if (error) {
    console.error(
      "Bestsellers fetch error:",
      error,
    );

    return [];
  }

  return (data ?? []).map(normalizeProduct);
}

/* ======================================================
   DEAL PRODUCTS
====================================================== */

export async function getDeals(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("deal", true)
    .order("created_at", { ascending: true })
    .limit(4);

  if (error) {
    console.error("Deals fetch error:", error);
    return [];
  }

  return (data ?? []).map(normalizeProduct);
}

/* ======================================================
   CREATE PRODUCT
====================================================== */

export async function createProduct(
  productData: Omit<Product, "id">,
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert([
      {
        ...productData,

        discount:
          productData.discount === undefined
            ? null
            : productData.discount,
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return normalizeProduct(data);
}

/* ======================================================
   UPDATE PRODUCT
====================================================== */

export async function updateProduct(
  id: string,
  productData: Partial<Omit<Product, "id">>,
): Promise<Product> {
  const updateData = {
    ...productData,
    ...(productData.discount === undefined
      ? {}
      : {
          discount: productData.discount,
        }),
  };

  const { data, error } = await supabase
    .from("products")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return normalizeProduct(data);
}

/* ======================================================
   DELETE PRODUCT
====================================================== */

export async function deleteProduct(
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}

/* ======================================================
   UPLOAD PRODUCT IMAGE
====================================================== */

export async function uploadProductImage(
  file: File,
): Promise<string> {
  const maxSize = 5 * 1024 * 1024;

  if (file.size > maxSize) {
    throw new Error(
      "Image size must be less than 5MB",
    );
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      "Only JPG, PNG and WebP images are allowed",
    );
  }

  const extension =
    file.name.split(".").pop()?.toLowerCase() ??
    "jpg";

  const filename = `${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from("product-images")
    .upload(filename, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from("product-images")
    .getPublicUrl(filename);

  if (!data.publicUrl) {
    throw new Error(
      "Could not generate product image URL",
    );
  }

  return data.publicUrl;
}

/* ======================================================
   DELETE PRODUCT IMAGE
====================================================== */

export async function deleteProductImage(
  imageUrl: string,
): Promise<void> {
  if (!imageUrl) {
    return;
  }

  try {
    const cleanUrl = imageUrl.split("?")[0];

    const filename = cleanUrl
      .split("/")
      .pop();

    if (!filename) {
      return;
    }

    const { error } = await supabase.storage
      .from("product-images")
      .remove([filename]);

    if (error) {
      console.error(
        "Image deletion error:",
        error,
      );
    }
  } catch (error) {
    console.error(
      "Image deletion error:",
      error,
    );
  }
}