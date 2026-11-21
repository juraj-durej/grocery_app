export type Category = {
  id: number;
  slug: string;
  name: string;
  iconUrl: string;
  color: string;
};

export type ProductSummary = {
  id: number;
  slug: string;
  name: string;
  priceCents: number;
  unit: string;
  imageUrl: string | null;
  color: string;
  isNew: boolean;
  discountPercent: number | null;
  categorySlug: string;
  categoryIconUrl: string;
};

export type CartLine = { product: ProductSummary; quantity: number };
