export type Product = { id: string; name: string; price: number; imageUrl: string | null };
export type CartItem = { product: Product; quantity: number };

/**
 * Adds a product to the cart, merging the quantity when it is already present.
 * @param items - Current cart items.
 * @param product - Product to add.
 * @param quantity - Quantity to add.
 * @returns The new cart items.
 */
export const addCartItem = (items: CartItem[], product: Product, quantity: number) => {
  if (items.some((item) => item.product.id === product.id)) {
    return items.map((item) =>
      item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
    );
  }
  return [...items, { product, quantity }];
};

/**
 * Removes a product from the cart.
 * @param items - Current cart items.
 * @param productId - Id of the product to remove.
 * @returns The new cart items.
 */
export const removeCartItem = (items: CartItem[], productId: string) =>
  items.filter((item) => item.product.id !== productId);

/**
 * Sets the quantity of a cart item; a quantity of 0 or less removes it.
 * @param items - Current cart items.
 * @param productId - Id of the product to update.
 * @param quantity - New quantity.
 * @returns The new cart items.
 */
export const updateCartItemQuantity = (items: CartItem[], productId: string, quantity: number) =>
  quantity <= 0
    ? removeCartItem(items, productId)
    : items.map((item) => (item.product.id === productId ? { ...item, quantity } : item));
