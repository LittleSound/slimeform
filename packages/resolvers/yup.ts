import type { BaseSchema, ValidationError } from 'yup'
import type { ValidateOptions } from 'yup/lib/types'

export const parseYupError = (error: ValidationError) => {
  return error.errors[0] || true
}

/** yup sync field rule resolver */
export const yupFieldRule = <SchemaT extends BaseSchema, TContext = {}>(
  fieldSchema: SchemaT,
  schemaOptions: ValidateOptions<TContext> = {},
) => {
  return (val: unknown) => {
    try {
      fieldSchema.validateSync(
        val,
        Object.assign({ abortEarly: false }, schemaOptions),
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

/** yup asynchronous field rule resolver */
export const yupAsyncFieldRule = <SchemaT extends BaseSchema, TContext = {}>(
  fieldSchema: SchemaT,
  schemaOptions: ValidateOptions<TContext> = {},
) => {
  return async (val: unknown) => {
    try {
      await fieldSchema.validate(
        val,
        Object.assign({ abortEarly: false }, schemaOptions),
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
