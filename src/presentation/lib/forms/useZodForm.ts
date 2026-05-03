import { useForm, type UseFormProps, type FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

/**
 * Thin wrapper over useForm that automatically wires zodResolver.
 *
 * Usage — always pass the schema's inferred type explicitly:
 *   const form = useZodForm<MySchemaInput>({ schema, defaultValues });
 *
 * This avoids TypeScript inferring T from defaultValues (which is Partial<T>)
 * instead of from the schema output type.
 */
export function useZodForm<T extends FieldValues>({
  schema,
  defaultValues,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: any;
  defaultValues?: UseFormProps<T>['defaultValues'];
}) {
  return useForm<T>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues,
    mode: 'onTouched',
  });
}
