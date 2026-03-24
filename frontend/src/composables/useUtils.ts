import { onMounted, onUnmounted, ref } from 'vue'

export function useConfirmDialog() {
  const isOpen = ref(false)
  const message = ref('')
  const title = ref('Confirm')
  const resolvePromise = ref<((value: boolean) => void) | null>(null)

  function confirm(msg: string, dialogTitle = 'Confirm Action'): Promise<boolean> {
    title.value = dialogTitle
    message.value = msg
    isOpen.value = true

    return new Promise((resolve) => {
      resolvePromise.value = resolve
    })
  }

  function handleConfirm() {
    if (resolvePromise.value) {
      resolvePromise.value(true)
    }
    close()
  }

  function handleCancel() {
    if (resolvePromise.value) {
      resolvePromise.value(false)
    }
    close()
  }

  function close() {
    isOpen.value = false
    message.value = ''
    title.value = 'Confirm'
    resolvePromise.value = null
  }

  return {
    isOpen,
    message,
    title,
    confirm,
    handleConfirm,
    handleCancel,
  }
}

export function useDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay = 300
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

export function useClickOutside(handler: () => void) {
  const element = ref<HTMLElement | null>(null)

  function onClickOutside(event: MouseEvent) {
    if (element.value && !element.value.contains(event.target as Node)) {
      handler()
    }
  }

  onMounted(() => {
    document.addEventListener('click', onClickOutside)
  })

  onUnmounted(() => {
    document.removeEventListener('click', onClickOutside)
  })

  return element
}
