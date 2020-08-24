<template>
    <div>
        <el-container>
            <el-header style="padding-top:20px;">
                <el-page-header @back="goBack" content="发送邮件">
                </el-page-header>
            </el-header>
            <el-main>
                <MailEditor ref="mailEditor">
                    <template slot="footer">
                        <el-button :loading="loading" type="primary" @click="sendMail">发送</el-button>
                    </template>
                </MailEditor>
            </el-main>
            <el-footer>
            </el-footer>
        </el-container>
    </div>
</template>

<script>
  import MailEditor from '../../components/MailEditor'
  import vueEventTopic from '../../utils/vueEventTopic'

  export default {
    name: 'Index',
    components: {
      MailEditor
    },
    mounted () {
      this.readTemplate()
      this.initEvent()
    },
    data () {
      return {
        loading: false
      }
    },
    methods: {
      initEvent () {
        this.$eventHandler.$on(vueEventTopic.sendMailOver, err => {
          if (err) {
            console.error(err)
            this.$message.error('发送失败')
          } else {
            this.$message.success('发送成功')
          }
          this.loading = false
        })
      },
      goBack () {
        this.$router.back()
      },
      readTemplate () {
        let template = this.$store.state.Mail.mailTemplate
        this.$refs.mailEditor.setMailTemplate(template)
      },
      sendMail () {
        this.$refs.mailEditor.getMailTemplate().then(template => {
          this.loading = true
          this.$eventHandler.sendMail(template)
        }).catch(reason => {
          console.error(reason)
        })
      }
    }
  }
</script>

<style scoped>

</style>
