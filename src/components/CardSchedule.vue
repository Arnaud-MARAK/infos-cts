<template>
  <el-card class="card-schedule">
    <p class="title-card">{{ lineRef }} - {{ name }} <span class="title-vehicle">({{ vehicleMod }})</span></p>
    <div class="times-container">
      <p class="time" v-for="schedule in schedules" :key="schedule">
        {{ schedule.substring(11,19) }}
      </p>
    </div>
  </el-card>
</template>

<script lang="ts">

export default {
name: 'CardSchedule',
props: {
    schedules: {
      type: Array,
      default: () => [],
    },
    name: {
      type: String,
      default: "",
    },
    lineRef: {
      type: String,
      default: "",
    },
    vehicleMod: {
      type: String,
      default: ""
    }
  },
  data: function () {
    return {
      stopSelected: ""
    };
  }
}
</script>

<style scoped>
.card-schedule{
  /* border: solid red; */
  margin: 8px;
  max-width: 400px;
}

.title-card{
  font-weight: bold;
  /* display: flex; */
  /* justify-content: start; */
}
.title-vehicle{
  color: rgb(110, 110, 110);
}
.times-container{
  /* border: solid red; */
  display: flex;
  flex-wrap: wrap;
}

.time{
  /* border: solid blue; */
  margin: 6px;
}
</style>
