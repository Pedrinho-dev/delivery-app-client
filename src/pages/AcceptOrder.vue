<template>
    <div class="accept-order-container">
        <!-- Header -->
        <v-app-bar color="#181e36" density="comfortable" elevation="2">
            <v-btn icon="mdi-chevron-left" @click="$router.push('/home')" color="white"></v-btn>
            <v-toolbar-title class="text-body-1 font-weight-medium">
                Transport Confirmed
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-chip color="#00E676" text-color="black" class="font-weight-bold">
                <v-icon icon="mdi-currency-usd" start></v-icon>
                {{ price }}
            </v-chip>
        </v-app-bar>

        <!-- Map -->
        <div ref="mapRef" class="map"></div>

        <!-- Driver Info Card -->
        <v-card class="driver-card" color="#181e36" rounded="xl" elevation="8">
            <v-card-text class="pa-4">
                <!-- Driver Info -->
                <div class="d-flex align-center mb-4">
                    <v-avatar size="56" class="mr-3">
                        <v-img :src="driverInfo.photo || 'https://via.placeholder.com/56'" alt="Driver"></v-img>
                    </v-avatar>
                    <div class="flex-grow-1">
                        <h3 class="text-h6 font-weight-bold text-white">
                            {{ driverInfo.name }}
                        </h3>
                        <p class="text-caption text-grey-lighten-1">
                            {{ driverInfo.plate }}
                        </p>
                    </div>
                    <v-btn icon color="#00E676" size="large" @click="callDriver">
                        <v-icon icon="mdi-phone"></v-icon>
                    </v-btn>
                </div>

                <!-- Addresses -->
                <v-card color="#101326" rounded="lg" class="mb-4">
                    <v-card-text class="py-3">
                        <!-- Origin -->
                        <v-list-item class="px-0">
                            <template v-slot:prepend>
                                <v-avatar color="#00E676" size="12"></v-avatar>
                            </template>
                            <v-list-item-title class="text-caption text-grey-lighten-1 mb-1">
                                {{ isFinalRoute ? 'Your Location' : 'Driver Location' }}
                            </v-list-item-title>
                            <v-list-item-subtitle class="text-body-2 text-white">
                                {{ currentOrigin }}
                            </v-list-item-subtitle>
                        </v-list-item>

                        <!-- Divider -->
                        <v-divider class="my-2 ml-1" color="#2e3a59" thickness="2"
                            style="width: 2px; height: 20px; margin-left: 18px !important"></v-divider>

                        <!-- Destination -->
                        <v-list-item class="px-0">
                            <template v-slot:prepend>
                                <v-icon icon="mdi-map-marker" color="#ef5350" size="20"></v-icon>
                            </template>
                            <v-list-item-title class="text-caption text-grey-lighten-1 mb-1">
                                {{ isFinalRoute ? 'Final Destination' : 'Pickup Location' }}
                            </v-list-item-title>
                            <v-list-item-subtitle class="text-body-2 text-white">
                                {{ currentDestination }}
                            </v-list-item-subtitle>
                        </v-list-item>
                    </v-card-text>
                </v-card>

                <!-- Status Message -->
                <v-alert v-if="isFinalRoute" type="success" color="#00E676" variant="tonal" density="compact"
                    class="mb-4">
                    <template v-slot:prepend>
                        <v-icon icon="mdi-check-circle"></v-icon>
                    </template>
                    Driver picked you up! Heading to destination.
                </v-alert>
                <v-alert v-else type="info" color="#2196F3" variant="tonal" density="compact" class="mb-4">
                    <template v-slot:prepend>
                        <v-icon icon="mdi-car"></v-icon>
                    </template>
                    Driver is on the way to pick you up!
                </v-alert>

                <!-- Cancel Button -->
                <v-btn color="#ef5350" block size="large" rounded="xl" elevation="0" class="font-weight-bold"
                    @click="cancelTransport">
                    Cancel Transport
                </v-btn>
            </v-card-text>
        </v-card>

        <BaseboardMenu />
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { loadGoogleMaps } from "@/composables/useGoogleMaps";
import { useTransportStore } from "@/stores/transport";
import { useAddressStore } from "@/stores/addressStores";
import BaseboardMenu from "@/components/BaseboardMenu.vue";
import api from "@/axios/api";

