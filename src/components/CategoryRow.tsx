import Image from 'next/image';
import { Link } from '@/libs/I18nNavigation';
import type { Category } from '@/types/Shop';

export const CategoryRow = (props: { categories: Category[] }) => (
  <ul className="no-scrollbar flex gap-5 overflow-x-auto px-5">
    {props.categories.map((category) => (
      <li key={category.id} className="w-13 shrink-0">
        <Link
          href={`/categories/${category.slug}`}
          className="flex flex-col items-center gap-2.75 whitespace-nowrap"
        >
          <span
            className="flex size-13 items-center justify-center rounded-full"
            style={{ backgroundColor: category.color }}
          >
            <Image src={category.iconUrl} alt="" width={28} height={28} className="size-7" />
          </span>
          <span className="text-micro font-medium text-text-secondary">{category.name}</span>
        </Link>
      </li>
    ))}
  </ul>
);
