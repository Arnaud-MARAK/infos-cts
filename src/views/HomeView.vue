<template>
  <div class="home-view">
    <h1>Page d'Accueil</h1>
    <el-select
      class="select-stop"
      v-model="stopSelected"
      filterable
      remote
      reserve-keyword
      placeholder="Choix de l'arrêt"
      :loading="loading"
    >
      <el-option
        v-for="stop in listStop"
        :key="stop.code"
        :label="stop.name"
        :value="stop.name"
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
      stopSelected2: {} as Stop,
      loading: false,
      baseUrl: api?.baseUrl,
      token: api.token,
      stopSelected: "",
      listStop: [] as Array<Stop>,
      nameStops: [] as Array<string>,
      listSchedule: [] as Array<Schedule>,
    };
  },
  created() {
    this.getStops()
  },
  methods: {
    getStops() {
      this.loading = true
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
          this.loading = false
          // Récupération des noms de chaque station
          // this.listStop.forEach((stop) => {
          //   this.nameStops.push(stop.name);
          // });
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
            var af = a.lineRef;
            var bf = b.lineRef;
            var as = a.destinationName;
            var bs = b.destinationName;
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

.select-stop{
  margin-bottom: 12px;
}

</style>
