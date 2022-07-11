<template>
  <div id="app">
    <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
    <!-- <Menu msg="Menu"/> -->
    <Main msg="Main"/>

  </div>
</template>

<script>
import Main from './components/Main.vue'
import Menu from './components/Menu.vue'

export default {
  name: 'app',
  components: {
    Main,
    Menu
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
body { 
  margin: 0;
  overflow: hidden;
}
</style>
