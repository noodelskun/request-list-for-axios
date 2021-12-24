# request-list-for-axios
基于axios封装的请求队列小工具

## 功能说明
为了特殊场景下，需要频繁请求同一个接口，为了解决异步引起的先发起的请求不一定先结束，多个请求的回调函数执行顺序不定而导致的数据渲染错误，将多个请求排一下队，当有新请求进入时把原来还没有请求完成的请求cancel掉，执行新请求，保证数据渲染的正确。

## 使用方式

```
import axios from 'axios'
import {axiosRequestListPlugin, createRequestList} from 'request-list-for-axios'

const server = axiosRequestListPlugin(axios.create({
  // axios基础配置
}))

// 添加请求拦截器
server.interceptors.request.use(function (config) {
  // 在发送请求之前做些什么
  return config;
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error);
});
server.interceptors.response.use(function (response) {
  // 对响应数据做点什么
  return response;
}, function (error) {
  // 对响应错误做点什么
  return Promise.reject(error);
})

// 使用
// 创建一个请求队列,传入该队列id,多个不同请求可以使用同一个队列
const requestList = createRequestList()

serve.request({
    url: 'http://localhost:3000/list',
    method: 'get',
    requestList  //传入创建的队列
}).then(res => {
    console.log('then',res)
    return res
}).catch(err=>{
    console.log(err)
})

```
