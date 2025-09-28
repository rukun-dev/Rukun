export default defineNuxtPlugin(() => {
  const { showLoading, hideLoading } = useGlobalLoading()
  const { isLoading: authLoading } = useAuth()

  // Show loading on initial page load
  if (process.client) {
    // Show loading immediately when plugin loads
    showLoading('Memuat aplikasi...', 'Menginisialisasi sistem')

    // Watch for auth loading changes
    watch(authLoading, (newValue) => {
      if (newValue) {
        showLoading('Memverifikasi akses...', 'Memeriksa status login Anda')
      } else {
        // Small delay to prevent flashing
        setTimeout(() => {
          hideLoading()
        }, 300)
      }
    }, { immediate: true })

    // Hide loading after initial setup is complete
    nextTick(() => {
      setTimeout(() => {
        if (!authLoading.value) {
          hideLoading()
        }
      }, 500)
    })
  }
})