<template>
    <el-table :data="tableData" border stripe :default-sort="{prop: 'updateTime', order: 'descending'}">
        <el-table-column prop="id" label="序号"/>
        <el-table-column prop="status" label="状态">
            <template slot-scope="scope">
                {{translateMap[scope.row.status]}}
            </template>
        </el-table-column>
        <el-table-column prop="execTime" label="执行时间" sortable>
            <template slot-scope="scope">
                {{scope.row.execTime|timeFormat}}
            </template>
        </el-table-column>
        <el-table-column label="星期几" sortable>
            <template slot-scope="scope">
                {{scope.row.execTime|dayFormat}}
            </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" sortable>
            <template slot-scope="scope">
                {{scope.row.createTime|timeFormat}}
            </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" sortable>
            <template slot-scope="scope">
                {{scope.row.updateTime|timeFormat}}
            </template>
        </el-table-column>
        <el-table-column label="操作">
            <template slot-scope="scope">
                <el-button size="mini" @click="toEdit(scope.row.id, scope.row.execTime)">编辑</el-button>
                <el-button size="mini" @click="copy(scope.row.id, scope.row.execTime)">复制</el-button>
                <el-button size="mini" type="danger" @click="remove(scope.row.id)">删除</el-button>
            </template>
        </el-table-column>
    </el-table>
</template>

<script>
  import {TaskStatus} from '../utils/task'
  import moment from 'moment'

  const statusTranslate = {
    success: '执行成功',
    failure: '执行失败',
    waiting: '等待执行',
    running: '正在执行'
  }

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
        translateMap: statusTranslate
      }
    },
    methods: {
      toEdit (id, execTime) {
        this.$router.push(`/taskManage/edit/update/${id}/${execTime}`)
      },
      copy (id, execTime) {
        this.$router.push(`/taskManage/edit/copy/${id}/${execTime}`)
      },
      remove (id) {
        this.$emit('remove', id)
      }
    },
    filters: {
      dayFormat (value) {
        return moment(value).format('dddd')
      }
    }
  }
</script>

<style scoped>

</style>
