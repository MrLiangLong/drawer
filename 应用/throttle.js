/*
*节流：指定一段时间内只调用一次函数，从而降低函数调用频率
*实现节流函数的过程和防抖函数有些类似，只是对于节流函数而言，有两种执行方式，在调用函数时执行最先一次调用还是最近一次调用，所以需要设置时间戳加以判断
*/
const throttle = (func, wait = 0, execFirstCall) => {
    let timeout = null
    let args
    let firstCallTimestamp
  
    function throttled(...arg) {
      if (!firstCallTimestamp) firstCallTimestamp = new Date().getTime()
      if (!execFirstCall || !args) {
        console.log('set args:', arg)
        args = arg
      }
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      // 以Promise的形式返回函数执行结果
      return new Promise(async(res, rej) => {
        if (new Date().getTime() - firstCallTimestamp >= wait) {
          try {
            const result = await func.apply(this, args)
            res(result)
          } catch (e) {
            rej(e)
          } finally {
            cancel()
          }
        } else {
          timeout = setTimeout(async () => {
            try {
              const result = await func.apply(this, args)
              res(result)
            } catch (e) {
              rej(e)
            } finally {
              cancel()
            }
          }, firstCallTimestamp + wait - new Date().getTime())
        }
      })
    }
    // 允许取消
    function cancel() {
      clearTimeout(timeout)
      args = null
      timeout = null
      firstCallTimestamp = null
    }
    // 允许立即执行
    function flush() {
      cancel()
      return func.apply(this, args)
    }
    throttled.cancel = cancel
    throttled.flush = flush
    return throttled
  }