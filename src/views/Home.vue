<template>
    <div style="width: 80%;margin: 0 auto; padding-top: 50px">
        <el-card>
            <h1 @click="getPdf">成绩查询快速通道</h1>
            <el-form :model="form" label-width="80px" ref="form" style="margin-top: 30px; text-align: left">
<!--                <el-form-item label="选择学期">-->
<!--                    <el-select v-model="semester" placeholder="请选择学期">-->
<!--                        <el-option label="2018-2019-2" value="2018-2019-1"></el-option>-->
<!--                        <el-option label="2019-2020-1" value="2018-2019-2"></el-option>-->
<!--                        <el-option label="2019-2020-2" value="2019-2020-1"></el-option>-->
<!--                        <el-option label="2020-2021-1" value="2019-2020-2"></el-option>-->
<!--                        <el-option label="2020-2021-2" value="2020-2021-1"></el-option>-->
<!--                    </el-select>-->
<!--                </el-form-item>-->
                <el-form-item label="账号">
                    <el-input @keyup.enter.native="login" v-model="form.Account"></el-input>
                </el-form-item>
                <el-form-item label="密码">
                    <el-input @keyup.enter.native="login" show-password type="password" v-model="form.PWD"></el-input>
                </el-form-item>
                <el-form-item label="验证码">
                    <el-input @keyup.enter.native="login" v-model="form.CheckCode"></el-input>
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
            <div id="container" v-html="html">
            </div>
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
                gradesTimer: null,
                pdfCount: 0,
                studentName: '',
                semester: '2020-2021-1', // 学期
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
                    this.$router.go(0)
                    this.$message.error("信息填写错误！")
                }).catch((err) => {
                    if (err.response.status === 404) {
                        localStorage.setItem("username", this.form.Account)
                        localStorage.setItem("password", this.form.PWD)
                        this.getGrades()
                        clearInterval(this.loginTimer)
                    } else if (err.response.status === 503) {
                        this.loginFun()
                    }
                })
            },
            login() {
                this.loginFun()
                this.loginTimer = setInterval(() => {
                    this.loginFun()
                }, 5000)
            },
            getGrades() {
                this.getGradesFun()
                this.gradesTimer = setInterval(() => {
                    this.getGradesFun()
                }, 5000)
            },
            getPdf() {
                let that = this
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
                        PDF.addImage(pageData, 'JPEG', 10, 30, imgWidth, imgHeight)
                    } else {
                        while (leftHeight > 0) {
                            PDF.addImage(pageData, 'JPEG', 10, position, imgWidth, imgHeight)//这里的10是左右边距
                            leftHeight -= pageHeight
                            position -= 828.89
                            if (leftHeight > 0) {
                                PDF.addPage()
                            }
                        }
                    }
                    PDF.save(that.studentName + '的成绩单' + '.pdf')
                })
            },
            getGradesFun() {
                this.$https.get('/api/gnyxy/JWXS/cjcx/jwxs_cjcx_like.aspx?usermain=' + this.form.Account).then(res => {
                    this.loading = false
                    let html = res.data
                    this.studentName = html.split('姓名')[1].split(']')[0].substring(1) // 获取学生姓名
                    let thead = '<h3 style="margin-bottom: 20px">' + this.studentName + '的成绩单（当前学期）</h3>' // 添加表头
                    let h = thead +'<div id'+ '=' + 'ok"' + html.split('ok')[1].split('<table width'+'=')[0]  // 获取成绩表代码
                    let th = h.split('补重学期')[0] + '补重学期</td></tr>' // 获取表头代码
                    let tr = h.split('2019-2020-2') // 前一个学期
                    let tr1 = tr[tr.length - 1].split('tr') // 获取当前学期的成绩代码
                    let gradesCode = '' // 拼接成绩单代码字符串
                    let arr = []
                    // 处理成绩单代码
                    for (let i = 0; i < tr1.length; i++) {
                        if (i % 2 === 0) {
                            if (i > 1) {
                                let str = '<tr' + tr1[i] + 'tr>' // 每一个学科成绩代码
                                // 拿取详细数据
                                let projectCode = str.split('td>')[5].split('<')[0] // 课程代码
                                let project = str.split('td>')[7].split('<')[0] // 课程名称
                                let grades = str.split('td>')[9].split('<')[0] // 成绩
                                let credit = str.split('td>')[11].split('<')[0] // 学分
                                let nature = str.split('td>')[15].split('<')[0] // 课程性质
                                let code = str.split('td>')[1] === '√</'
                                let obj = {
                                    projectCode: projectCode,
                                    project: project,
                                    grades: grades,
                                    credit: credit,
                                    nature: nature,
                                    code: code
                                }
                                arr.push(obj)
                                gradesCode += str
                            }
                        }
                    }
                    thead = '<h3 style="margin: 20px 0">' + this.studentName + '的成绩单（所有成绩）</h3>' // 添加表头
                    h = thead +'<div id'+ '=' + 'ok"' + html.split('ok')[1].split('<table width'+'=')[0]  // 获取成绩表代码
                    this.html = th + gradesCode + '</table>' + h
                    clearInterval(this.gradesTimer)
                    setTimeout(() => {
                        if (this.pdfCount === 0) {
                            this.getPdf()
                            this.pdfCount = 1
                        }
                    }, 200)
                }).catch(err => {
                    if (err) {
                        this.getGradesFun(true)
                    }
                })
            },
        }
    }

</script>
