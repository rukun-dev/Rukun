<template>
  <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div 
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
        @click="closeModal"
      ></div>
      
      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white px-6 py-5 sm:p-6">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <!-- Icon -->
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <!-- Content -->
              <div class="mt-4">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  Hapus Kartu Keluarga
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Apakah Anda yakin ingin menghapus kartu keluarga dengan nomor
                    <span class="font-medium text-gray-900">{{ keluarga?.noKk }}</span>?
                    Tindakan ini tidak dapat dibatalkan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
            @click="confirmDelete"
          >
            Hapus
          </button>
          <button
            type="button"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
            @click="closeModal"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface KeluargaData {
  id: number;
  noKk: string;
  kepalaKeluarga: string;
  nikKepala: string;
  jumlahAnggota: number;
  alamat: string;
  rt: string;
  rw: string;
  status: string;
}

const props = defineProps<{
  keluarga?: KeluargaData | null;
}>();

const emit = defineEmits<{
  close: [];
  confirm: [id: number];
}>();

const closeModal = () => {
  emit('close');
};

const confirmDelete = () => {
  if (props.keluarga?.id) {
    emit('confirm', props.keluarga.id);
  }
  closeModal();
};
</script>

<style scoped>
/* Animations */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active {
  transition: all 0.3s ease-out;
}
.slide-up-enter-from {
  transform: translateY(20px);
  opacity: 0;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .sm\:max-w-lg {
    max-width: 100%;
    margin: 0 1rem;
  }
}
</style>