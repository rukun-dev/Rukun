export const useGlobalLoading = () => {
  const isLoading = useState('global.loading', () => false)
  const loadingTitle = useState('global.loading.title', () => 'Memuat...')
  const loadingMessage = useState('global.loading.message', () => 'Mohon tunggu sebentar')

  const showLoading = (title?: string, message?: string) => {
    if (title) loadingTitle.value = title
    if (message) loadingMessage.value = message
    isLoading.value = true
  }

  const hideLoading = () => {
    isLoading.value = false
  }

  const setLoadingText = (title: string, message?: string) => {
    loadingTitle.value = title
    if (message) loadingMessage.value = message
  }

  return {
    isLoading: readonly(isLoading),
    loadingTitle: readonly(loadingTitle),
    loadingMessage: readonly(loadingMessage),
    showLoading,
    hideLoading,
    setLoadingText
  }
}