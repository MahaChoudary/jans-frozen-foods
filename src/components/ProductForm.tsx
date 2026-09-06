import { useState } from "react";
import { toast } from "sonner";

import type { Product } from "@/data/products";
import { categories } from "@/data/products";

interface ProductFormProps {
  initialData?: Product;

  onSubmit: (
    data: Omit<Product, "id">,
    imageFile: File | null,
  ) => Promise<void>;

  loading?: boolean;
}

export function ProductForm({
  initialData,
  onSubmit,
  loading = false,
}: ProductFormProps) {
  const [name, setName] = useState(
    initialData?.name ?? "",
  );

  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );

  const [price, setPrice] = useState(
    initialData?.price?.toString() ?? "",
  );

  const [discount, setDiscount] = useState(
    initialData?.discount?.toString() ?? "",
  );

  const [category, setCategory] = useState(
    initialData?.category ?? "",
  );

  const [weight, setWeight] = useState(
    initialData?.weight ?? "",
  );

  const [image, setImage] = useState(
    initialData?.image ?? "",
  );

  const [rating, setRating] = useState(
    initialData?.rating?.toString() ?? "4.5",
  );

  const [freshness, setFreshness] = useState(
    initialData?.freshness ?? "Flash Frozen",
  );

  const [halal, setHalal] = useState(
    initialData?.halal ?? true,
  );

  const [featured, setFeatured] = useState(
    initialData?.featured ?? false,
  );

  const [bestseller, setBestseller] = useState(
    initialData?.bestseller ?? false,
  );

  const [deal, setDeal] = useState(
    initialData?.deal ?? false,
  );

  const [imageFile, setImageFile] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState<string>("");

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Only JPG, PNG and WebP images are allowed",
      );

      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        "Image must be less than 5MB",
      );

      e.target.value = "";
      return;
    }

    setImageFile(file);

    const reader = new FileReader();

    reader.onload = (event) => {
      const result = event.target?.result;

      if (typeof result === "string") {
        setImagePreview(result);
      }
    };

    reader.readAsDataURL(file);
  };

  const removeSelectedImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const handleSubmit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    const cleanName = name.trim();
    const cleanDescription = description.trim();
    const cleanCategory = category.trim();
    const cleanWeight = weight.trim();
    const cleanFreshness = freshness.trim();
    const cleanImage = image.trim();

    if (
      !cleanName ||
      !cleanDescription ||
      !price ||
      !cleanCategory ||
      !cleanWeight ||
      !cleanFreshness
    ) {
      toast.error(
        "Please fill in all required fields",
      );
      return;
    }

    const parsedPrice = Number(price);
    const parsedRating = Number(rating);

    const parsedDiscount =
      discount.trim() === ""
        ? undefined
        : Number(discount);

    if (
      !Number.isFinite(parsedPrice) ||
      parsedPrice <= 0
    ) {
      toast.error(
        "Price must be greater than 0",
      );
      return;
    }

    if (
      !Number.isFinite(parsedRating) ||
      parsedRating < 0 ||
      parsedRating > 5
    ) {
      toast.error(
        "Rating must be between 0 and 5",
      );
      return;
    }

    if (
      parsedDiscount !== undefined &&
      (
        !Number.isFinite(parsedDiscount) ||
        parsedDiscount < 0 ||
        parsedDiscount > 100
      )
    ) {
      toast.error(
        "Discount must be between 0 and 100",
      );
      return;
    }

    try {
      await onSubmit(
        {
          name: cleanName,
          description: cleanDescription,
          price: parsedPrice,
          discount: parsedDiscount,
          category: cleanCategory,
          weight: cleanWeight,
          image: cleanImage,
          rating: parsedRating,
          freshness: cleanFreshness,
          halal,
          featured,
          bestseller,
          deal,
        },
        imageFile,
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div>
        <h3 className="mb-4 text-lg font-semibold">
          Product Details
        </h3>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Name *
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 outline-none focus:border-primary"
              placeholder="Product name"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Description *
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              rows={3}
              required
              className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 outline-none focus:border-primary"
              placeholder="Product description"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Price (PKR) *
              </label>

              <input
                type="number"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value)
                }
                min="0.01"
                step="0.01"
                required
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 outline-none focus:border-primary"
                placeholder="850"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Discount (%)
              </label>

              <input
                type="number"
                value={discount}
                onChange={(e) =>
                  setDiscount(e.target.value)
                }
                min="0"
                max="100"
                step="0.01"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 outline-none focus:border-primary"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">
          Category & Details
        </h3>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Category *
            </label>

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              required
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 outline-none focus:border-primary"
            >
              <option value="">
                Select a category
              </option>

              {categories.map((cat) => (
                <option
                  key={cat.slug}
                  value={cat.slug}
                >
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Weight *
              </label>

              <input
                type="text"
                value={weight}
                onChange={(e) =>
                  setWeight(e.target.value)
                }
                required
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 outline-none focus:border-primary"
                placeholder="500g"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Freshness *
              </label>

              <input
                type="text"
                value={freshness}
                onChange={(e) =>
                  setFreshness(e.target.value)
                }
                required
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 outline-none focus:border-primary"
                placeholder="Flash Frozen"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Rating (0 - 5) *
            </label>

            <input
              type="number"
              value={rating}
              onChange={(e) =>
                setRating(e.target.value)
              }
              min="0"
              max="5"
              step="0.1"
              required
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">
          Product Image
        </h3>

        <div className="space-y-4">
          {(imagePreview || image) && (
            <div className="overflow-hidden rounded-xl border border-border bg-muted">
              <img
                src={imagePreview || image}
                alt="Product preview"
                className="aspect-video w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display =
                    "none";
                }}
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Upload Image
            </label>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5"
            />

            <p className="mt-2 text-xs text-muted-foreground">
              JPG, PNG or WebP. Maximum 5MB.
            </p>

            {imageFile && (
              <div className="mt-2 flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm">
                <span className="truncate">
                  {imageFile.name}
                </span>

                <button
                  type="button"
                  onClick={removeSelectedImage}
                  className="ml-3 text-red-500"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Or use Image URL
            </label>

            <input
              type="url"
              value={image}
              onChange={(e) =>
                setImage(e.target.value)
              }
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 outline-none focus:border-primary"
              placeholder="https://..."
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">
          Product Options
        </h3>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3">
            <input
              type="checkbox"
              checked={halal}
              onChange={(e) =>
                setHalal(e.target.checked)
              }
              className="h-5 w-5"
            />

            <span className="text-sm">
              Halal Certified
            </span>
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) =>
                setFeatured(e.target.checked)
              }
              className="h-5 w-5"
            />

            <span className="text-sm">
              Featured
            </span>
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3">
            <input
              type="checkbox"
              checked={bestseller}
              onChange={(e) =>
                setBestseller(e.target.checked)
              }
              className="h-5 w-5"
            />

            <span className="text-sm">
              Bestseller
            </span>
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3">
            <input
              type="checkbox"
              checked={deal}
              onChange={(e) =>
                setDeal(e.target.checked)
              }
              className="h-5 w-5"
            />

            <span className="text-sm">
              Deal / Special Offer
            </span>
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Saving..."
          : initialData
            ? "Update Product"
            : "Add Product"}
      </button>
    </form>
  );
}
