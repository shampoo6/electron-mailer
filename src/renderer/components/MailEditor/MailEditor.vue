<template>
    <div>
        <el-form ref="mailTemplate" :model="mailTemplate" :rules="rules" label-width="100px">
            <h4>账户信息</h4>
            <el-divider content-position="left"/>
            <el-form-item prop="email" label="寄件邮箱">
                <!-- email -->
                <el-input v-model="mailTemplate.email"/>
            </el-form-item>
            <el-form-item prop="pwd" label="授权密码">
                <!-- pwd -->
                <el-input v-model="mailTemplate.pwd"/>
            </el-form-item>
            <el-form-item prop="smtp" label="smtp服务器">
                <!-- pwd -->
                <el-input v-model="mailTemplate.smtp"/>
            </el-form-item>
            <br/>
            <h4>邮件内容</h4>
            <el-divider content-position="left"/>
            <el-form-item prop="name" label="寄件人姓名">
                <!-- from -->
                <el-input v-model="mailTemplate.name"/>
            </el-form-item>
            <el-form-item prop="to" label="收件人">
                <!-- to -->
                <el-input v-model="mailTemplate.to"/>
            </el-form-item>
            <el-form-item prop="cc" label="抄送">
                <!-- cc -->
                <el-input v-model="mailTemplate.cc"/>
            </el-form-item>
            <el-form-item prop="subject" label="主题">
                <!-- subject -->
                <el-input v-model="mailTemplate.subject"/>
                <el-button size="mini" @click="resetSubject">重置主题</el-button>
            </el-form-item>
            <el-form-item prop="receiver" label="收件人称呼">
                <!-- receiver -->
                <el-input v-model="mailTemplate.receiver"/>
            </el-form-item>
            <el-form-item label="内容模板">
                <quill-editor v-model="mailTemplate.content"
                              ref="myQuillEditor"
                              :options="editorOption"
                              @blur="onEditorBlur"
                              @focus="onEditorFocus"
                              @ready="onEditorReady"
                              @change="onEditorChange"
                >
                </quill-editor>
                <el-button size="mini" @click="resetContentTemplate">重置内容模板</el-button>
            </el-form-item>
            <el-form-item label="签名">
                <quill-editor v-model="mailTemplate.sign"
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
                <slot name="footer"/>
                <!--                <el-button :loading="loading" type="primary" @click="saveTemplate">保存</el-button>-->
                <!--                        <el-button :loading="loading" @click="sendMail">立即发送</el-button>-->
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
  import {quillEditor} from 'vue-quill-editor'
  import {addQuillTitle} from '../../assets/quill-title'
  import template from './template.json'

  const emailRegex = /^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/

  export default {
    components: {
      quillEditor
    },
    name: 'MailEditor',
    created () {
      // 绑定事件
      this.$nextTick(() => {
        this.$refs.myQuillEditor.$el.offsetParent.className = ''
        this.$refs.myQuillEditor.$el.offsetParent.classList = []
        this.$refs.myQuillEditor2.$el.offsetParent.className = ''
        this.$refs.myQuillEditor2.$el.offsetParent.classList = []
      })
    },
    mounted () {
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
          ],
          receiver: [
            {required: true, message: '请输入收件人称呼', trigger: 'blur'}
          ]
        },
        mailTemplate: {
          email: '',
          pwd: '',
          smtp: 'smtp.qiye.163.com',
          name: '',
          to: '',
          cc: '',
          subject: template.subjectTemplate,
          receiver: '',
          content: template.contentTemplate,
          sign: '<h2>I am Example2</h2>'
        },
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
      },
      onEditorFocus (quill) {
      },
      onEditorReady (quill) {
      },
      onEditorChange ({quill, html, text}) {
        this.mailTemplate.content = html
      },
      onEditorBlur2 (quill) {
      },
      onEditorFocus2 (quill) {
      },
      onEditorReady2 (quill) {
      },
      onEditorChange2 ({quill, html, text}) {
        this.mailTemplate.sign = html
      },
      getMailTemplate () {
        return new Promise((resolve, reject) => {
          this.$refs.mailTemplate.validate((valid) => {
            if (!valid) {
              reject(new Error('验证失败'))
            } else {
              resolve(this.mailTemplate)
            }
          })
        })
      },
      setMailTemplate (template) {
        if (template) {
          for (let key in this.mailTemplate) {
            this.mailTemplate[key] = template[key]
          }
        }
      },
      resetContentTemplate () {
        this.mailTemplate.content = template.contentTemplate
      },
      resetSubject () {
        this.mailTemplate.subject = template.subjectTemplate
      }
    }
  }
</script>

<style scoped>

</style>
