<template>
    <div>
        <el-container>
            <el-header style="padding-top:20px;">
                <el-page-header @back="goBack" content="任务管理">
                </el-page-header>
            </el-header>
            <el-main>
                <!--<el-button @click="insert">test insert</el-button>
                <el-button @click="update">test update</el-button>
                <el-button @click="remove">test remove</el-button>
                <el-button @click="list">test list</el-button>-->
                <router-view/>
            </el-main>
            <el-footer>
            </el-footer>
        </el-container>
    </div>
</template>

<script>
  export default {
    name: 'TaskManage',
    methods: {
      goBack () {
        this.$router.back()
      }
      // insert () {
      //   let rs = dbTemplate.createTask(null, Date.now())
      //   console.log(rs)
      //   rs.then(r => {
      //     console.log(r)
      //   }).catch(e => {
      //     console.error(e)
      //   })
      // },
      // update () {
      //   let rs = dbTemplate.updateTask('f4d7b08ece624fff8fd499c437f6e428', {a: 1, b: 2, c: 3}, Date.now())
      //   console.log(rs)
      //   rs.then(r => {
      //     console.log(r)
      //   }).catch(e => {
      //     console.error(e)
      //   })
      // },
      // remove () {
      //   let rs = dbTemplate.remove('f4d7b08ece624fff8fd499c437f6e428')
      //   console.log(rs)
      //   rs.then(() => {
      //   }).catch(e => {
      //     console.error(e)
      //   })
      // },
      // list () {
      //   let rs = dbTemplate.list()
      //   console.log(rs)
      //   rs.then(r => {
      //     console.log(r)
      //   }).catch(e => {
      //     console.error(e)
      //   })
      // }
    }
  }
</script>

<style scoped>

</style>
