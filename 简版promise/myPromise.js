class myPromise {
  static PENDING = 'pending'
  static FULFILLED = 'fulfilled'
  static REJECTED = 'rejected'
  constructor (executor) {
    this.value = null
    this.status = myPromise.PENDING
    this.resolveCbs = []
    this.rejectCbs = []
    executor(this.resolve.bind(this),this.reject.bind(this))
  }
  resolve(value) {
    if(this.status == myPromise.PENDING) {
      this.status = myPromise.FULFILLED
      this.value = value
      setTimeout(() => {
        this.resolveCbs.forEach(c => {
            c(value)
        })
      })
    }
  }
  reject(value) {
    if(this.status == myPromise.PENDING) {
      this.status = myPromise.REJECTED
      this.value = value
      setTimeout(() => {
        this.rejectCbs.forEach(c => {
            c(value)
        })
      })
    }
  }

  then(onFulfilled,onRejected) {
     if(typeof onFulfilled != 'function') {
      onFulfilled = () => this.value
     }
     if(typeof onRejected != 'function') {
      onRejected = () => this.value
     }

    let promise = new myPromise((resolve,reject) => {
      if(this.status == myPromise.PENDING) {
        this.resolveCbs.push(value => {
          // this.parse(promise,onFulfilled(this.value),resolve,reject) 
          onFulfilled(this.value)
        })
        this.rejectCbs.push(value => {
          // this.parse(promise,onRejected(this.value),resolve,reject) 
          onRejected(this.value)
      })
    }
      if(this.status == myPromise.FULFILLED) {
        setTimeout(() => {
          this.parse(promise,onFulfilled(this.value),resolve,reject) 
        })
      }
      if(this.status == myPromise.REJECTED) {
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
    if(result instanceof myPromise) {
      result.then(resolve,reject)
    }
    else {
      resolve(result)
    }
  }
}