<template>
    <div>
        <el-form ref="emailSetting" :model="emailSetting" :rules="rules" label-width="100px">
            <h4>综合配置</h4>
            <el-divider content-position="left"/>
            <el-form-item prop="path" label="配置路径">
                <!-- path -->
                <el-input v-model="emailSetting.path"/>
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
            </el-form-item>
        </el-form>
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

  export default {
    components: {
      quillEditor
    },
    name: 'index',
    created () {
      // 绑定事件
      this.addEventListener()
      // 读取配置
      this.readConfig()
    },
    mounted () {
      this.$nextTick(() => {
        this.$refs.myQuillEditor.$el.offsetParent.className = ''
        this.$refs.myQuillEditor.$el.offsetParent.classList = []
      })
      addQuillTitle()
      window.richTextEditor = this.content
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
        loading: true,
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
          name: [
            {required: true, message: '请输入寄件人姓名', trigger: 'blur'}
          ],
          to: [
            {validator: checkEmails, trigger: 'blur'}
          ],
          subject: [
            {required: true, message: '请输入主题', trigger: 'blur'}
          ]
        },
        emailSetting: {
          path: 'd:/electron-mailer-config',
          email: '',
          pwd: '',
          name: '',
          to: '',
          subject: ''
        },
        content: '<h2>I am Example</h2>',
        content2: '<h2>I am Example2</h2>',
        editorOption: {
          // some quill options
        },
        editorOption2: {
          // some quill options
        }
      }
    },
    methods: {
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
        console.log('editor change!', quill, html, text)
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
        console.log('editor change!', quill, html, text)
        this.content2 = html
      },
      addEventListener () {
        ipcRenderer.on(eventTopic.readConfig, (_, saveConfig) => {
          this.loading = false
          if (!saveConfig) return
          for (let key in this.emailSetting) {
            this.emailSetting[key] = saveConfig[key]
          }
          this.content = saveConfig.content
          this.content2 = saveConfig.sign
        })
        ipcRenderer.on(eventTopic.saveConfig, (_, error, path) => {
          this.loading = false
          if (error) {
            this.$message.error('保存失败')
            console.error(error)
          } else {
            this.$message.success('保存成功')
            localStorage.setItem('saveConfigDir', path)
          }
        })
      },
      readConfig () {
        let path = localStorage.getItem('saveConfigDir')
        if (path) this.emailSetting.path = path
        ipcRenderer.send(eventTopic.readConfig, this.emailSetting.path)
      },
      saveConfig () {
        // 验证
        // this.$refs.emailSetting.validate((valid) => {
        //   if (valid) {
        // 获取config
        this.loading = true
        let config = {}
        for (let key in this.emailSetting) {
          config[key] = this.emailSetting[key]
        }
        config.content = this.content
        config.sign = this.content2
        ipcRenderer.send(eventTopic.saveConfig, config)
        // }
        // })
      }
    },
    computed: {
      editor () {
        return this.$refs.myQuillEditor.quill
      }
    },
    beforeDestroy () {
      ipcRenderer.removeAllListeners(eventTopic.saveConfig)
      ipcRenderer.removeAllListeners(eventTopic.readConfig)
    }
  }
</script>

<style scoped>
</style>
