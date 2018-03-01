<template>
  <div id="app">
    <boba-nav></boba-nav>
    <router-view/>
  </div>
</template>

<script>
import BobaNav from '@/components/bobanav'

export default {
  components: {
    'boba-nav': BobaNav
  },
  name: 'App'
}
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Varela+Round');

#app {
  font-family: 'Varela Round', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

body {
  background-color: #eacbaf12;
}
</style>
