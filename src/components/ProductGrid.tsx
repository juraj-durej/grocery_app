import { ProductCard } from '@/components/ProductCard';
import type { ProductSummary } from '@/types/Shop';

export const ProductGrid = (props: {
  products: ProductSummary[];
  quantities: Record<number, number>;
  favoriteIds: number[];
}) => (
  <ul className="grid grid-cols-2 gap-x-4.5 gap-y-5 px-4.25">
    {props.products.map((product) => (
      <li key={product.id}>
        <ProductCard
          product={product}
          quantity={props.quantities[product.id] ?? 0}
          isFavorite={props.favoriteIds.includes(product.id)}
        />
      </li>
    ))}
  </ul>
);
