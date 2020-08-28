<template>
    <div>
        <el-container>
            <el-header style="padding-top:20px;">
                <el-page-header @back="goBack" content="设置">
                </el-page-header>
            </el-header>
            <el-main>
                <MailEditor ref="mailEditor">
                    <template slot="footer">
                        <el-button :loading="loading" type="primary" @click="saveTemplate">保存</el-button>
                    </template>
                </MailEditor>
            </el-main>
        </el-container>
    </div>
</template>

<script>
  import 'quill/dist/quill.core.css'
  import 'quill/dist/quill.snow.css'
  import 'quill/dist/quill.bubble.css'

  import vueEventTopic from '../../utils/vueEventTopic'
  import MailEditor from '../../components/MailEditor/MailEditor'

  export default {
    components: {
      MailEditor
    },
    name: 'index',
    mounted () {
      // 读取配置
      this.readTemplate()
    },
    data () {
      return {
        loading: false
      }
    },
    methods: {
      goBack () {
        this.$router.back()
      },
      readTemplate () {
        let template = this.$store.state.Mail.mailTemplate
        this.$refs.mailEditor.setMailTemplate(template)
      },
      saveTemplate () {
        this.$refs.mailEditor.getMailTemplate().then(template => {
          // 获取config
          this.loading = true
          let config = Object.assign({}, template)
          this.$eventHandler.$once(vueEventTopic.saveTemplateOver, err => {
            this.loading = false
            if (err) {
              console.error(err)
              this.$message.error('保存失败')
            } else {
              // 保存到store
              this.$store.dispatch('a_saveMailTemplate', config)
              this.$message.success('保存成功')
            }
          })
          this.$eventHandler.saveTemplate(config)
        }).catch(() => {
          this.$message.error('验证未通过，请检查信息')
        })
      }
    }
  }
</script>

<style scoped>
</style>
