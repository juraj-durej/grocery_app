import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

/**
 * Renders a white auth input with a leading icon, a screen reader label and an optional trailing icon.
 * @param props - Input attributes plus the icons and the accessible label.
 * @param props.label - The accessible label text.
 * @param props.icon - The decorative leading icon.
 * @param props.trailing - The optional decorative trailing icon.
 * @param props.error - The optional translated error shown under the input.
 * @returns The field element.
 */
export function AuthField(
  props: {
    name: string;
    label: string;
    icon: React.ReactNode;
    trailing?: React.ReactNode;
    error?: string;
  } & Omit<React.ComponentProps<typeof Input>, 'className'>,
) {
  const { label, icon, trailing, error, ...inputProps } = props;
  const errorId = `${inputProps.name}-error`;

  return (
    <Field className="mx-auto w-full max-w-95" data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={inputProps.name} className="sr-only">
        {label}
      </FieldLabel>
      <div className="relative">
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-7 flex -translate-y-1/2 items-center"
        >
          {icon}
        </span>
        <Input
          id={inputProps.name}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...inputProps}
          className="h-15 rounded-button border-0 bg-white pr-16 pl-18 text-paragraph-1 text-text-strong shadow-none placeholder:text-text-secondary focus-visible:ring-ring md:text-paragraph-1"
        />
        {trailing && (
          <span
            aria-hidden
            className="pointer-events-none absolute top-1/2 right-7 flex -translate-y-1/2 items-center"
          >
            {trailing}
          </span>
        )}
      </div>
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </Field>
  );
}
