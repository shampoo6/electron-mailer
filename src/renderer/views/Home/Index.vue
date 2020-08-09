<template>
    <div>
        <el-button type="primary" @click="gotoSetting">设置</el-button>
        <el-button type="primary" @click="gotoSendbox">发送邮件</el-button>
        <el-button type="danger" @click="quit">退出</el-button>
    </div>
</template>

<script>
  import {ipcRenderer} from 'electron'
  import eventTopic from '../../../common/eventTopic'

  export default {
    methods: {
      gotoSetting () {
        this.$router.push('/setting')
      },
      gotoSendbox () {
        let configPath = localStorage.getItem('saveConfigDir')
        if (!configPath) {
          this.$message.info('请先进行设置')
        } else {
          this.$router.push('/sendbox')
        }
      },
      quit () {
        ipcRenderer.send(eventTopic.quit)
      }
    }
  }
</script>

<style scoped>

</style>
