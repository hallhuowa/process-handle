import axios from "axios";
import {baseURL} from '../config'
import * as QS from "jest-matcher-utils";

let instance = axios.create({
    baseURL: baseURL,
    timeout: 5000
});

// 添加请求拦截器
instance.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么
    if(sessionStorage.getItem("token")){
        config.headers.token = sessionStorage.getItem("token")
    }
    return config;
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});

// 添加响应拦截器
instance.interceptors.response.use(function (response) {
    // 对响应数据做点什么
    return response;
}, function (error) {
    // 对响应错误做点什么
    console.log("response error :"+error);
    alert(123)
    if (error.response) {
        switch (error.response.status) {
            case 401:
                console.log("token 过期");
                return;
        }
    }
    return Promise.reject(error);
});

/**
 * get方法，对应get请求
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 */
export function getResponse(url, params){
    return axios.get(baseURL+url, {
        params: params,
        headers:{
            'token': sessionStorage.getItem("token")
        }
    });
}
/**
 * post方法，对应post请求
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 */
export function postResponse(url, params) {
    return axios.post(baseURL+url, params,{headers:{'token': sessionStorage.getItem("token")}});
}

export default instance