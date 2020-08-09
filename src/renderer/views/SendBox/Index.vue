<template>
    <div>
        <el-container>
            <el-header style="padding-top:20px;">
                <el-page-header @back="goBack" content="发送邮件">
                </el-page-header>
            </el-header>
            <el-main>
                <h4>邮件内容</h4>
                <el-divider content-position="left"/>
                <quill-editor v-model="content"
                              ref="myQuillEditor"
                              :options="editorOption"
                              @blur="onEditorBlur"
                              @focus="onEditorFocus"
                              @ready="onEditorReady"
                              @change="onEditorChange"
                >
                </quill-editor>
            </el-main>
            <el-footer>
                <el-button :loading="loading" type="primary" @click="sendMail">发送</el-button>
            </el-footer>
        </el-container>
    </div>
</template>

<script>
  import 'quill/dist/quill.core.css'
  import 'quill/dist/quill.snow.css'
  import 'quill/dist/quill.bubble.css'

  import {quillEditor} from 'vue-quill-editor'
  import {addQuillTitle} from '../../assets/quill-title'
  import {ipcRenderer} from 'electron'
  import eventTopic from '../../../common/eventTopic'

  const saveConfigDir = 'saveConfigDir'

  export default {
    name: 'Index',
    components: {
      quillEditor
    },
    created () {
      this.addEventListener()
      this.readConfig()
    },
    mounted () {
      addQuillTitle()
    },
    data () {
      return {
        loading: false,
        configPath: 'd:/electron-mailer-config',
        content: '',
        editorOption: {}
      }
    },
    methods: {
      addEventListener () {
        ipcRenderer.on(eventTopic.sendMail, (_, error) => {
          this.loading = false
          if (error) {
            console.error(error)
            this.$message.error('邮件发送失败')
          } else {
            this.$message.success('邮件发送成功')
          }
        })
      },
      readConfig () {
        // let path = localStorage.getItem(saveConfigDir)
        // if (path) this.configPath = path
        // ipcRenderer.send(eventTopic.readConfig, this.configPath)
        let config = this.$store.state.MailConfig.mailConfig
        this.content = config.content
      },
      goBack () {
        this.$router.back()
      },
      onEditorBlur (quill) {
        console.log('editor blur!', quill)
      },
      onEditorFocus (quill) {
        console.log('editor focus!', quill)
      },
      onEditorReady (quill) {
        console.log('editor ready!', quill)
      },
      onEditorChange ({quill, html, text}) {
        // console.log('editor change!', quill, html, text)
        this.content = html
      },
      sendMail () {
        let configPath = localStorage.getItem(saveConfigDir)
        if (!configPath) {
          this.$message.error('请先进行设置')
          return
        }
        this.loading = true
        ipcRenderer.send(eventTopic.sendMail, configPath, this.content)
      }
    },
    beforeDestroy () {
      ipcRenderer.removeAllListeners(eventTopic.readConfig)
    }
  }
</script>

<style scoped>

</style>
