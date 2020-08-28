<template>
    <div id="app">
        <router-view/>
    </div>
</template>

<script>
  import EventHandler from './utils/eventHandler'
  import Vue from 'vue'

  export default {
    name: 'electron-mailer',
    created () {
      const eventHandler = new EventHandler(this.$router, this.$store)
      Vue.prototype.$eventHandler = eventHandler.vue
      // 初始化 读取模板
      eventHandler.vue.readTemplate()
    }
  }
</script>

<style>
    /* CSS */
    body {
        padding: 0;
        margin: 0;
    }

    #app {
        background-size: 100%;
        background: url("https://bing.ioliu.cn/v1/rand") no-repeat center center;
    }
</style>
