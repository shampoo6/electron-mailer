<template>
    <div>
        <el-container>
            <el-header style="padding-top:20px;">
                <el-page-header @back="goBack" content="任务管理">
                </el-page-header>
            </el-header>
            <el-main>
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
    }
  }
</script>

<style scoped>

</style>
