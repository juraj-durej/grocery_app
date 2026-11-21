import Image from 'next/image';
import { Link } from '@/libs/I18nNavigation';

export const SectionTitle = (props: { href: string; children: React.ReactNode }) => (
  <h2 className="text-heading-3 font-semibold text-text-strong">
    <Link href={props.href} className="-my-2 flex items-center justify-between py-2 pr-4.25 pl-4">
      {props.children}
      <Image src="/assets/icons/chevron.svg" alt="" width={11} height={18} />
    </Link>
  </h2>
);
