<template>
  <div class="map-content">

    <header class="header-map">
      <h2>UberMap</h2>
      <div class="acount_balance">
        <v-icon icon="mdi-bank"></v-icon>
        <span>R$ 150,00</span>
      </div>
    </header>

    <div class="input-content">
      <div class="input-box">
        <input
          ref="searchInput"
          type="text"
          v-model="destinoTexto"
          placeholder="Where to?"
        />
      </div>
    </div>

    <div ref="mapRef" class="map"></div>
    
    <div v-if="distancia && tempo" class="box-info">
      <p><strong>Distância:</strong> {{ distancia }}</p>
      <p><strong>Tempo estimado:</strong> {{ tempo }}</p>
    </div>

    <div class="baseboard">
      <router-link to="/home" class="tab">
        <v-icon icon="mdi-home-account"></v-icon>
        <span>Home</span>
      </router-link>

      <router-link to="/profile" class="tab">
        <v-icon icon="mdi-account"></v-icon>
        <span>Profile</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { loadGoogleMaps } from '../composables/useGoogleMaps'

const distancia = ref(null)
const tempo = ref(null)

const origemTexto = ref("")      // <-- Endereço atual
const destinoTexto = ref("")     // <-- Endereço escolhido

const mapRef = ref(null)
const searchInput = ref(null)

let map
let marker
let autocomplete
let directionsService
let directionsRenderer
let userPosition = null

onMounted(async () => {
  const apiKey = 'AIzaSyCoQ58bNGXYgXOMKAlTjPjgrr6_4N2gyY0'
  const google = await loadGoogleMaps(apiKey, ['places'])

  navigator.geolocation.getCurrentPosition(async (pos) => {

    userPosition = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude
    }


    await buscarEnderecoAtual(apiKey)

    iniciarMapa(google)

  }, async () => {

    userPosition = { lat: -20.4697, lng: -54.6201 }

    await buscarEnderecoAtual(apiKey)
    iniciarMapa(google)
  })
})

async function buscarEnderecoAtual(apiKey) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${userPosition.lat},${userPosition.lng}&key=${apiKey}`
  const response = await axios.get(url)

  origemTexto.value = response.data.results[0].formatted_address

  console.log(origemTexto.value)
}

function iniciarMapa(google) {

  map = new google.Map(mapRef.value, {
    center: userPosition,
    zoom: 15
  })

  marker = new google.Marker({
    position: userPosition,
    map,
    title: 'Sua localização'
  })

  directionsService = new google.DirectionsService()
  directionsRenderer = new google.DirectionsRenderer()
  directionsRenderer.setMap(map)

  autocomplete = new google.places.Autocomplete(searchInput.value, {
    fields: ['geometry', 'formatted_address', 'name'],
  })

  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace()
    if (!place.geometry) return

    destinoTexto.value = place.formatted_address

    const destination = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    }

    calcularRota(destination)
  })
}

function calcularRota(destination) {
  directionsService.route(
    {
      origin: userPosition,
      destination: destination,
      travelMode: 'DRIVING'
    },
    (result, status) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(result)

        const distance = result.routes[0].legs[0].distance.text
        const duration = result.routes[0].legs[0].duration.text
        
        distancia.value = distance
        tempo.value = duration
      }
    }
  )
}
</script>

<style>
.map-content {
  width: 100vw;
  height: 100vh;
  position: relative;
}

.map {
  width: 100%;
  height: 100%;
}

.header-map{
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 70px;
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 20px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  z-index: 20;
}

.acount_balance{
  margin-right: 48px;
  background-color: #d3d3d3;
  padding: 8px;
  border-radius: 1rem;
  display: flex;
  align-items: center;
}


.input-content {
  position: absolute;
  top: 80px;
  right: 20px;
  z-index: 10;
  background: white;
  padding: 12px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 260px;
}

.input-box label {
  font-size: 13px;
  font-weight: 600;
}

.input-box input {
  width: 90%;
  padding: 8px;
  margin-top: 2px;
}

.baseboard{
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 80px;
  background: white;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2px 6px rgba(0,0,0,0.1);
  z-index: 20;
}

.baseboard .tab{
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
}

.baseboard img{
  width: 28px;
  height: 28px;
}

.box-info {
  position: absolute;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 12px 18px;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.15);
  z-index: 9999;
}
</style>