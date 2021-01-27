/**axios封装
 * 请求拦截、相应拦截、错误统一处理
 */
import axios from 'axios'
// import {Message} from "element-ui";

// axios.defaults.baseURL = 'http://localhost:8099';
// axios.defaults.baseURL = 'http://123.56.84.99:8099';
axios.defaults.baseURL = '/api';

// 请求超时时间
axios.defaults.timeout = 300000;

// post请求头
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';

// 请求拦截器
axios.interceptors.request.use(
    config => {
        /*请求头中加入Token*/
        // let token = localStorage.getItem("token")
        // config.headers.Token = token
        return config;
    },
    error => {
        return Promise.error(error);
    }
)

// 响应拦截器
axios.interceptors.response.use(
    response => {
        // console.log(response.data)
        // if (response.data.code && response.data.code === 200) {
        //     return response
        // } else {
        //     Message({
        //         type: "error",
        //         showClose: true,
        //         message: "123"
        //     })
        //     return response
        // }
        return response
    },
    /**
     * 服务器状态码不是200的情况
     * @param error
     * @returns {Promise<never>}
     */
    error => {
        return Promise.reject(error.response);
    }
)

export default axios