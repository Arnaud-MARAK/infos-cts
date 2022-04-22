<template>
  <div class="schedules-by-lign-component">
    <div
      class="test"
      v-for="item in scheduleByLineList"
      :key="item.name"
    >
      <card-schedule
        :name="item.name"
        :lineRef="item.lineRef"
        :vehicleMod="item.vehicleMod"
        :schedules="item.schedules"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

import Schedule from '@/class/schedule';
import CardSchedule from '@/components/CardSchedule.vue'

export default defineComponent({
  name: 'SchedulesByLign',
  components: {
    CardSchedule
  },
  props: {
    schedules: {
      type: Array,
      default: () => [],
    },
  },
  data: function () {
    return {
    };
  },
  setup(props) {
		let scheduleByLineList = computed(() => {
      let schedulesByLineObject = {} as any
      for(let i = 0; i < props.schedules.length; i++){
        let schedule = props.schedules[i] as Schedule

        let destinationName = schedule.destinationName
        let ref = schedule.ref
        let lineRef = schedule.lineRef
        let vehicleMod = schedule.vehicleMod

        if(schedulesByLineObject[ref]){
          schedulesByLineObject[ref].schedules.push(schedule.expectedArrived)
        } else {
          schedulesByLineObject[ref] = {
            name: destinationName,
            lineRef: lineRef,
            vehicleMod: vehicleMod,
            schedules: [schedule.expectedArrived],
          }
        }
      }
      let list = [] as Array<any>

      Object.entries(schedulesByLineObject).forEach(([key, value]) => {
        list.push(value)
      })

      return list
		})

		return {
			scheduleByLineList
		}
	},
});
</script>

<style scoped>
.schedules-by-lign-component{
  /* border: solid blue; */
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
</style>