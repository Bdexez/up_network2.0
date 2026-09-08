import clsx from 'clsx';
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { useId } from 'react';

const CONTROL =
  'w-full rounded-lg border border-line bg-raised px-3 text-sm text-ink placeholder:text-ink-3 ' +
  'transition-colors hover:border-line-strong focus:border-accent disabled:opacity-60';

function Wrapper({
  label,
  hint,
  error,
  required,
  htmlFor,
  children,
}: {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={htmlFor} className="text-[13px] font-medium text-ink-2">
          {label}
          {required && <span className="ml-0.5 text-critical">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-critical">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-3">{hint}</p>
      ) : null}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Input({ label, hint, error, className, id, ...props }: InputProps) {
  const generated = useId();
  const fieldId = id ?? generated;
  return (
    <Wrapper
      label={label}
      hint={hint}
      error={error}
      required={props.required}
      htmlFor={fieldId}
    >
      <input
        {...props}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        className={clsx(CONTROL, 'h-9.5', error && 'border-critical', className)}
      />
    </Wrapper>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Select({ label, hint, error, className, id, children, ...props }: SelectProps) {
  const generated = useId();
  const fieldId = id ?? generated;
  return (
    <Wrapper
      label={label}
      hint={hint}
      error={error}
      required={props.required}
      htmlFor={fieldId}
    >
      <select
        {...props}
        id={fieldId}
        className={clsx(CONTROL, 'h-9.5 cursor-pointer', error && 'border-critical', className)}
      >
        {children}
      </select>
    </Wrapper>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Textarea({ label, hint, error, className, id, ...props }: TextareaProps) {
  const generated = useId();
  const fieldId = id ?? generated;
  return (
    <Wrapper
      label={label}
      hint={hint}
      error={error}
      required={props.required}
      htmlFor={fieldId}
    >
      <textarea
        {...props}
        id={fieldId}
        className={clsx(CONTROL, 'py-2 leading-relaxed', error && 'border-critical', className)}
      />
    </Wrapper>
  );
}
