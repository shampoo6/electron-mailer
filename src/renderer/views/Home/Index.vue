<template>
    <div class="container" :style="{height: height}">
        <div class="item">
            <el-button type="primary" @click="gotoSetting">设置模板</el-button>
        </div>
        <div class="item">
            <el-button type="primary" @click="gotoSendMail">发送邮件</el-button>
        </div>
        <div class="item">
            <el-button type="danger" @click="quit">退出</el-button>
        </div>
    </div>
</template>

<script>
  export default {
    mounted () {
      document.body.style.overflow = 'hidden'
      this.height = window.innerHeight + 'px'
      window.onresize = () => {
        this.height = window.innerHeight + 'px'
      }
    },
    data () {
      return {
        height: window.innerHeight
      }
    },
    methods: {
      gotoSetting () {
        this.$router.push('/setting')
      },
      gotoSendMail () {
        this.$router.push('/sendMail')
      },
      quit () {
        this.$eventHandler.quit()
      }
    },
    beforeDestroy () {
      window.onresize = null
      document.body.style.overflow = 'scroll'
    }
  }
</script>

<style scoped>
    .container {
        text-align: center;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .item {
        padding-top: 10px;
        padding-bottom: 10px;
    }
</style>
