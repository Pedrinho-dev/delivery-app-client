
<template>
    
    <div class="destination-container">

        <div class="inputs-box">
            <div class="input-group">
                <label>Sua Localização atual</label>
                <input type="text" v-model="currentLocation" readonly>
            </div>

            <div class="input-group">
                <label>Para onde voce quer ir</label>
                <input type="text" v-model="destinationLocation" readonly>
            </div>
        </div>

        <button class="confirm-button" @click="goToNextStep">
            Confirmar
        </button>

    </div>
</template>

<script setup>
import { ref } from 'vue';

const currentLocation = ref ("")
const destinationLocation = ref ("")

currentLocation.value = history.state?.origin || ""
destinationLocation.value = history.state?.destination || ""

const goToNextStep = () =>{
    alert("Destino confirmado!")
}

</script>

<style scoped>
.destination-container {
  width: 100vw;
  height: 100vh;
  background: #f5f5f5;
  position: relative;
  padding-top: 80px;
}

.inputs-box {
  width: 90%;
  margin: 20px auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.input-group label {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 5px;
  display: block;
}

.input-group input {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  outline: none;
  font-size: 16px;
}

.confirm-button {
  position: fixed;
  bottom: 140px; /* acima do rodapé */
  left: 50%;
  transform: translateX(-50%);
  width: 85%;
  padding: 16px;
  font-size: 17px;
  background: #1F75FE;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 3px 6px rgba(0,0,0,0.2);
}
</style>