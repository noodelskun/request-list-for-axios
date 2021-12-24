import AXIOS from 'axios'
let _list = {}
export function createRequestList(id) {
  if (_list.hasOwnProperty(id.toString())) {
    throw new Error('不能使用相同的队列id')
  }
  if (!Array.isArray(_list[id])) {
    _list[id] = []
  }
  return _list[id]
}
export function axiosRequestListPlugin(axios) {
  const rewriteMethods = [
    'get',
    'post',
    'delete',
    'head',
    'options',
    'put',
    'patch'
  ]
  let _axios = {}
  rewriteMethods.forEach(key => {
    _axios[key] = function () {
      const [url, _options] = arguments
      const CancelToken = AXIOS.CancelToken
      const source = CancelToken.source()
      if (!_options.hasOwnProperty('requestList')) {
        _options.requestList = false
      }
      if (!_options.hasOwnProperty('cancelMessage')) {
        _options.cancelMessage = 'request canceled'
      }
      const requestList = _options.requestList
      const cancelMessage = _options.cancelMessage
      if (!requestList) return axios[key].call(axios, ...arguments)
      let options = {
        ..._options,
        cancelToken: source.token
      }
      // 取消前一个请求
      if (requestList.length > 0) {
        const _s = requestList[0]
        _s.source.cancel(_s.msg)
        requestList.pop()
      }
      // 当前请求cancel入队列
      requestList.push({
        msg: cancelMessage,
        source
      })
      return axios[key].call(axios, url, options)
        .then(res => {
          // 当前请求cancel出队列
          requestList.pop()
          return res
        })
    }
  })
  _axios.request = (config) => {
    const { method, url } = config
    const _method = method.toLowerCase()
    delete config.method
    delete config.url
    return _axios[_method](url, { ...config })
  }
  return _axios
}