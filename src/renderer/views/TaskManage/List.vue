<template>
    <div>
        <el-row>
            按钮
        </el-row>
        <el-row>
            <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
                <el-tab-pane label="用户管理" name="first">
                    <TaskTable/>
                </el-tab-pane>
                <el-tab-pane label="配置管理" name="second">
                    <TaskTable/>
                </el-tab-pane>
                <el-tab-pane label="角色管理" name="third">
                    <TaskTable/>
                </el-tab-pane>
                <el-tab-pane label="定时任务补偿" name="fourth">
                    <TaskTable/>
                </el-tab-pane>
            </el-tabs>
        </el-row>
    </div>
</template>

<script>
  import TaskTable from '../../components/TaskTable'

  export default {
    components: {
      TaskTable
    },
    name: 'List',
    data () {
      return {
        activeName: ''
      }
    },
    methods: {
      handleClick (tab, event) {
        console.log(tab, event)
      }
    }
  }
</script>

<style scoped>

</style>
