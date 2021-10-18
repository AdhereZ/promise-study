class HD {
  static PENDING = 'pending'
  static FUFILLED = 'fulfilled'
  static REJECTED = 'rejected'
  constructor(executor) {
    this.status = HD.PENDING
    this.value = null
    this.callbacks = []
    // try catch是当遇到错误时也reject,比如在实例对象console.log(a);没有定义a，报错直接reject
    try {
      //如果不bind(this)则resolve或者reject里的status就是undefined,
      executor(this.resolve.bind(this),this.reject.bind(this))
    } catch (error) {
      this.reject(error)
    }
  }
  resolve(value) {
    // 如果前面已经改变了一次状态，relove就失败
    if(this.status == HD.PENDING) {
      this.status = HD.FUFILLED
      this.value = value
      // 当resolve被延迟执行了时候就会遍历
      //保证异步性
      setTimeout(() => {
        this.callbacks.map(c => {
          c.onFulfilled(value)
        })
      })
    }
     
  }
  reject(reason) {
    // 如果前面已经改变了一次状态，reject就失败
    if(this.status == HD.PENDING) {
      this.status = HD.REJECTED
      this.value = reason
      // 当reject被延迟执行了时候就会遍历
      // 保证异步性
      setTimeout(() => {
        this.callbacks.map(c => {
          c.onRejected(reason)
        })
      })
    }
  }
  then(onFulfilled,onRejected) {
    // 当then没有传函数或者什么都不传，就直接将他们变为函数，不然会报错
    if(typeof onFulfilled != 'function') {
      //这里要return this.value 使得能够穿透then
      onFulfilled = () => this.value
    }
    if(typeof onRejected != 'function') {
      onRejected = () => this.value
    }
    // promise链式操作的关键
    let promise = new HD((resolve,reject) => {
          // 当resolve或reject被延迟执行了，就将这两函数存入数组中
    if(this.status == HD.PENDING) {
      this.callbacks.push({
        onFulfilled: value => {
          this.parse(promise,onFulfilled(this.value),resolve,reject)
        } ,
        onRejected: reason => {
          this.parse(promise,onRejected(this.value),resolve,reject)
        }
      })
    }

    // 只有状态改变了才执行这个函数
    if(this.status == HD.FUFILLED) {
    //  放到任务队列，不然就同步执行了
    setTimeout(() => {
        this.parse(promise,onFulfilled(this.value),resolve,reject)
    })
    }
    if(this.status == HD.REJECTED) {
      setTimeout(() => {
        this.parse(promise,onRejected(this.value),resolve,reject)
      })
     
    }
    })
    return promise
  }


  parse(promise,result,resolve,reject) {
    if(promise == result) {
      throw new TypeError('Chaining cycle detected')
    }
    try {
      if(result instanceof HD) {
        result.then(resolve,reject)
        // result.then(value => {
            //   resolve(value)
            // }, reason => {
            //   // console.log(reason);
            //   reject(reason)
            // })
      }
      else {
        resolve(result)
      }
      
    } catch (error) {
      reject(error)
    }
  }

  catch(onRejected) {
    return this.then(null,onRejected)
  }

  // 实现一下静态方法reject和resolve 就可以像Promise.resolve.then....
  static resolve(value) {
    return new HD((resolve,reject) => {
      if(value instanceof HD) {
        value.then(resolve,reject)
      }else {
        resolve(value)
      }
     
    })
  }
  static reject(reason) {
    return new HD((resolve,reject) => {
      reject(reason)
    })
  }

  static all(promises) {
    return new HD((resolve,reject) => {
      let values = []
      promises.forEach(promise => {
          promise.then(res => {
            values.push(res)
            if(values.length == promises.length) {
              resolve(values)
            }
          },err => {
            reject(err)
          })
      })
    })
   
  }

  static race(promises) {
    return new HD((resolve,reject) => {
      promises.map(c => {
        c.then(res => {
          resolve(res)
        },reason => {
          reject(reason)
        })
      })
    })
  }
}


/* new Promise((resolve,reject) => {
  resolve('解决')
}).then(value => {

},err => {

}) */