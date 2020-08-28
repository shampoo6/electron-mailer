<template>
    <div>
        <el-form>
            <el-form-item label="发送时间">
                <el-date-picker
                        @change="changeTime"
                        v-model="execTime"
                        type="datetime"
                        placeholder="选择日期时间">
                </el-date-picker>
            </el-form-item>
        </el-form>
        <MailEditor ref="mailEditor">
            <template slot="footer">
                <el-button type="primary" @click="submit" :loading="loading">
                    {{$route.params.action==='update'?'编辑任务':'添加任务'}}
                </el-button>
                <el-button @click="reset" :loading="loading">重置</el-button>
            </template>
        </MailEditor>
    </div>
</template>

<script>
  import MailEditor from '../../components/MailEditor/MailEditor'
  import dbTemplate from '../../utils/indexedDBTemplate'
  import moment from 'moment'
  import templateTransform from '../../utils/templateTransform'
  import temp from '../../components/MailEditor/template.json'

  export default {
    components: {
      MailEditor
    },
    name: 'TaskEdit',
    mounted () {
      if (this.$route.params.action !== 'create') {
        this.id = this.$route.params.id
        this.execTime = this.$route.params.action === 'update'
          ? new Date(Number(this.$route.params.time))
          : new Date(Number(moment(Number(this.$route.params.time)).add(1, 'd').format('x')))
      }
      this.readTemplate()
    },
    data () {
      return {
        loading: false,
        execTime: null,
        id: null
      }
    },
    methods: {
      readTemplate () {
        let promise
        if (!this.id) {
          promise = Promise.resolve(this.$store.state.Mail.mailTemplate)
        } else {
          this.loading = true
          promise = dbTemplate.get(this.id).then(data => {
            let _promise = Promise.resolve(data.mailTemplate)
            this.loading = false
            return _promise
          })
        }
        promise.then(template => {
          if (this.$route.params.action === 'copy') {
            template.subject = temp.subjectTemplate
            template.content = temp.contentTemplate
          }
          template = templateTransform(template, moment(this.execTime))
          this.$refs.mailEditor.setMailTemplate(template)
        })
      },
      reset () {
        this.$confirm('确定重置邮件模板为预设值么?', '提示', {
          // confirmButtonText: '确定',
          // cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.readTemplate()
          this.$message({
            type: 'success',
            message: '重置成功!'
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          })
        })
      },
      submit () {
        if (this.execTime == null) {
          this.$message.error('请选择执行时间')
          return
        }

        if (moment(this.execTime).isBefore(moment())) {
          this.$message.error('时间已过期')
          return
        }

        this.$refs.mailEditor.getMailTemplate().then(template => {
          this.loading = true
          if (this.$route.params.action === 'update') {
            return dbTemplate.updateTask(this.id, template, this.execTime.getTime())
          } else {
            return dbTemplate.createTask(template, this.execTime.getTime())
          }
        }).then(id => {
          console.log(id)
          this.$message.success('操作成功')
          this.$router.back()
        }).catch(e => {
          console.error(e)
          this.$message.error('操作失败')
        }).finally(() => {
          this.loading = false
        })
      },
      changeTime () {
        let template = this.$store.state.Mail.mailTemplate
        template = templateTransform(template, moment(this.execTime))
        this.$refs.mailEditor.setMailTemplate(template)
      }
    }
  }
</script>

<style scoped>

</style>
