<template>
    <div class="select-container">
        <header class="header-map" @click="$router.back()">
            <v-icon icon="mdi-arrow-left"></v-icon>
            <h2>Select the address</h2>
        </header>

        <div class="form-box">
            
            <v-text-field
                label="Your location"
                v-model= "origem"
                readonly
                prepend-inner-icon="mdi-crosshairs-gps"
            />

            <v-text-field
                v-model="destino"
                ref="destinoInput"
                placeholder="Where go?"
                prepend-inner-icon="mdi-map-marker"
            /> 

            <div class="previous-destinations">
                <div class="title-icon">
                    <v-icon icon="mdi-map-marker"></v-icon>
                    <h2> Campo Grande</h2>
                </div>
                <span>
                    Avenida Afonso Pena, 6.134, Centro, 79040-010. 
                </span>
                    <v-divider horizontal class="mx-3"></v-divider>
            </div>

            <div class="previous-destinations">
                <div class="title-icon">    
                    <v-icon icon="mdi-map-marker"></v-icon>
                    <h2> Campo Grande</h2>
                </div>
                <span>
                    Rua das Garças, 285, Centro, 79020-180.
                </span>
                    <v-divider horizontal class="mx-3"></v-divider>
            </div>     

            <div class="previous-destinations">
                <div class="title-icon">
                    <v-icon icon="mdi-map-marker"></v-icon>
                    <h2> Campo Grande</h2>  
                </div>
                <span>
                    Rua Antônio Maria Coelho, 2184, Centro, 79002-221.
                </span>
                    <v-divider horizontal class="mx-3"></v-divider>
            </div>

            <div class="previous-destinations">
                <div class="title-icon">
                    <v-icon icon="mdi-map-marker"></v-icon>
                    <h2> Campo Grande</h2>  
                </div>
                <span>
                    Av. Mato Grosso, 1944, Jardim dos Estados, 79020-201.
                </span>
                    <v-divider horizontal class="mx-3"></v-divider>
            </div>
            
            <div class="previous-destinations">
                <div class="title-icon">
                    <v-icon icon="mdi-map-marker"></v-icon>
                    <h2> Campo Grande</h2>  
                </div>
                <span>
                    Av. Duque de Caxias, 2143, Vila Alba, 79103-010.
                </span>
                    <v-divider horizontal class="mx-3"></v-divider>
            </div>

            <v-btn
                class="fixed-btn"
                color="black"
                block
                @click="confirmar"
            >
                Next
            </v-btn>
        </div>

        <BaseboardMenu />
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import axios from "axios";
import BaseboardMenu from "@/components/BaseboardMenu.vue";
import { loadGoogleMaps } from "@/composables/useGoogleMaps";
import { useAddressStore } from "@/stores/addressStores";

const addressStores = useAddressStore();
const origem = ref ("")
const destino = ref ("")
const destinoInput = ref(null)

let autocomplete
let userPosition = null

onMounted(async ()=> {
    const apiKey = "AIzaSyCoQ58bNGXYgXOMKAlTjPjgrr6_4N2gyY0"
    const google = await loadGoogleMaps(apiKey, ["places"])

    navigator.geolocation.getCurrentPosition(async (pos) =>{
        userPosition = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
        }

        await buscarEnderecoAtual(apiKey)

       const inputEl = destinoInput.value?.$el?.querySelector('input')

       if (!inputEl) {
        console.error("Input do destino não encontrado!")
        return
    }
        autocomplete = new google.places.Autocomplete(inputEl, {
            fields: ["formatted_address", "geometry"],
        })

        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace()
            if (place.geometry) destino.value = place.formatted_address
        })
      }
    )
})

    async function buscarEnderecoAtual(apiKey) {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${userPosition.lat},${userPosition.lng}&key=${apiKey}`
        const response = await axios.get(url)

        origem.value = response.data.results[0].formatted_address
    }

    function confirmar(){
        const orders = [{
            origin: origem.value,
            destiny: destino.value
        }]

        addressStores.setOrders(orders)
        
        console.log("Salvo no Pinia:")
        console.log("Origem: ", origem.value)
        console.log("Destino: ", destino.value)
    }

</script>

<style scoped>
.select-container {
  width: 100%;
  height: 100%;
  background: white;
  color: black;
}

.header-map {
  height: 60px;
  align-items: center;
  justify-content:left;
  gap: 2rem;
  font-size: 15px;
}

.form-box {
  top: 0;
  left: 0;
  height: 24rem;  
  margin-top: 90px;
  padding: 20px;
}

.previous-destinations{
    padding-bottom: 1rem;
}

.title-icon{
    display: flex;
    align-items: center;
    margin-bottom: 4px;
}

.title-icon h2{
    font-size: 16px;
}

span{
    display: flex;
    flex-direction: column;
    padding: 4px;
    font-size: 14px;
    margin-left: 20px;
}

.fixed-btn{
    position: fixed;
    left: 50%;
    bottom: 80px;
    transform: translateX(-50%);
}

</style>



