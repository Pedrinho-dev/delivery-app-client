<template>
    <div class="finding-driver-container">

        <v-app-bar color="#181e36" density="comfortable" elevation="2">
            <v-toolbar-title class="text-body-1 font-weight-medium">
                Waiting for Transporter Confirmation
            </v-toolbar-title>
        </v-app-bar>


        <div ref="mapRef" class="map"></div>


        <v-bottom-sheet class="info-sheet" model-value persistent>
            <v-card color="#181e36" rounded="xl">
                <v-card-text class="pa-6">

                    <v-card color="#101326" rounded="lg" class="mb-4">
                        <v-card-text class="py-4">

                            <v-list-item class="px-0">
                                <template v-slot:prepend>
                                    <v-avatar color="#00E676" size="12"></v-avatar>
                                </template>
                                <v-list-item-title class="text-caption text-grey-lighten-1 mb-1">
                                    Origin
                                </v-list-item-title>
                                <v-list-item-subtitle class="text-body-2 text-white">
                                    {{ origin }}
                                </v-list-item-subtitle>
                            </v-list-item>


                            <v-divider class="my-2 ml-1" color="#2e3a59" thickness="2"
                                style="width: 2px; height: 20px; margin-left: 18px !important;">
                            </v-divider>


                            <v-list-item class="px-0">
                                <template v-slot:prepend>
                                    <v-icon icon="mdi-map-marker" color="#ef5350" size="20"></v-icon>
                                </template>
                                <v-list-item-title class="text-caption text-grey-lighten-1 mb-1">
                                    Destination
                                </v-list-item-title>
                                <v-list-item-subtitle class="text-body-2 text-white">
                                    {{ destination }}
                                </v-list-item-subtitle>
                            </v-list-item>
                        </v-card-text>
                    </v-card>


                    <div class="text-center py-6">
                        <h3 class="text-h6 font-weight-bold mb-6">Finding Driver</h3>


                        <div class="car-animation-container mx-auto">
                            <v-sheet color="transparent" class="road-container">
                                <v-sheet color="#2e3a59" class="road-segment" v-for="i in 7" :key="i" height="2"
                                    width="20"></v-sheet>
                            </v-sheet>
                            <v-avatar class="car-icon" color="transparent" size="40">
                                <v-icon icon="mdi-car-side" color="#00E676" size="32"></v-icon>
                            </v-avatar>
                        </div>

                        <p class="text-body-2 text-grey-lighten-1 mt-6">
                            Please wait while we find a driver for you
                        </p>
                    </div>


                    <v-row dense class="mt-4">
                        <v-col cols="12">
                            <v-btn color="#00E676" block size="large" rounded="xl" elevation="0"
                                class="text-black font-weight-bold" @click="retry">
                                Retry
                            </v-btn>
                        </v-col>
                        <v-col cols="12">
                            <v-btn color="#ef5350" block size="large" rounded="xl" variant="outlined"
                                class="font-weight-bold" @click="cancelTransport">
                                Cancel Transport
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </v-bottom-sheet>

        <BaseboardMenu />
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { loadGoogleMaps } from "@/composables/useGoogleMaps";
import { useTransportStore } from "@/stores/transport";
import { useAddressStore } from "@/stores/addressStores";
import BaseboardMenu from "@/components/BaseboardMenu.vue";
import api from "@/axios/api";

const router = useRouter();
const transportStore = useTransportStore();
const addressStore = useAddressStore();

const mapRef = ref(null);
const origin = ref("");
const destination = ref("");
const orderId = ref(null);
let pollingInterval = null;

let map;

onMounted(async () => {

    origin.value =
        transportStore.origin?.address ||
        addressStore.origin?.address ||
        "Loading...";
    destination.value =
        transportStore.destination?.address ||
        addressStore.destination?.address ||
        "Loading...";

    const apiKey = "AIzaSyCoQ58bNGXYgXOMKAlTjPjgrr6_4N2gyY0";
    const google = await loadGoogleMaps(apiKey, ["places"]);

    const originCoords =
        transportStore.origin ||
        addressStore.origin || { lat: -20.4697, lng: -54.6201 };
    const destinationCoords =
        transportStore.destination ||
        addressStore.destination || { lat: -20.4611, lng: -54.6056 };

    // Calcular centro entre origem e destino
    const centerLat = (originCoords.lat + destinationCoords.lat) / 2;
    const centerLng = (originCoords.lng + destinationCoords.lng) / 2;

    // Inicializar mapa
    map = new google.Map(mapRef.value, {
        center: { lat: centerLat, lng: centerLng },
        zoom: 13,
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

    // Iniciar polling para verificar status do pedido
    startPolling();
});

onUnmounted(() => {
    // Limpar intervalo ao sair da página
    if (pollingInterval) {
        clearInterval(pollingInterval);
    }
});

async function startPolling() {
    // Verificar status a cada 3 segundos
    pollingInterval = setInterval(async () => {
        await checkOrderStatus();
    }, 1000);
}

async function checkOrderStatus() {
    try {
        const userId = localStorage.getItem("userId");

        // Buscar os pedidos do usuário
        const response = await api.get(`/order?idClient=${userId}`);

        if (response.data && response.data.length > 0) {
            // Pegar o pedido mais recente
            const latestOrder = response.data[response.data.length - 1];

            // Verificar se foi aceito
            if (latestOrder.accept === true) {
                // Parar o polling
                if (pollingInterval) {
                    clearInterval(pollingInterval);
                }

                // Salvar ID do pedido aceito
                orderId.value = latestOrder._id;

                // Navegar para tela de pedido aceito
                router.push('/acceptorder');
            }
        }
    } catch (error) {
        console.error("Erro ao verificar status do pedido:", error);
    }
}

function retry() {
    console.log("Retrying to find driver...");
    // Reiniciar o polling se necessário
    if (!pollingInterval) {
        startPolling();
    }
}

function cancelTransport() {

    if (pollingInterval) {
        clearInterval(pollingInterval);
    }

    transportStore.setScheduleType(null);
    router.push("/home");
}
</script>

<style scoped>
.finding-driver-container {
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


.car-animation-container {
    position: relative;
    width: 280px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.road-container {
    position: absolute;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;
}

.road-segment {
    border-radius: 2px;
}

.car-icon {
    position: absolute;
    animation: moveCar 3s ease-in-out infinite;
    filter: drop-shadow(0 2px 4px rgba(0, 230, 118, 0.3));
}

@keyframes moveCar {
    0% {
        left: -40px;
    }

    50% {
        left: calc(100% - 20px);
    }

    50.1% {
        transform: scaleX(-1);
    }

    100% {
        left: -40px;
        transform: scaleX(-1);
    }
}
</style>