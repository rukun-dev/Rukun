import { ref } from 'vue';

export const useToast = () => {
  const toast = ref<{
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration: number;
  }>({
    visible: false,
    message: '',
    type: 'info',
    duration: 3000
  });

  let timeout: ReturnType<typeof setTimeout> | null = null;

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration = 3000) => {
    // Clear existing timeout if any
    if (timeout) {
      clearTimeout(timeout);
    }

    toast.value = {
      visible: true,
      message,
      type,
      duration
    };

    // Hide toast after duration
    timeout = setTimeout(() => {
      toast.value.visible = false;
    }, duration);
  };

  const success = (message: string, duration = 3000) => {
    showToast(message, 'success', duration);
  };

  const error = (message: string, duration = 5000) => {
    showToast(message, 'error', duration);
  };

  const info = (message: string, duration = 3000) => {
    showToast(message, 'info', duration);
  };

  const warning = (message: string, duration = 4000) => {
    showToast(message, 'warning', duration);
  };

  const hide = () => {
    if (timeout) {
      clearTimeout(timeout);
    }
    toast.value.visible = false;
  };

  return {
    toast,
    showToast,
    success,
    error,
    info,
    warning,
    hide
  };
};