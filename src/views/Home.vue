<template>
    <div style="width: 80%;margin: 0 auto; padding-top: 50px">
        <el-card>
            <h1 @click="getPdf">成绩查询快速通道</h1>
            <el-form :model="form" label-width="80px" ref="form" style="margin-top: 30px; text-align: left">
                <el-form-item label="账号">
                    <el-input v-model="form.Account" @keyup.enter.native="login"></el-input>
                </el-form-item>
                <el-form-item label="密码">
                    <el-input v-model="form.PWD" type="password" show-password @keyup.enter.native="login"></el-input>
                </el-form-item>
                <el-form-item label="验证码">
                    <el-input v-model="form.CheckCode" @keyup.enter.native="login"></el-input>
                </el-form-item>
                <el-form-item label="">
                    <el-image :src="url"></el-image>
                </el-form-item>
                <el-form-item style="font-size: 12px; text-align: center">
                    <div :disabled="loading" @click="login" class="btn-l" style="width: 40%" v-loading="loading">获取成绩
                    </div>
                    <div @click="reload" class="btn-r" style="width: 40%">刷新页面</div>
                </el-form-item>
            </el-form>
            <div id="container" v-html="html"></div>
        </el-card>
    </div>
</template>

<script>
    import html2canvas from 'html2canvas'
    import JsPDf from 'jspdf'

    export default {
        name: "GmuGrades",
        data() {
            return {
                url: '/api/gnyxy/other/CheckCode.aspx?datetime=az',
                html: '',
                form: {
                    __VIEWSTATE: '/wEPDwUKMTI5NDMzMjQzMQ9kFgICAw9kFgQCDw8PFgIeBFRleHQFAzgxNmRkAhEPDxYCHwBlZGQYAQUeX19Db250cm9sc1JlcXVpcmVQb3N0QmFja0tleV9fFgEFB0Noa1VzZXJd6KN0sYLKOpO0Kdz4nykyPFI6Dg==',
                    __VIEWSTATEGENERATOR: 'BB6E7284',
                    Account: '',
                    PWD: '',
                    CheckCode: '',
                    selType: 3,
                    cmdok: ''
                },
                loading: false,
                loginTimer: null,
                gradesTimer: null
            }
        },
        mounted() {
            this.initData()
        },
        methods: {
            reload() {
                this.$router.go(0)
            },
            initData() {
                this.form.Account = localStorage.getItem("username")
                this.form.PWD = localStorage.getItem("password")
            },
            loginFun() {
                this.loading = true
                this.$https.post('/api/gnyxy/login.aspx', this.$qs.stringify(this.form)).then(() => {
                    console.log("hello world")
                    this.$router.go(0)
                    this.$message.error("信息填写错误！")
                }).catch((err) => {
                    console.log(err)
                    console.log(err.response)
                    console.log(err.response.status)
                    if (err.response.status === 404) {
                        localStorage.setItem("username", this.form.Account)
                        localStorage.setItem("password", this.form.PWD)
                        // this.$router.push('/about')
                        this.getGrades()
                        clearInterval(this.loginTimer)
                    } else if (err.response.status === 503) {
                        this.loginFun(true)
                    }
                })
            },
            login() {
                this.loginFun(false)
                this.loginTimer = setInterval(() => {
                    this.loginFun(true)
                }, 5000)
            },
            getGradesFun() {
                this.$https.get('/api/gnyxy/JWXS/cjcx/jwxs_cjcx_like.aspx?usermain=' + this.form.Account).then(res => {
                    this.loading = false
                    this.html = res.data
                    clearInterval(this.gradesTimer)
                    setTimeout(() => {
                        this.getPdf()
                    },200)
                }).catch(err => {
                    console.log(err.response.status)
                    if (err) {
                        this.getGradesFun(true)
                    }
                })
            },
            getGrades() {
                this.getGradesFun()
                this.gradesTimer = setInterval(() => {
                    this.getGradesFun()
                }, 5000)
            },
            getPdf () {
                let title = this.form.Account
                let targetDom = document.getElementById('container')
                html2canvas(targetDom,
                    {
                        allowTaint: true,
                        taintTest: false
                    }
                ).then(function (canvas) {
                    // document.body.appendChild(canvas)
                    let contentWidth = canvas.width
                    let contentHeight = canvas.height
                    let pageHeight = contentWidth / 592.28 * 841.89
                    let leftHeight = contentHeight
                    let position = 0
                    let imgWidth = 575.28
                    let imgHeight = 592.28 / contentWidth * contentHeight
                    let pageData = canvas.toDataURL('image/jpeg', 1.0)
                    let PDF = new JsPDf('', 'pt', 'a4')
                    if (leftHeight < pageHeight) {
                        PDF.addImage(pageData, 'JPEG', 10, 10, imgWidth, imgHeight)
                    } else {
                        while (leftHeight > 0) {
                            PDF.addImage(pageData, 'JPEG', 10, position, imgWidth, imgHeight)//这里的10是左右边距
                            leftHeight -= pageHeight
                            position -= 841.89
                            if (leftHeight > 0) {
                                PDF.addPage()
                            }
                        }
                    }
                    PDF.save(title + '.pdf')
                })
            },
        }
    }
</script>

<style>
    .btn-l {
        display: inline-block;
        height: 35px;
        line-height: 35px;
        color: #FFFFFF !important;
        border-color: #1E9FFF !important;
        background: #1E9FFF !important;
        margin-right: 10%;
        border-radius: 3px;
        box-sizing: border-box;
    }

    .btn-r {
        display: inline-block;
        height: 35px;
        line-height: 35px;
        margin-left: 10%;
        color: #1E9FFF !important;
        border: 1px solid #a8daff;
        background: #FFFFFF !important;
        border-radius: 3px;
        box-sizing: border-box;
    }
</style>