<template>
  <div class="container">
    <div class="col">
      <google-map v-bind:center="gMap.center" v-bind:zoom="gMap.zoom" style=" height: 390px" class="g-map" ref="map" :options="gMap.options">

        <google-info-window v-bind:options="infoWindow.options" v-bind:position="infoWindow.position" v-bind:opened="infoWindow.open" v-on:closeclick="infoWindow.open=false">
          <div class="info-window">
            <a v-bind:href="infoWindow.place.url" class="place-url">
              <strong>
                {{infoWindow.place.name}}
              </strong>
            </a>
            <hr class="hr">
            <div class="formatted-address">
              <strong>{{infoWindow.place.formatted_address}}</strong>
            </div>

            <div>{{infoWindow.place.formatted_phone_number}}</div>

            <a v-bind:href="infoWindow.place.website">Website</a>

            <div v-if="infoWindow.place.rating">
              {{infoWindow.place.rating}}/5
            </div>

            <div v-if="infoWindow.place.opening_hours.open_now" class="open">Open</div>
            <div v-else class="closed">Closed</div>
          </div>

        </google-info-window>

        <google-marker v-bind:key="index" v-for="(marker, index) in gMap.markers" v-bind:position="marker.position" v-bind:clickable="true" v-on:click.stopPropagation()="toggleInfoWindow(marker,index);"></google-marker>

      </google-map>
    </div>

    <div class="text-center container form">
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
      </form>
    </div>
  </div>
</template>

<script>
import * as VueGoogleMaps from 'vue2-google-maps';
import Vue from 'vue';

Vue.use(VueGoogleMaps, {
  load: {
    key: 'AIzaSyC5VC6RZzQe84X7bFJUL3rJc-ZKIgrvw2c',
    libraries: 'places'
  }
});

// https://dribbble.com/shots/3279692-WIP-Find-top-class-Sport-Instructors-or-Gyms-nearby
// Concept for results mobile

// https://dribbble.com/shots/4283139-Find-Medical-Urgent-Care-Location
// Concept for dekstop

export default {
  components: {
    'google-map': VueGoogleMaps.Map,
    'google-marker': VueGoogleMaps.Marker,
    'google-info-window': VueGoogleMaps.InfoWindow
  },
  data() {
    return {
      gMap: {
        center: { lat: 38.0, lng: -97.0 },
        zoom: 4,
        markers: [],
        circle: null,
        options: {
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false
        }
      },
      infoWindow: {
        name: '',
        position: { lat: 0, lng: 0 },
        open: false,
        options: { pixelOffset: { width: 0, height: -35 }, maxWidth: 225 },
        index: null,
        place: {
          name: '',
          opening_hours: {}
        },
        photos: null
      },
      userAddress: '',
      userRadius: '804',
      type: ''
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
        if (status == 'OK') {
          this.gMap.center = results[0].geometry.location;

          this.gMap.circle = new google.maps.Circle({
            strokeColor: '#FF0000',
            strokeOpacity: 0,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0,
            map: this.$refs.map.$mapObject,
            center: this.gMap.center,
            radius: Number(this.userRadius)
          });

          var request = {
            location: results[0].geometry.location,
            // radius: 200,
            query: 'milk tea',
            rankBy: google.maps.places.RankBy.DISTANCE
          };

          service.textSearch(request, (results, status) => {
            if (status == 'OK') {
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
                    'No results found.\nPlease enter a new location or increase your search radius'
                  );
                }, 500);
              }
            } else {
              alert(
                'Places search was not successful for the following reason: ' +
                  status
              );
            }
          });
        } else {
          alert(
            'Geocode was not successful for the following reason: ' + status
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
            alert('Geocoder failed.');
          }
        );
      } else {
        alert('Geolocation is not supported by this browser.');
      }
    },

    toggleInfoWindow: function(marker, index) {
      const service = new google.maps.places.PlacesService(
        this.$refs.map.$mapObject
      );

      service.getDetails({ placeId: marker.place_id }, (place, status) => {
        if (status == 'OK') {
          console.log(place);
          this.infoWindow.open = true;
          this.infoWindow.position = marker.position;
          this.infoWindow.index = index;

          this.infoWindow.place = place;

          var photo = this.infoWindow.place.photos[0].getUrl({
            maxHeight: 500,
            maxWidth: 500
          });
          console.log(photo);

          this.$refs.map.panTo({lat: marker.position.lat() + .001, lng: marker.position.lng()});
        }
      });
    },

    test: function() {
      console.log('test');
    }
  },
  mounted() {
    // Apply border-radius of .vue-map after it has loaded
    var vueMap = document.querySelector('.vue-map');
    vueMap.setAttribute('style', 'border-radius: 0.3rem');
  }
};
</script>

<style>
textarea:hover,
input:hover,
textarea:active,
input:active,
textarea:focus,
input:focus,
button:focus,
button:active,
button:hover,
label:focus,
.btn:active,
.btn.active {
  outline: 0px !important;
  -webkit-appearance: none;
}

.form-control:focus {
  border-color: #cccccc;
  -webkit-box-shadow: none;
  box-shadow: none;
}

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
  color: #6e777e;
}

#user-address:focus,
#user-radius:focus {
  border-bottom-color: #4caaf5;
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

.place-url {
  color: #4caaf5;
  font-size: 16px;
}

.info-window {
  font-size: 14px;
}

.info-window .hr {
  margin: 6px 0;
}

</style>
