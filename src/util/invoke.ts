/**
 * invoke Semantic Immediately Executed Functions
 * @param func function
 * @param args arguments
 * @returns result
 */
export function invoke<RetT = unknown, ArgsT extends any[] = unknown[]>(func: (...ages: ArgsT) => RetT, ...args: ArgsT) {
  return func(...args)
}
