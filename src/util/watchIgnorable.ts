import type { WatchCallback, WatchOptions, WatchSource } from 'vue'
import { ref, watch } from 'vue'

export type IgnoredUpdater = (updater: () => void) => void

/**
 * Extended watch that exposes a ignoreUpdates(updater) function that allows to update the source without triggering effects
 * Reference: https://patak.dev/vue/ignorable-watch.html
 */
export function watchIgnorable<T, Immediate extends Readonly<boolean> = false>(
  source: WatchSource<T>,
  cb: WatchCallback<T, Immediate extends true ? T | undefined : T>,
  options?: WatchOptions<Immediate>,
) {
  const ignoreCount = ref(0)
  const syncCount = ref(0)
  const syncStop = watch(
    source,
    () => {
      syncCount.value++
    },
    { ...options, flush: 'sync' },
  )
  const stop = watch(source,
    (...args) => {
      const ignore = ignoreCount.value > 0
        && ignoreCount.value === syncCount.value

      ignoreCount.value = 0
      syncCount.value = 0

      if (!ignore)
        cb(...args)
    },
    options,
  )
  const ignoreUpdates: IgnoredUpdater = (updater) => {
    const prev = syncCount.value
    updater()
    const changes = syncCount.value - prev
    // Add sync changes done in updater
    ignoreCount.value += changes
  }
  const ignorePrevAsyncUpdates = () => {
    // All sync changes til are ignored
    ignoreCount.value = syncCount.value
  }
  return {
    ignoreUpdates,
    ignorePrevAsyncUpdates,
    stop: () => {
      syncStop()
      stop()
    },
  }
}