const router = useRouter();
const transportStore = useTransportStore();
const addressStore = useAddressStore();

const mapRef = ref(null);
const currentOrigin = ref("");
const currentDestination = ref("");
const price = ref("120");
const isFinalRoute = ref(false);

const driverInfo = ref({
    name: "Gregory Smith",
    plate: "1ABC234",
    photo: null,
});

let map;
let directionsService;
let directionsRenderer;
let driverMarker;
let clientMarker;
let destinationMarker;
let pollingInterval = null;


const clientLocation = ref(null);
const destinationLocation = ref(null);
const driverLocation = ref(null);
const orderId = ref(null);

onMounted(async () => {
    await loadOrderData();

    const apiKey = "AIzaSyCoQ58bNGXYgXOMKAlTjPjgrr6_4N2gyY0";
    const google = await loadGoogleMaps(apiKey, ["places"]);

    await initializeMap(google);


    startPolling();
});

onUnmounted(() => {
    if (pollingInterval) {
        clearInterval(pollingInterval);
    }
});

async function loadOrderData() {
    try {
        const userId = localStorage.getItem("userId");
        const response = await api.get(`/order?idClient=${userId}`);

        if (response.data && response.data.length > 0) {
            const latestOrder = response.data[response.data.length - 1];
            orderId.value = latestOrder._id;


            isFinalRoute.value = latestOrder.finalLoc || false;


            await geocodeAddresses(latestOrder);


            if (isFinalRoute.value) {

                currentOrigin.value = latestOrder.clientLoc || "Loading...";
                currentDestination.value = latestOrder.destinyLoc || "Loading...";
            } else {
      
                currentOrigin.value = latestOrder.locDeliveryMan || "Driver Location";
                currentDestination.value = latestOrder.clientLoc || "Loading...";
            }
        }
    } catch (error) {
        console.error("Erro ao carregar dados do pedido:", error);
    }
}

