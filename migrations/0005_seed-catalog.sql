INSERT INTO categories (slug, name, icon_url, color, sort_order) VALUES ('vegetables', 'Vegetables', '/assets/images/categories/vegetables.svg', '#E6F2EA', 1) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO categories (slug, name, icon_url, color, sort_order) VALUES ('fruits', 'Fruits', '/assets/images/categories/fruits.svg', '#FFE9E5', 2) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO categories (slug, name, icon_url, color, sort_order) VALUES ('beverages', 'Beverages', '/assets/images/categories/beverages.svg', '#FFF6E3', 3) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO categories (slug, name, icon_url, color, sort_order) VALUES ('grocery', 'Grocery', '/assets/images/categories/grocery.svg', '#F3EFFA', 4) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO categories (slug, name, icon_url, color, sort_order) VALUES ('edible-oil', 'Edible oil', '/assets/images/categories/edible-oil.svg', '#DCF4F5', 5) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO categories (slug, name, icon_url, color, sort_order) VALUES ('household', 'Household', '/assets/images/categories/household.svg', '#FFE8F2', 6) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO categories (slug, name, icon_url, color, sort_order) VALUES ('babycare', 'Babycare', '/assets/images/categories/babycare.svg', '#D2EFFF', 7) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO products (slug, category_id, name, price_cents, unit, image_url, color, is_new, discount_percent, is_featured, featured_order) VALUES ('fresh-peach', (SELECT id FROM categories WHERE slug = 'fruits'), 'Fresh Peach', 800, 'dozen', '/assets/images/products/peach.png', '#FFCEC1', false, NULL, true, 1) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO products (slug, category_id, name, price_cents, unit, image_url, color, is_new, discount_percent, is_featured, featured_order) VALUES ('avocado', (SELECT id FROM categories WHERE slug = 'fruits'), 'Avacoda', 700, '2.0 lbs', '/assets/images/products/avocado.png', '#FCFFD9', true, NULL, true, 2) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO products (slug, category_id, name, price_cents, unit, image_url, color, is_new, discount_percent, is_featured, featured_order) VALUES ('pineapple', (SELECT id FROM categories WHERE slug = 'fruits'), 'Pineapple', 990, '1.50 lbs', '/assets/images/products/pineapple.png', '#FFE6C2', false, NULL, true, 3) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO products (slug, category_id, name, price_cents, unit, image_url, color, is_new, discount_percent, is_featured, featured_order) VALUES ('black-grapes', (SELECT id FROM categories WHERE slug = 'fruits'), 'Black Grapes', 705, '5.0 lbs', '/assets/images/products/grapes.png', '#FEE1ED', false, 16, true, 4) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO products (slug, category_id, name, price_cents, unit, image_url, color, is_new, discount_percent, is_featured, featured_order) VALUES ('pomegranate', (SELECT id FROM categories WHERE slug = 'fruits'), 'Pomegranate', 209, '1.50 lbs', '/assets/images/products/pomegranate.png', '#FFE3E2', true, NULL, true, 5) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO products (slug, category_id, name, price_cents, unit, image_url, color, is_new, discount_percent, is_featured, featured_order) VALUES ('fresh-broccoli', (SELECT id FROM categories WHERE slug = 'vegetables'), 'Fresh B roccoli', 300, '1 kg', '/assets/images/products/broccoli.png', '#D2FFD0', false, NULL, true, 6) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO products (slug, category_id, name, price_cents, unit, image_url, color, is_new, discount_percent, is_featured, featured_order) VALUES ('fresh-lime', (SELECT id FROM categories WHERE slug = 'fruits'), 'Fresh Lime', 249, '1 lbs', '/assets/images/products/lime.png', '#E8F8D6', false, NULL, false, NULL) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO products (slug, category_id, name, price_cents, unit, image_url, color, is_new, discount_percent, is_featured, featured_order) VALUES ('red-apples', (SELECT id FROM categories WHERE slug = 'fruits'), 'Red Apples', 450, '1 kg', NULL, '#FFE0E0', false, 10, false, NULL) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO products (slug, category_id, name, price_cents, unit, image_url, color, is_new, discount_percent, is_featured, featured_order) VALUES ('tomatoes', (SELECT id FROM categories WHERE slug = 'vegetables'), 'Tomatoes', 320, '1 kg', NULL, '#FFE3DC', false, NULL, false, NULL) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO products (slug, category_id, name, price_cents, unit, image_url, color, is_new, discount_percent, is_featured, featured_order) VALUES ('carrots', (SELECT id FROM categories WHERE slug = 'vegetables'), 'Carrots', 180, '1 kg', NULL, '#FFEBD6', true, NULL, false, NULL) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO products (slug, category_id, name, price_cents, unit, image_url, color, is_new, discount_percent, is_featured, featured_order) VALUES ('spinach', (SELECT id FROM categories WHERE slug = 'vegetables'), 'Fresh Spinach', 250, '500 g', NULL, '#DDF3DC', false, NULL, false, NULL) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO products (slug, category_id, name, price_cents, unit, image_url, color, is_new, discount_percent, is_featured, featured_order) VALUES ('red-onions', (SELECT id FROM categories WHERE slug = 'vegetables'), 'Red Onions', 210, '1 kg', NULL, '#F5E1F0', false, 15, false, NULL) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO products (slug, category_id, name, price_cents, unit, image_url, color, is_new, discount_percent, is_featured, featured_order) VALUES ('orange-juice', (SELECT id FROM categories WHERE slug = 'beverages'), 'Orange Juice', 399, '1 L', NULL, '#FFF0D1', false, NULL, false, NULL) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO products (slug, category_id, name, price_cents, unit, image_url, color, is_new, discount_percent, is_featured, featured_order) VALUES ('sparkling-water', (SELECT id FROM categories WHERE slug = 'beverages'), 'Sparkling Water', 149, '1.5 L', NULL, '#E0F4FB', false, NULL, false, NULL) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO products (slug, category_id, name, price_cents, unit, image_url, color, is_new, discount_percent, is_featured, featured_order) VALUES ('green-tea', (SELECT id FROM categories WHERE slug = 'beverages'), 'Green Tea', 450, '20 bags', NULL, '#E3F5E1', true, NULL, false, NULL) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO products (slug, category_id, name, price_cents, unit, image_url, color, is_new, discount_percent, is_featured, featured_order) VALUES ('cola', (SELECT id FROM categories WHERE slug = 'beverages'), 'Cola', 199, '1.5 L', NULL, '#F3E3DC', false, 20, false, NULL) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO products (slug, category_id, name, price_cents, unit, image_url, color, is_new, discount_percent, is_featured, featured_order) VALUES ('coffee-beans', (SELECT id FROM categories WHERE slug = 'beverages'), 'Coffee Beans', 1290, '500 g', NULL, '#EBDDD0', false, NULL, false, NULL) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO products (slug, category_id, name, price_cents, unit, image_url, color, is_new, discount_percent, is_featured, featured_order) VALUES ('basmati-rice', (SELECT id FROM categories WHERE slug = 'grocery'), 'Basmati Rice', 899, '2 kg', NULL, '#F5F0E6', false, NULL, false, NULL) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO products (slug, category_id, name, price_cents, unit, image_url, color, is_new, discount_percent, is_featured, featured_order) VALUES ('spaghetti', (SELECT id FROM categories WHERE slug = 'grocery'), 'Spaghetti', 179, '500 g', NULL, '#FFF3D6', false, NULL, false, NULL) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO products (slug, category_id, name, price_cents, unit, image_url, color, is_new, discount_percent, is_featured, featured_order) VALUES ('rolled-oats', (SELECT id FROM categories WHERE slug = 'grocery'), 'Rolled Oats', 329, '750 g', NULL, '#F1EADF', true, NULL, false, NULL) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO products (slug, category_id, name, price_cents, unit, image_url, color, is_new, discount_percent, is_featured, featured_order) VALUES ('wheat-flour', (SELECT id FROM categories WHERE slug = 'grocery'), 'Wheat Flour', 259, '1 kg', NULL, '#F8F1E4', false, 12, false, NULL) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO products (slug, category_id, name, price_cents, unit, image_url, color, is_new, discount_percent, is_featured, featured_order) VALUES ('red-lentils', (SELECT id FROM categories WHERE slug = 'grocery'), 'Red Lentils', 299, '500 g', NULL, '#FFE6D9', false, NULL, false, NULL) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO products (slug, category_id, name, price_cents, unit, image_url, color, is_new, discount_percent, is_featured, featured_order) VALUES ('olive-oil', (SELECT id FROM categories WHERE slug = 'edible-oil'), 'Extra Virgin Olive Oil', 1199, '1 L', NULL, '#EAF3D3', false, NULL, false, NULL) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO products (slug, category_id, name, price_cents, unit, image_url, color, is_new, discount_percent, is_featured, featured_order) VALUES ('sunflower-oil', (SELECT id FROM categories WHERE slug = 'edible-oil'), 'Sunflower Oil', 549, '1 L', NULL, '#FFF6C9', false, NULL, false, NULL) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO products (slug, category_id, name, price_cents, unit, image_url, color, is_new, discount_percent, is_featured, featured_order) VALUES ('coconut-oil', (SELECT id FROM categories WHERE slug = 'edible-oil'), 'Coconut Oil', 799, '500 ml', NULL, '#F4F8F8', true, NULL, false, NULL) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO products (slug, category_id, name, price_cents, unit, image_url, color, is_new, discount_percent, is_featured, featured_order) VALUES ('canola-oil', (SELECT id FROM categories WHERE slug = 'edible-oil'), 'Canola Oil', 499, '1 L', NULL, '#FFF4CC', false, 10, false, NULL) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO products (slug, category_id, name, price_cents, unit, image_url, color, is_new, discount_percent, is_featured, featured_order) VALUES ('sesame-oil', (SELECT id FROM categories WHERE slug = 'edible-oil'), 'Sesame Oil', 649, '250 ml', NULL, '#F6E9D2', false, NULL, false, NULL) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO products (slug, category_id, name, price_cents, unit, image_url, color, is_new, discount_percent, is_featured, featured_order) VALUES ('dish-soap', (SELECT id FROM categories WHERE slug = 'household'), 'Dish Soap', 279, '500 ml', NULL, '#DDF1F7', false, NULL, false, NULL) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO products (slug, category_id, name, price_cents, unit, image_url, color, is_new, discount_percent, is_featured, featured_order) VALUES ('laundry-detergent', (SELECT id FROM categories WHERE slug = 'household'), 'Laundry Detergent', 1299, '2 L', NULL, '#E3E9FB', false, 15, false, NULL) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO products (slug, category_id, name, price_cents, unit, image_url, color, is_new, discount_percent, is_featured, featured_order) VALUES ('paper-towels', (SELECT id FROM categories WHERE slug = 'household'), 'Paper Towels', 599, '4 rolls', NULL, '#FFF1F6', false, NULL, false, NULL) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO products (slug, category_id, name, price_cents, unit, image_url, color, is_new, discount_percent, is_featured, featured_order) VALUES ('trash-bags', (SELECT id FROM categories WHERE slug = 'household'), 'Trash Bags', 399, '30 pcs', NULL, '#E8E8EE', true, NULL, false, NULL) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO products (slug, category_id, name, price_cents, unit, image_url, color, is_new, discount_percent, is_featured, featured_order) VALUES ('all-purpose-cleaner', (SELECT id FROM categories WHERE slug = 'household'), 'All-purpose Cleaner', 349, '750 ml', NULL, '#E0F7EC', false, NULL, false, NULL) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO products (slug, category_id, name, price_cents, unit, image_url, color, is_new, discount_percent, is_featured, featured_order) VALUES ('baby-diapers', (SELECT id FROM categories WHERE slug = 'babycare'), 'Baby Diapers', 1899, '44 pcs', NULL, '#DDF0FF', false, NULL, false, NULL) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO products (slug, category_id, name, price_cents, unit, image_url, color, is_new, discount_percent, is_featured, featured_order) VALUES ('baby-wipes', (SELECT id FROM categories WHERE slug = 'babycare'), 'Baby Wipes', 499, '80 pcs', NULL, '#FFF0F5', false, NULL, false, NULL) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO products (slug, category_id, name, price_cents, unit, image_url, color, is_new, discount_percent, is_featured, featured_order) VALUES ('baby-shampoo', (SELECT id FROM categories WHERE slug = 'babycare'), 'Baby Shampoo', 599, '300 ml', NULL, '#E6F4FF', true, NULL, false, NULL) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO products (slug, category_id, name, price_cents, unit, image_url, color, is_new, discount_percent, is_featured, featured_order) VALUES ('baby-lotion', (SELECT id FROM categories WHERE slug = 'babycare'), 'Baby Lotion', 749, '200 ml', NULL, '#FDEFE6', false, 10, false, NULL) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO products (slug, category_id, name, price_cents, unit, image_url, color, is_new, discount_percent, is_featured, featured_order) VALUES ('infant-formula', (SELECT id FROM categories WHERE slug = 'babycare'), 'Infant Formula', 2499, '800 g', NULL, '#EEF1FA', false, NULL, false, NULL) ON CONFLICT (slug) DO NOTHING;
