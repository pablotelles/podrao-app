import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import { Text } from './Text';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', id, rows = 3, ...props }, ref) => {
    const autoId = useId();
    const fieldId = id ?? autoId;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <Text as="label" variant="label" htmlFor={fieldId}>
            {label}
            {props.required && (
              <span className="ml-1 text-error" aria-hidden="true">
                *
              </span>
            )}
          </Text>
        )}
        <textarea
          ref={ref}
          id={fieldId}
          rows={rows}
          className={[
            'w-full rounded-md border border-border',
            'bg-bg px-3 py-2 text-sm text-text-primary',
            'placeholder:text-text-disabled',
            'focus:outline-none focus:ring-2 focus:ring-brand',
            'disabled:opacity-50 resize-none',
            error ? 'border-error' : '',
            className,
          ].join(' ')}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={
            error ? `${fieldId}-error` : helperText ? `${fieldId}-helper` : undefined
          }
          {...props}
        />
        {error && (
          <Text as="p" variant="caption" textColor="error" id={`${fieldId}-error`} role="alert">
            {error}
          </Text>
        )}
        {!error && helperText && (
          <Text as="p" variant="caption" textColor="secondary" id={`${fieldId}-helper`}>
            {helperText}
          </Text>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
