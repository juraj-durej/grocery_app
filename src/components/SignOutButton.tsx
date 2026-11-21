'use client';

import { signOut } from '@/actions/AuthActions';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/stores/AppStore';

/**
 * Renders the sign out button; clears the client store before signing out on the server.
 * @param props - Component props.
 * @param props.label - The button text.
 * @returns The button.
 */
export function SignOutButton(props: { label: string }) {
  return (
    <Button
      type="button"
      variant="brand"
      size="brand"
      onClick={async () => {
        useAppStore.getState().clearAuth();
        await signOut();
      }}
    >
      {props.label}
    </Button>
  );
}
