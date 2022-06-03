/** yup field rule resolver */
export const yupFieldRule = (fieldSchema: any) => (val: any) => {
  try {
    fieldSchema.validateSync(val)
    return true
  }
  catch (error: any) {
    if (error.inner)
      return error.message
    throw error
  }
}
