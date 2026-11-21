import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/libs/I18nNavigation';

export const PageHeader = async (props: { title: string; backHref?: string }) => {
  const t = await getTranslations('PageHeader');

  return (
    <header className="relative flex h-14 items-center justify-center px-4">
      <Link
        href={props.backHref ?? '/home'}
        aria-label={t('back')}
        className="absolute left-2 flex size-11 items-center justify-center"
      >
        <Image
          src="/assets/icons/chevron.svg"
          alt=""
          width={11}
          height={18}
          className="rotate-180"
        />
      </Link>
      <h1 className="text-heading-3 font-medium text-text-strong">{props.title}</h1>
    </header>
  );
};
