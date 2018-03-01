<template>
  <div class="container">
    <div class="col">
      <google-map v-bind:center="gMap.center" v-bind:zoom="gMap.zoom" style=" height: 390px" class="g-map" ref="map">

        <google-info-window v-bind:options="infoWindow.options" v-bind:position="infoWindow.position" v-bind:opened="infoWindow.open" v-on:closeclick="infoWindow.open=false">
          <div>
            <strong>{{infoWindow.content}}</strong>
          </div>

          <div v-if="infoWindow.opening_hours.open_now" class="open">Open</div>
          <div v-else class="closed">Closed</div>

          <a href="#" v-on:click="deleteMarker">Delete</a>
        </google-info-window>

        <google-marker v-bind:key="index" v-for="(marker, index) in gMap.markers" v-bind:position="marker.position" v-bind:clickable="true" v-on:click.stopPropagation()="toggleInfoWindow(marker,index);"></google-marker>

      </google-map>
    </div>

    <div class="text-center container">
      <form v-on:submit.prevent="getAddress">
        <div class="form-row justify-content-center">
          <div class="col-6 col-md-4 mb-2">
            <input v-model="userAddress" id="user-address" class="marker-input form-control" type="text" placeholder="Address" required>
          </div>
          <div class="col-6 col-md-3 mb-2">
            <select v-model="userRadius" id="user-radius" class="form-control">
              <option value="804" selected>1 mile</option>
              <option value="4023">5 miles</option>
              <option value="8046">10 miles</option>
              <option value="20116">25 miles</option>
            </select>
          </div>
          <div class="col-md-2">
            <button type="submit" class="btn btn-block btn-primary">Submit</button>
          </div>
        </div>
        <!-- <div class="row justify-content-center mb-1">
          <input type="text" class="form-control marker-input" placeholder="Restuaraunt" required>
        </div> -->
      </form>
    </div>
  </div>
</template>

<script>
import * as VueGoogleMaps from "vue2-google-maps";
import Vue from "vue";

Vue.use(VueGoogleMaps, {
  load: {
    key: "AIzaSyC5VC6RZzQe84X7bFJUL3rJc-ZKIgrvw2c",
    libraries: "places"
  }
});

export default {
  components: {
    "google-map": VueGoogleMaps.Map,
    "google-marker": VueGoogleMaps.Marker,
    "google-info-window": VueGoogleMaps.InfoWindow
  },
  data() {
    return {
      gMap: {
        center: { lat: 38.0, lng: -97.0 },
        zoom: 4,
        markers: [],
        circle: null
      },
      infoWindow: {
        content: "",
        position: { lat: 0, lng: 0 },
        open: false,
        options: { pixelOffset: { width: 0, height: -35 } },
        index: null,
        opening_hours: {}
      },
      userAddress: "",
      userRadius: "804",
      type: ""
    };
  },
  methods: {
    getAddress: function() {
      const geocoder = new google.maps.Geocoder();
      const bounds = new google.maps.LatLngBounds();
      const service = new google.maps.places.PlacesService(
        this.$refs.map.$mapObject
      );

      this.gMap.markers = [];
      if (this.gMap.circle) {
        this.gMap.circle.setMap(null);
        this.gMap.circle = null;
      }

      geocoder.geocode({ address: this.userAddress }, (results, status) => {
        if (status == "OK") {
          this.gMap.center = results[0].geometry.location;

          this.gMap.circle = new google.maps.Circle({
            strokeColor: "#FF0000",
            strokeOpacity: 0,
            strokeWeight: 2,
            fillColor: "#FF0000",
            fillOpacity: 0,
            map: this.$refs.map.$mapObject,
            center: this.gMap.center,
            radius: Number(this.userRadius)
          });

          var request = {
            location: results[0].geometry.location,
            // radius: 200,
            query: "milk tea",
            rankBy: google.maps.places.RankBy.DISTANCE
          };

          service.textSearch(request, (results, status) => {
            if (status == "OK") {
              for (let result of results) {
                if (
                  this.gMap.circle
                    .getBounds()
                    .contains(result.geometry.location)
                ) {
                  this.gMap.markers.push({
                    position: result.geometry.location,
                    name: result.name,
                    id: result.id,
                    place_id: result.place_id,
                    types: result.types,
                    rating: result.rating,
                    opening_hours: result.opening_hours
                  });
                }
              }
              if (this.gMap.markers.length >= 1) {
                for (let marker of this.gMap.markers) {
                  bounds.extend(marker.position);
                }
                this.$refs.map.$mapObject.fitBounds(bounds);
              } else {
                this.$refs.map.$mapObject.fitBounds(
                  this.gMap.circle.getBounds()
                );
                setTimeout(() => {
                  alert(
                    "No results found.\nPlease enter a new location or increase your search radius"
                  );
                }, 500);
              }
            } else {
              alert(
                "Places search was not successful for the following reason: " +
                  status
              );
            }
          });
        } else {
          alert(
            "Geocode was not successful for the following reason: " + status
          );
        }
      });
    },

    locateUser: function() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            this.gMap.center.lat = position.coords.latitude;
            this.gMap.center.lng = position.coords.longitude;
            this.gMap.zoom = 12;
          },
          () => {
            alert("Geocoder failed.");
          }
        );
      } else {
        alert("Geolocation is not supported by this browser.");
      }
    },

    toggleInfoWindow: function(marker, index) {
      this.infoWindow.open = true;
      this.infoWindow.position = marker.position;
      this.infoWindow.index = index;

      this.infoWindow.content = marker.name;
      this.infoWindow.opening_hours = marker.opening_hours;

      this.$refs.map.panTo(marker.position);
    },

    deleteMarker: function() {
      this.$delete(this.gMap.markers, this.infoWindow.index);
      this.infoWindow.open = false;
    },
    
    test: function() {
      console.log('test');
    }
  },
  mounted() {
    // Apply border-radius of .vue-map after it has loaded
    var vueMap = document.querySelector(".vue-map");
    vueMap.setAttribute("style", "border-radius: 0.3rem");
  }
};
</script>

<style scoped>
.g-map {
  margin: 10px auto;
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.16), 0 2px 10px 0 rgba(0, 0, 0, 0.12);
  border-radius: 0.3rem;
}

.open {
  color: green;
}

.closed {
  color: red;
}

#user-address,
#user-radius {
  background-color: transparent;
  border: none;
  border-radius: 0;
  border-bottom: 2px solid #6e777eb5;
  -webkit-appearance: none;
  color: #6e777e
}

#user-address:focus,
#user-radius:focus {
  border-bottom-color:#4caaf5;
}

#user-radius {
  -webkit-appearance: none;
  -moz-appearance: none;
  background: url(../assets/down-arrow.png) 97% / 8% no-repeat;
}

.btn-primary {
  background-color: #4caaf5;
  border-color: #4caaf5;
}
</style>