async function geocodeAddresses(order) {
    const apiKey = "AIzaSyCoQ58bNGXYgXOMKAlTjPjgrr6_4N2gyY0";

    try {
   
        if (order.clientLoc) {
            const clientResponse = await axios.get(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(order.clientLoc)}&key=${apiKey}`
            );
            if (clientResponse.data.results[0]) {
                const location = clientResponse.data.results[0].geometry.location;
                clientLocation.value = { lat: location.lat, lng: location.lng };
            }
        } else if (addressStore.origin) {
            clientLocation.value = addressStore.origin;
        }


        if (order.destinyLoc) {
            const destResponse = await axios.get(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(order.destinyLoc)}&key=${apiKey}`
            );
            if (destResponse.data.results[0]) {
                const location = destResponse.data.results[0].geometry.location;
                destinationLocation.value = { lat: location.lat, lng: location.lng };
            }
        } else if (addressStore.destination) {
            destinationLocation.value = addressStore.destination;
        }

    
        if (order.locDeliveryMan) {
            const driverResponse = await axios.get(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(order.locDeliveryMan)}&key=${apiKey}`
            );
            if (driverResponse.data.results[0]) {
                const location = driverResponse.data.results[0].geometry.location;
                driverLocation.value = { lat: location.lat, lng: location.lng };
            }
        } else {
     
            driverLocation.value = { lat: -20.4650, lng: -54.6180 };
        }
    } catch (error) {
        console.error("Erro ao geocodificar endereços:", error);

        if (!clientLocation.value) {
            clientLocation.value = addressStore.origin || { lat: -20.4697, lng: -54.6201 };
        }
        if (!destinationLocation.value) {
            destinationLocation.value = addressStore.destination || { lat: -20.4611, lng: -54.6056 };
        }
        if (!driverLocation.value) {
            driverLocation.value = { lat: -20.4650, lng: -54.6180 };
        }
    }
}

async function initializeMap(google) {

    let centerLat, centerLng;

    if (isFinalRoute.value) {
        
        centerLat = (clientLocation.value.lat + destinationLocation.value.lat) / 2;
        centerLng = (clientLocation.value.lng + destinationLocation.value.lng) / 2;
    } else {
      
        centerLat = (driverLocation.value.lat + clientLocation.value.lat) / 2;
        centerLng = (driverLocation.value.lng + clientLocation.value.lng) / 2;
    }

    map = new google.Map(mapRef.value, {
        center: { lat: centerLat, lng: centerLng },
        zoom: 14,
        disableDefaultUI: true,
        styles: [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            {
                featureType: "road",
                elementType: "geometry",
                stylers: [{ color: "#38414e" }],
            },
            {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#17263c" }],
            },
        ],
    });

 
    createMarkers(google);


    directionsService = new google.DirectionsService();
    directionsRenderer = new google.DirectionsRenderer({
        map: map,
        suppressMarkers: true,
        polylineOptions: {
            strokeColor: "#00E676",
            strokeWeight: 4,
        },
    });


    drawRoute();
}

function createMarkers(google) {
 
    if (!isFinalRoute.value) {
        driverMarker = new google.Marker({
            position: driverLocation.value,
            map,
            title: "Driver",
            icon: {
                path: google.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: "#00E676",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
            },
        });
    }

 
    clientMarker = new google.Marker({
        position: clientLocation.value,
        map,
        title: isFinalRoute.value ? "Your Location" : "Pickup Location",
        icon: {
            path: google.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#2196F3",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
        },
    });


    destinationMarker = new google.Marker({
        position: destinationLocation.value,
        map,
        title: "Final Destination",
        icon: {
            path: google.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#ef5350",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
        },
    });
}

function drawRoute() {
    let origin, destination;

    if (isFinalRoute.value) {
        origin = clientLocation.value;
        destination = destinationLocation.value;
    } else {

        origin = driverLocation.value;
        destination = clientLocation.value;
    }

    directionsService.route(
        {
            origin: origin,
            destination: destination,
            travelMode: "DRIVING",
        },
        (result, status) => {
            if (status === "OK") {
                directionsRenderer.setDirections(result);
            } else {
                console.error("Directions request failed:", status);
            }
        }
    );
}

async function startPolling() {

    pollingInterval = setInterval(async () => {
        await checkFinalLocStatus();
    }, 3000);
}

async function checkFinalLocStatus() {
    try {
        if (!orderId.value) return;

        const response = await api.get(`/order/${orderId.value}`);
        const order = response.data;


        if (order.finalLoc === true && !isFinalRoute.value) {
            isFinalRoute.value = true;


            currentOrigin.value = order.clientLoc;
            currentDestination.value = order.destinyLoc;

        
            if (driverMarker) {
                driverMarker.setMap(null);
                driverMarker = null;
            }

       
            drawRoute();

          
            const centerLat = (clientLocation.value.lat + destinationLocation.value.lat) / 2;
            const centerLng = (clientLocation.value.lng + destinationLocation.value.lng) / 2;
            map.setCenter({ lat: centerLat, lng: centerLng });
        }
    } catch (error) {
        console.error("Erro ao verificar status finalLoc:", error);
    }
}

function callDriver() {
    console.log("Calling driver...");
    // TODO: Implementar chamada telefônica
}

async function cancelTransport() {
    if (pollingInterval) {
        clearInterval(pollingInterval);
    }

    try {
        if (orderId.value) {
            await api.delete(`/order/${orderId.value}`);
        }
        router.push("/home");
    } catch (error) {
        console.error("Erro ao cancelar transporte:", error);
        router.push("/home");
    }
}
</script>

<style scoped>
.accept-order-container {
    width: 100vw;
    height: 100vh;
    position: relative;
    background-color: #101326;
    overflow: hidden;
}

.map {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
}

.driver-card {
    position: absolute;
    bottom: 100px;
    left: 16px;
    right: 16px;
    z-index: 10;
    max-width: 500px;
    margin: 0 auto;
}
</style>