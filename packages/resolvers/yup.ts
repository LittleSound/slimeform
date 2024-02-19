import type { Schema, ValidationError, AnyObject, ValidateOptions } from 'yup'

export interface ResolverOptions {
  model?: 'validateSync' | 'validate'
}

/** yup field rule resolver */
export const yupFieldRule = <SchemaT extends Schema, TContext = {}>(
  fieldSchema: SchemaT,
  schemaOptions: ValidateOptions<TContext> = {},
) => {
  return (val: unknown) => {
    try {
      fieldSchema.validateSync(
        val,
        Object.assign({ abortEarly: false }, schemaOptions) as ValidateOptions<AnyObject>,
      )
      return true
    }
    catch (error: any) {
      if (!error?.inner)
        throw error
      return parseYupError(error)
    }
  }
}

function parseYupError(error: ValidationError) {
  return error.errors[0]
}
