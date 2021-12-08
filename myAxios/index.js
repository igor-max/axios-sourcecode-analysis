

class PromiseCollection {
  constructor() {
    this.handler = [];
  }

  use(resolve, reject) {
    this.handler.push({
      resolve,
      reject
    });
  }

  remove(id) {
    this.handler.splice(index, 1);
  }
}


class CancelToken {
  constructor(cb) {

    let resolvePromise;

    this.promise = new Promise(resolve => {
      resolvePromise = resolve;
    });

    this.promise.then(res => {

    });

    this.promise.then(res => {

    });

    const self = this;

    cb(function cancalCb(messaeg) {
      if (self.reason) return;
      self.reason = new Cancel(messaeg);
      resolvePromise(self.reason);
    });
  }

  throwIfRequested() {
    if (this.reason) {
      throw this.reason;
    }
  }

  static source() {
    let cancel
    const token = new CancelToken((c) => {
      cancel = c;
    });
    return {
      token,
      cancel
    };
  }
}

class Cancel {
  constructor(message) {
    this.messaeg = message;
  }

  get __CANCEL__() {
    return true;
  }
}

function cancelAjax(config) {
  // 用户设置了可以取消 并且 已经取消
  if (config.cancelToken && config.cancelToken.reason) {
    throw config.cancelToken.reason;
  }
}

function ajax(config) {
  cancelAjax(config);
  return [{ a: 1 }, { a: 2 }];
}

class Axios {
  constructor(options = {}) {
    this.default = options;
    this.interceptors = {
      requestInterceptor: new PromiseCollection(),
      responseInterceptor: new PromiseCollection()
    }
  }

  request(config) {
    const chainPromise = [ajax, undefined];
    this.interceptors.requestInterceptor.handler.forEach(item => chainPromise.unshift(item.resolve, item.reject));
    this.interceptors.responseInterceptor.handler.forEach(item => chainPromise.push(item.resolve, item.reject));
    let promise = Promise.resolve(config);
    while (chainPromise.length) {
      promise = promise.then(chainPromise.shift(), chainPromise.shift());
    }
    return promise;
  }
}

['get', 'post', 'put', 'delete'].forEach(v => Axios.prototype[v] = (url, config) => Axios.prototype.request(url, config))

function extend(target = {}, object, instance) {
  for (let prop in object) {
    if (instance && object[prop] === 'function') {
      target[prop] = object[prop].bind(instance);  // bind this
    } else {
      target[prop] = object[prop];
    }
  }
  return target;
}

function createInstance(config) {
  const axios = new Axios(config);
  const instance = Axios.prototype.request.bind(axios);
  extend(instance, axios);
  extend(instance, Axios.prototype, axios);
  axios.create = function (options) {
    return this.createInstance(config, options);
  }
  return instance;
}

const axios = createInstance();

axios.all = function (promises) {
  return Promise.all(promises);
}

axios.spread = function (cb) {
  return function (...args) {
    return cb.apply(null, args)
  };
}

axios.interceptors.requestInterceptor.use(config => config, err => Promise.reject(err));
axios.interceptors.requestInterceptor.use(config => config, err => Promise.reject(err));
axios.interceptors.responseInterceptor.use(config => config, err => Promise.reject(err));
axios.interceptors.responseInterceptor.use(config => config, err => Promise.reject(err));

axios.CancelToken = CancelToken;
const source = CancelToken.source();  // 返回一个对象（cancelToken实例token和取消请求的方法cancel）

axios({
  cancelToken: source.token
}).then(res => console.log('result', res)).catch(err => {
  if(source.token.reason) {
    console.log('手动取消', err)
  } else {
    console.log('非手动取消');
  }
});
source.cancel('lalala');

// 实现: 拦截器的链式调用, 取消请求