<template>
  <div class="google-map" :id="mapName"></div>
</template>

<script>
export default {
  name: 'google-map',
  props: ['name'],
  data() {
    return {
      mapName: this.name + '-map',
      markerCoordinates: [
        {
          latitude: 51.501527,
          longitude: -0.1921837
        },
        {
          latitude: 51.505874,
          longitude: -0.1838486
        },
        {
          latitude: 51.4998973,
          longitude: -0.202432
        }
      ]
    };
  },
  mounted() {
    const element = document.getElementById(this.mapName);
    const options = {
      zoom: 14,
      center: new google.maps.LatLng(51.501527, -0.1921837)
    };
    const map = new google.maps.Map(element, options);

    this.markerCoordinates.forEach(coord => {
      const position = new google.maps.LatLng(coord.latitude, coord.longitude);
      const marker = new google.maps.Marker({
        position,
        map
      });
    });
  }
};
</script>

<style scoped>
.google-map {
  width: 800px;
  height: 400px;
  margin: 20px auto;
  background: gray;
}
</style>
