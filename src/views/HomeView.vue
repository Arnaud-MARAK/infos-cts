<template>
  <div class="home-view">
    <h1>Page d'Accueil</h1>
    <el-select
      class="input-form select-stop"
      v-model="stopSelected"
      filterable
      remote
      reserve-keyword
      placeholder="Arrêt*"
      :loading="loadingStop"
    >
      <el-option
        v-for="stop in listStop"
        :key="stop.code"
        :label="stop.name"
        :value="stop.name"
      />
    </el-select>
    <div class="input-form select-time">
      <el-time-picker
        v-model="time"
        placeholder="Horaire"
        format="HH:mm"
        clearable
      />
    </div>
    <el-select
      class="input-form select-vehicle"
      v-model="vehicleMod"
      filterable
      remote
      clearable
      reserve-keyword
      placeholder="Véhicule"
    >
      <el-option
        v-for="v in listVehicles"
        :key="v"
        :label="v"
        :value="v"
      />
    </el-select>
    <el-button
      type="primary"
      @click="getNextPassagesFromStop"
      :disabled="stopSelected == ''"
    >
      Récupérer les prochains passages
    </el-button>
    <schedules-by-lign v-if="listSchedule[0] != null" :schedules="listSchedule" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Stop from "@/class/stop";
import PhysicalStop from "@/class/physicalStop";
import Schedule from "@/class/schedule";
import api from "@/constants/api";
import SchedulesByLign from '@/components/SchedulesByLign.vue'

export default defineComponent({
  name: 'HomeView',
  components: {
    SchedulesByLign,
  },
  data: function () {
    return {
      loadingStop: false,
      baseUrl: api?.baseUrl,
      token: api.token,
      stopSelected: "",
      time: null as unknown as Date,
      vehicleMod: "",
      listStop: [] as Array<Stop>,
      listSchedule: [] as Array<Schedule>,
      listVehicles: ['Bus', 'Tram']
    };
  },
  created() {
    this.getStops()
  },
  methods: {
    getStops() {
      this.loadingStop = true
      let url = this.baseUrl + "v1/siri/2.0/stoppoints-discovery";
      let authString = `${this.token}:${this.token}`;
      let headers = new Headers();
      headers.set("Authorization", "Basic " + btoa(authString));
      fetch(url, { method: "GET", headers: headers })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          let stops = data.StopPointsDelivery.AnnotatedStopPointRef;

          // Réinitialisation de la liste de stations
          this.listStop.splice(0, this.listStop.length);
          // Rassemblement de tout les arrêts physiques en une station
          for (let i = 0; i < stops.length; i++) {
            // On vérifie que l'arrêt n'a pas déjà été traité
            let alreadyHere = false;
            for (let j = 0; j < this.listStop.length; j++) {
              if (stops[i].StopName == this.listStop[j].name) {
                alreadyHere = true;
              }
            }
            if (!alreadyHere) {
              let physicalStops: PhysicalStop[] = [];
              let ps = new PhysicalStop(
                stops[i].Extension.StopCode,
                stops[i].StopPointRef,
                stops[i].Location.Longitude,
                stops[i].Location.Latitude,
                stops[i].Extension.IsFlexhopStop
              );
              physicalStops.push(ps);
              // On recherche les autres arrêt physique d'une même station
              for (let k = 0; k < stops.length; k++) {
                if (
                  stops[i].StopName == stops[k].StopName &&
                  stops[i].StopPointRef != stops[k].StopPointRef
                ) {
                  let ps = new PhysicalStop(
                    stops[k].Extension.StopCode,
                    stops[k].StopPointRef,
                    stops[k].Location.Longitude,
                    stops[k].Location.Latitude,
                    stops[k].Extension.IsFlexhopStop
                  );
                  physicalStops.push(ps);
                }
              }
              let stop = new Stop(
                stops[i].Extension.LogicalStopCode,
                stops[i].StopName,
                physicalStops
              );
              this.listStop.push(stop);
            }
          }
          // Tri des stations par nom
          this.listStop.sort((a, b) =>
            a.name > b.name ? 1 : b.name > a.name ? -1 : 0
          );
          this.loadingStop = false
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    getNextPassagesFromStop(){
      if (this.stopSelected == "") {
        return;
      }

      let url = this.baseUrl + "v1/siri/2.0/stop-monitoring";
      let authString = `${this.token}:${this.token}`;
      let headers = new Headers();
      headers.set('Authorization', 'Basic ' + btoa(authString))
      
      // On récupère les différents arrêt physique de la station choisie
      this.listStop.forEach(stop => {
        if(stop.name == this.stopSelected){
          url = stop.getUrlRefs(url)
        }
      })

      if(this.time){
        let time = this.time.toLocaleTimeString().substring(0, 5)
        url += "&StartTime=2022-04-22T" + time + ":00"
      }

      if(this.vehicleMod !== ""){
        url += "&VehicleMode=" + this.vehicleMod.toLowerCase()
      }


      fetch(url,{method: 'GET', headers: headers})
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        let schedules = data.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit

        // Réinitialisation de la liste d'horaires
        this.listSchedule.splice(0,this.listSchedule.length)

        // Traîtement des données reçu pour créer les Schedule nécessaires
        for(let i = 0; i < schedules.length; i++){
          let schedule = new Schedule(
            schedules[i].StopCode,
            schedules[i].MonitoringRef,
            this.stopSelected,
            schedules[i].MonitoredVehicleJourney.VehicleMode,
            schedules[i].MonitoredVehicleJourney.DestinationName,
            schedules[i].MonitoredVehicleJourney.DestinationShortName,
            schedules[i].MonitoredVehicleJourney.LineRef,
            schedules[i].MonitoredVehicleJourney.MonitoredCall.ExpectedArrivalTime
          )
          this.listSchedule.push(schedule)
        }

        this.sortSchedulesByTwoValues();
      })
      .catch(function(error) {
        console.log(error);
      });
    },
    sortSchedulesByTwoValues() {
      this.listSchedule.sort(function (a, b) {
        let af = a.lineRef;
        let bf = b.lineRef;
        let as = a.destinationName;
        let bs = b.destinationName;
        if(af == bf) {
            return (as < bs) ? -1 : (as > bs) ? 1 : 0;
        } else {
            return (af < bf) ? -1 : 1;
        }
      });
    }
  }
});
</script>

<style scoped>
.home-view{
  display: flex;
  flex-direction: column;
  align-items: center;
}

.input-form{
  margin-bottom: 12px;
}

</style>
