<template>
    <div>
        <el-row>
            <el-button icon="el-icon-plus" @click="toAdd">添加任务</el-button>
        </el-row>
        <el-row>
            <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
                <el-tab-pane label="进行中" name="running">
                    <el-card shadow="always">
                        <div slot="header">
                            <span>进行中任务</span>
                        </div>
                        <div v-if="running">
                            <div class="text item">
                                id：{{running.id}}
                            </div>
                            <div class="text item">
                                发送时间：{{running.execTime|timeFormat}}
                            </div>
                            <div class="text item">
                                <el-button size="mini" @click="toEdit">编辑</el-button>
                                <el-button size="mini" type="danger" @click="remove(running.id)">删除</el-button>
                            </div>
                        </div>
                        <div v-if="!running">
                            无任务
                        </div>
                    </el-card>
                </el-tab-pane>
                <el-tab-pane label="等待中" name="waiting">
                    <TaskTable :table-data="waiting" @remove="remove"/>
                </el-tab-pane>
                <el-tab-pane label="已完成" name="done">
                    <TaskTable :table-data="done" @remove="remove"/>
                </el-tab-pane>
            </el-tabs>
        </el-row>
    </div>
</template>

<script>
  import TaskTable from '../../components/TaskTable'
  import dbTemplate from '../../utils/indexedDBTemplate'
  import {TaskStatus} from '../../utils/task'
  import vueEventTopic from '../../utils/vueEventTopic'

  export default {
    components: {
      TaskTable
    },
    name: 'List',
    created () {
      this.list()
      this.$eventHandler.$on(vueEventTopic.scanTaskRefresh, () => {
        this.list()
      })
    },
    data () {
      return {
        activeName: 'running',
        running: null,
        waiting: [],
        done: []
      }
    },
    methods: {
      list () {
        this.running = null
        this.waiting.splice(0, this.waiting.length)
        this.done.splice(0, this.done.length)
        dbTemplate.list().then(list => {
          // list[5].status = TaskStatus.Running
          list.forEach(task => {
            if (task.status === TaskStatus.Running) {
              this.running = task
            } else if (task.status === TaskStatus.Waiting) {
              this.waiting.push(task)
            } else {
              this.done.push(task)
            }
          })
        })
      },
      handleClick (tab, event) {
      },
      toAdd () {
        this.$router.push('/taskManage/edit/create/new/new')
      },
      toEdit () {
        this.$router.push(`/taskManage/edit/update/${this.running.id}/${this.running.execTime}`)
      },
      remove (id) {
        this.$confirm('确定删除任务么?', '提示', {
          // confirmButtonText: '确定',
          // cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          dbTemplate.remove(id).then(() => {
            this.list()
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          })
        })
      }
    }
  }
</script>

<style scoped>
    .text {
        font-size: 14px;
    }

    .item {
        margin-bottom: 18px;
    }
</style>
