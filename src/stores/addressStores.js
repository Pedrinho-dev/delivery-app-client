import { defineStore } from 'pinia'

export const useAddressStore = defineStore('address', {
  state: () => ({
    origem: '',
    destino: '',
  }),

  actions: {
    setOrders (order) {
      this.origem = order.origem
      this.destino = order.destino
    },
  },
})
