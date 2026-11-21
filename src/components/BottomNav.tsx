'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { HeartIcon, HomeIcon, UserIcon } from '@/components/icons/NavIcons';
import { Link, usePathname } from '@/libs/I18nNavigation';

const linkClass = 'absolute top-8 flex size-11 items-center justify-center';

export const BottomNav = () => {
  const t = useTranslations('BottomNav');
  const pathname = usePathname();
  const color = (href: string) => (pathname === href ? 'text-nav-active' : 'text-text-muted');

  return (
    <nav
      aria-label={t('label')}
      className="fixed inset-x-0 bottom-0 z-20 mx-auto h-21.75 w-full max-w-103.5"
    >
      <Image
        src="/icons/nav-bg.svg"
        alt=""
        width={414}
        height={87}
        className="absolute inset-0 size-full object-fill drop-shadow-nav"
      />
      <Link href="/" aria-label={t('home')} className={`${linkClass} nav-slot-1 ${color('/')}`}>
        <HomeIcon className="h-5.25 w-5.5" />
      </Link>
      <Link
        href="/account"
        aria-label={t('account')}
        className={`${linkClass} nav-slot-2 ${color('/account')}`}
      >
        <UserIcon className="size-5.5" />
      </Link>
      <Link
        href="/favorites"
        aria-label={t('favorites')}
        className={`${linkClass} nav-slot-3 ${color('/favorites')}`}
      >
        <HeartIcon className="h-4.5 w-5.5" />
      </Link>
      <Link href="/cart" aria-label={t('cart')} className="absolute -top-0.5 nav-slot-4 size-16">
        <Image src="/icons/nav-cart.svg" alt="" width={64} height={64} />
      </Link>
    </nav>
  );
};
