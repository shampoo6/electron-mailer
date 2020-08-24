<template>
    <el-table :data="tableData">
        <el-table-column prop="id" label="序号"/>
        <el-table-column prop="status" label="状态"/>
        <el-table-column prop="execTime" label="执行时间"/>
        <el-table-column prop="createTime" label="创建时间"/>
        <el-table-column prop="updateTime" label="更新时间"/>
    </el-table>
</template>

<script>
  import {TaskStatus} from '../utils/task'

  const testData = [
    {
      id: '1',
      execTime: Date.now(),
      status: TaskStatus.Waiting,
      createTime: Date.now(),
      updateTime: Date.now()
    }
  ]

  export default {
    name: 'TaskTable',
    props: {
      tableData: {
        type: Array,
        default: () => {
          return testData
        }
      }
    },
    data () {
      return {
      }
    }
  }
</script>

<style scoped>

</style>
