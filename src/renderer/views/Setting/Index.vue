<template>
    <div>
        <el-container>
            <el-header style="padding-top:20px;">
                <el-page-header @back="goBack" content="设置">
                </el-page-header>
            </el-header>
            <el-main>
                <el-form ref="emailSetting" :model="emailSetting" :rules="rules" label-width="100px">
                    <h4>综合配置</h4>
                    <el-divider content-position="left"/>
                    <el-form-item prop="path" label="配置路径">
                        <!-- path -->
                        <el-input v-model="emailSetting.path"/>
                    </el-form-item>
                    <el-form-item prop="time" label="闹钟">
                        <el-time-picker
                                v-model="emailSetting.time"
                                :picker-options="{selectableRange: '00:00:00 - 23:59:59'}"
                                placeholder="任意时间点">
                        </el-time-picker>
                    </el-form-item>
                    <br/>
                    <h4>账户信息</h4>
                    <el-divider content-position="left"/>
                    <el-form-item prop="email" label="寄件邮箱">
                        <!-- email -->
                        <el-input v-model="emailSetting.email"/>
                    </el-form-item>
                    <el-form-item prop="pwd" label="授权密码">
                        <!-- pwd -->
                        <el-input v-model="emailSetting.pwd"/>
                    </el-form-item>
                    <el-form-item prop="smtp" label="smtp服务器">
                        <!-- pwd -->
                        <el-input v-model="emailSetting.smtp"/>
                    </el-form-item>
                    <br/>
                    <h4>邮件内容</h4>
                    <el-divider content-position="left"/>
                    <el-form-item prop="name" label="寄件人姓名">
                        <!-- from -->
                        <el-input v-model="emailSetting.name"/>
                    </el-form-item>
                    <el-form-item prop="to" label="收件人">
                        <!-- to -->
                        <el-input v-model="emailSetting.to"/>
                    </el-form-item>
                    <el-form-item prop="cc" label="抄送">
                        <!-- cc -->
                        <el-input v-model="emailSetting.cc"/>
                    </el-form-item>
                    <el-form-item prop="subject" label="主题">
                        <!-- subject -->
                        <el-input v-model="emailSetting.subject"/>
                    </el-form-item>
                    <el-form-item label="内容模板">
                        <quill-editor v-model="content"
                                      ref="myQuillEditor"
                                      :options="editorOption"
                                      @blur="onEditorBlur"
                                      @focus="onEditorFocus"
                                      @ready="onEditorReady"
                                      @change="onEditorChange"
                        >
                        </quill-editor>
                    </el-form-item>
                    <el-form-item label="签名">
                        <quill-editor v-model="content2"
                                      ref="myQuillEditor2"
                                      :options="editorOption2"
                                      @blur="onEditorBlur2"
                                      @focus="onEditorFocus2"
                                      @ready="onEditorReady2"
                                      @change="onEditorChange2"
                        >
                        </quill-editor>
                    </el-form-item>
                    <el-form-item>
                        <el-button :loading="loading" type="primary" @click="saveConfig">保存</el-button>
                        <el-button :loading="loading" @click="sendMail">立即发送</el-button>
                    </el-form-item>
                </el-form>
            </el-main>
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

  const emailRegex = /^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/
  const saveConfigDir = 'saveConfigDir'

  export default {
    components: {
      quillEditor
    },
    name: 'index',
    created () {
      // 绑定事件
      this.addEventListener()
      this.$nextTick(() => {
        this.$refs.myQuillEditor.$el.offsetParent.className = ''
        this.$refs.myQuillEditor.$el.offsetParent.classList = []
        this.$refs.myQuillEditor2.$el.offsetParent.className = ''
        this.$refs.myQuillEditor2.$el.offsetParent.classList = []
      })
    },
    mounted () {
      // 读取配置
      this.readConfig()
      addQuillTitle()
    },
    data () {
      const checkEmail = (_, value, callback) => {
        if (!value || value.trim() === '') {
          return callback(new Error('请输入寄件人地址'))
        }
        if (emailRegex.test(value.trim())) {
          callback()
        } else {
          callback(new Error('请输入有效邮箱地址'))
        }
      }
      const checkEmails = (_, value, callback) => {
        if (!value || value.trim() === '') {
          return callback(new Error('请输入收件人地址'))
        }
        let emails = value.split(',')
        for (let email of emails) {
          if (!emailRegex.test(email.trim())) {
            return callback(new Error('请输入有效邮箱地址'))
          }
        }
        callback()
      }
      return {
        loading: false,
        rules: {
          path: [
            {required: true, message: '请输入保存配置的路径', trigger: 'blur'}
          ],
          email: [
            {validator: checkEmail, trigger: 'blur'}
          ],
          pwd: [
            {required: true, message: '请输入授权密码', trigger: 'blur'}
          ],
          smtp: [
            {required: true, message: '请输入smtp服务器地址', trigger: 'blur'}
          ],
          name: [
            {required: true, message: '请输入寄件人姓名', trigger: 'blur'}
          ],
          to: [
            {validator: checkEmails, trigger: 'blur'}
          ],
          cc: [
            {validator: checkEmails, trigger: 'blur'}
          ],
          subject: [
            {required: true, message: '请输入主题', trigger: 'blur'}
          ]
        },
        emailSetting: {
          path: 'd:/electron-mailer-config',
          time: new Date(),
          email: '',
          pwd: '',
          smtp: 'smtp.qiye.163.com',
          name: '',
          to: '',
          cc: '',
          subject: ''
        },
        content: '<h2>I am Example</h2>',
        content2: '<h2>I am Example2</h2>',
        editorOption: {
          // some quill options
        },
        editorOption2: {
          // some quill options
        },
        _config: null
      }
    },
    methods: {
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
      onEditorBlur2 (quill) {
        console.log('editor blur!', quill)
      },
      onEditorFocus2 (quill) {
        console.log('editor focus!', quill)
      },
      onEditorReady2 (quill) {
        console.log('editor ready!', quill)
      },
      onEditorChange2 ({quill, html, text}) {
        // console.log('editor change!', quill, html, text)
        this.content2 = html
      },
      addEventListener () {
        // ipcRenderer.on(eventTopic.readConfig, (_, saveConfig) => {
        //   this.loading = false
        //   if (!saveConfig) return
        //   for (let key in this.emailSetting) {
        //     this.emailSetting[key] = saveConfig[key]
        //   }
        //   this.content = saveConfig.content
        //   this.content2 = saveConfig.sign
        //   this.emailSetting.time = new Date(saveConfig.time)
        // })
        ipcRenderer.on(eventTopic.saveConfig, (_, error, path) => {
          this.loading = false
          if (error) {
            this.$message.error('保存失败')
            console.error(error)
          } else {
            this.$message.success('保存成功')
            localStorage.setItem(saveConfigDir, path)
            this.$store.dispatch('saveMailConfig', this._config)
            this._config = null
          }
        })
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
        if (!this.$store.state.MailConfig || !this.$store.state.MailConfig.mailConfig) return
        let config = this.$store.state.MailConfig.mailConfig
        if (config.mail === '') return
        for (let key in this.emailSetting) {
          this.emailSetting[key] = config[key]
        }
        this.content = config.content
        this.content2 = config.sign
        this.emailSetting.time = new Date(config.time)
      },
      saveConfig () {
        // 验证
        this.$refs.emailSetting.validate((valid) => {
          if (valid) {
            // 获取config
            this.loading = true
            let config = {}
            for (let key in this.emailSetting) {
              config[key] = this.emailSetting[key]
            }
            config.content = this.content
            config.sign = this.content2
            config.time = this.emailSetting.time ? this.emailSetting.time.getTime() : new Date().getTime()
            this._config = config
            ipcRenderer.send(eventTopic.saveConfig, this._config)
          }
        })
      },
      sendMail () {
        let configPath = localStorage.getItem(saveConfigDir)
        if (!configPath) {
          this.$message.error('请先保存设置')
          return
        }
        this.loading = true
        ipcRenderer.send(eventTopic.sendMail, configPath, this.content)
      }
    },
    computed: {
      editor () {
        return this.$refs.myQuillEditor.quill
      }
    },
    beforeDestroy () {
      ipcRenderer.removeAllListeners(eventTopic.saveConfig)
    }
  }
</script>

<style scoped>
</style>
