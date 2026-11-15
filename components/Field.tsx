'use client';

import { forwardRef, useId } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { dur, ease } from '@/lib/motion';

const fieldBase =
  'peer w-full rounded-md border border-[var(--border-strong)] bg-[var(--bg-1)]/60 px-4 py-3.5 text-body text-text-0 placeholder-transparent outline-none transition-all duration-300 ease-out focus:border-[var(--accent-400)] focus:bg-[var(--bg-1)] focus:shadow-[0_0_0_3px_rgba(34,211,238,0.12)]';

interface WrapProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

function FieldWrap({ label, htmlFor, required, error, children, className }: WrapProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      <label
        htmlFor={htmlFor}
        className="pointer-events-none absolute left-3 top-3.5 origin-left px-1 text-text-2 transition-all duration-300 ease-out peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-accent-400 peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-xs peer-focus:bg-[var(--bg-1)] peer-[:not(:placeholder-shown)]:bg-[var(--bg-1)]"
      >
        {label}
        {required && <span className="text-accent-400"> *</span>}
      </label>
      <AnimatePresence>
        {error && (
          <motion.p
            role="alert"
            className="mt-1.5 text-xs text-[#ff6b6b]"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: dur.xs, ease: ease.out }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  wrapClassName?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, required, wrapClassName, id, ...rest },
  ref
) {
  const gid = useId();
  const fid = id || gid;
  return (
    <FieldWrap label={label} htmlFor={fid} required={required} error={error} className={wrapClassName}>
      <input
        ref={ref}
        id={fid}
        data-cursor="text"
        placeholder={label}
        aria-invalid={!!error}
        className={cn(fieldBase, error && 'border-[#ff6b6b]')}
        {...rest}
      />
    </FieldWrap>
  );
});

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  wrapClassName?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { label, error, required, wrapClassName, id, ...rest },
  ref
) {
  const gid = useId();
  const fid = id || gid;
  return (
    <FieldWrap label={label} htmlFor={fid} required={required} error={error} className={wrapClassName}>
      <textarea
        ref={ref}
        id={fid}
        data-cursor="text"
        placeholder={label}
        aria-invalid={!!error}
        className={cn(fieldBase, 'min-h-[120px] resize-y', error && 'border-[#ff6b6b]')}
        {...rest}
      />
    </FieldWrap>
  );
});

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
  wrapClassName?: string;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { label, error, required, options, wrapClassName, id, value, ...rest },
  ref
) {
  const gid = useId();
  const fid = id || gid;
  return (
    <div className={cn('relative', wrapClassName)}>
      <label htmlFor={fid} className="mb-1.5 block text-xs uppercase tracking-wide text-text-2">
        {label}
        {required && <span className="text-accent-400"> *</span>}
      </label>
      <div className="relative">
        <select
          ref={ref}
          id={fid}
          value={value}
          aria-invalid={!!error}
          className={cn(
            'w-full appearance-none rounded-md border border-[var(--border-strong)] bg-[var(--bg-1)]/60 px-4 py-3.5 text-body text-text-0 outline-none transition-all duration-300 ease-out focus:border-[var(--accent-400)] focus:shadow-[0_0_0_3px_rgba(34,211,238,0.12)]',
            !value && 'text-text-2',
            error && 'border-[#ff6b6b]'
          )}
          {...rest}
        >
          <option value="" disabled>
            Select an option
          </option>
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-[var(--bg-2)] text-text-0">
              {o.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-2"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
      {error && <p className="mt-1.5 text-xs text-[#ff6b6b]">{error}</p>}
    </div>
  );
});
