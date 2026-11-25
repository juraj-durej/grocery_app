'use client';

import Image from 'next/image';
import { signOut } from '@/actions/AuthActions';
import { useAppStore } from '@/stores/AppStore';

/**
 * Renders the account menu sign out row; clears the client store before signing out on the server.
 * @param props - Component props.
 * @param props.label - The row text.
 * @returns The row button.
 */
export function SignOutRow(props: { label: string }) {
  return (
    <button
      type="button"
      className="flex h-11 w-full items-center gap-3.5 pl-9.25 text-left text-body-sm font-semibold tracking-[0.36px] text-text-strong focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      onClick={async () => {
        useAppStore.getState().clearAuth();
        await signOut();
      }}
    >
      <Image src="/assets/icons/sign-out.svg" alt="" width={21} height={20} />
      {props.label}
    </button>
  );
}
