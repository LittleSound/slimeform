import type { BaseSchema, ValidationError } from 'yup'
import type { ValidateOptions } from 'yup/lib/types'
import type { RuleItem } from '../../src/type/form'

export const parseYupError = (error: ValidationError) => {
  return error.errors[0] || true
}

/** yup sync field rule resolver */
export const yupFieldRule = <SchemaT extends BaseSchema, TContext = {}>(
  fieldSchema: SchemaT,
  schemaOptions: ValidateOptions<TContext> = {},
): RuleItem => {
  return (val) => {
    try {
      fieldSchema.validateSync(
        val,
        Object.assign({ abortEarly: true }, schemaOptions),
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
): RuleItem => {
  return async (val) => {
    try {
      await fieldSchema.validate(
        val,
        Object.assign({ abortEarly: true }, schemaOptions),
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
