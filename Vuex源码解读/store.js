import applyMixin from './mixin'
import devtoolPlugin from './plugins/devtool'
import ModuleCollection from './module/module-collection'
import { forEachValue, isObject, isPromise, assert, partial } from './util'

//声明全局Vue，无需导入vue
let Vue

export class Store {
  constructor(options = {}) {
    /*
    options存在两种形式：
    1.单一状态树
    {
      state:{},
      getters:{},
      actions:{},
      mutations:{}
    }
    
    2.模块化的store
    {
      modules:{
        cart:{
          namespaced: true,
          state:{},
          getters:{},
          actions:{},
          mutations:{}
        }
      },
      plugins:[]
    }

    */

    //Vuex的注册：将store混入到Vue实例根组件，子组件从父组件获取store，实现共用一个store
    if (!Vue && typeof window !== 'undefined' && window.Vue) {
      //window.Vue存在自动安装，无需使用Vue.use(Vuex)
      install(window.Vue)
      /**
       * 安装插件：Vue.use(MyPlugin) 
       * 
       * 插件的定义:
       * Myplugin.install = function(Vue,options){
       *  //定义插件方法
       *  Vue.myGlobalMethod = function () {}
       * }
       * 
      */
    }

    if (__DEV__) {
      assert(Vue, `must call Vue.use(Vuex) before creating a store instance.`)
      assert(typeof Promise !== 'undefined', `vuex requires a Promise polyfill in this browser.`)
      assert(this instanceof Store, `store must be called with the new operator.`)
    }

    const {
      plugins = [],
      strict = false
    } = options

    // store internal state
    /*
    *提交状态的标志，在_widthCommit中，当使用mutation时，会先赋值为true，再执行mutation。修改state后再赋值为false。
    *此过程中，会用watch监听state的变化是否_committing为true,从而保证只能通过mutation来修改state。
    */
    this._committing = false
    //用于保存所有action，里面会先包装一次
    this._actions = Object.create(null)
    //用于保存订阅action的回调
    this._actionSubscribers = []
    //保存所有的mutation，里面会先包装一次
    this._mutations = Object.create(null)
    //用于保存包装后的getter
    this._wrappedGetters = Object.create(null)
    //一颗module树，进行module收集，只处理state
    this._modules = new ModuleCollection(options)
    /*
    //store模块的基础数据结构
    Module = { 
        runtime:false,
        state:{count:0}, //直接取rawModule.state
        _children:[],
        _rawModule:{},  //存储store初始化传递的原始模块对象
        namespaced:false
    }

    //模块收集后的状态
    1.单一状态树
    this._modules = {
      root:Module
    }
    2.模块化的store： Module嵌套Module，一颗Module树
    this._modules = {
      root:{ //收集的模块对象
       runtime:false,
       state:{},
       _children:{
         cart:Module,
         product:Module
       },
       _rawModule:{},
        namespaced:false
      }
    }

    */

    console.log("this._modules", this._modules)
    //用于保存namespaced的模块
    this._modulesNamespaceMap = Object.create(null)
    //用于监听mutation
    this._subscribers = []
    //用于响应式的检测一个getter的返回值
    this._watcherVM = new Vue()
    //getters的缓存，{namespace: getterProxy} --> 通过代理的方式，让module中获取到的getters不会带命名空间
    // get['a']-->get[namespace+'a']
    this._makeLocalGettersCache = Object.create(null)

    // bind commit and dispatch to self
    const store = this
    //将dispatch/commit的指针绑定到store，防止被篡改
    const { dispatch, commit } = this
    this.dispatch = function boundDispatch(type, payload) {
      return dispatch.call(store, type, payload)
    }
    this.commit = function boundCommit(type, payload, options) {
      return commit.call(store, type, payload, options)
    }

    // strict mode
    this.strict = strict

    const state = this._modules.root.state

    // init root module.
    // this also recursively registers all sub-modules
    // and collects all module getters inside this._wrappedGetters
    //module处理的核心，包括处理根module、action、mutation、getters和递归注册子module
    installModule(this, state, [], this._modules.root)

    // initialize the store vm, which is responsible for the reactivity
    // (also registers _wrappedGetters as computed properties)
    //使用vue实例来保存state和getter
    resetStoreVM(this, state)

    // apply plugins
    //插件注册
    //所有的插件都是函数，并且接受store作为参数
    plugins.forEach(plugin => plugin(this))

    const useDevtools = options.devtools !== undefined ? options.devtools : Vue.config.devtools
    if (useDevtools) {
      devtoolPlugin(this)
    }
  }

  get state() {
    return this._vm._data.$$state
  }

  set state(v) {
    if (__DEV__) {
      assert(false, `use store.replaceState() to explicit replace store state.`)
    }
  }
  
  //store初始的时候,commit已经被绑定到store
  commit(_type, _payload, _options) {
    // check object-style commit
    debugger;
    //参数统一格式 :支持对象风格和载荷风格
    const {
      type,
      payload,
      options
    } = unifyObjectStyle(_type, _payload, _options)

    const mutation = { type, payload }
    //获取当前type对应保存的mutations数组
    const entry = this._mutations[type]
    if (!entry) {
      if (__DEV__) {
        console.error(`[vuex] unknown mutation type: ${type}`)
      }
      return
    }
    //包裹在_withCommit中执行mutation，mutation是修改state的唯一方法
    this._withCommit(() => {
      entry.forEach(function commitIterator(handler) {
        //执行mutation只需传入payload，上面包裹函数中已经处理了其他参数
        handler(payload)
      })
    })

    //执行mutation的订阅者
    this._subscribers
      .slice() // shallow copy to prevent iterator invalidation if subscriber synchronously calls unsubscribe
      .forEach(sub => sub(mutation, this.state))

    if (
      __DEV__ &&
      options && options.silent
    ) {
      console.warn(
        `[vuex] mutation type: ${type}. Silent option has been removed. ` +
        'Use the filter functionality in the vue-devtools'
      )
    }
  }

  //初始化已绑定到store
  dispatch(_type, _payload) {
    // check object-style dispatch
    debugger;
    //统一格式
    const {
      type,
      payload
    } = unifyObjectStyle(_type, _payload)

    const action = { type, payload }
    const entry = this._actions[type]
    //action不存在返回
    if (!entry) {
      if (__DEV__) {
        console.error(`[vuex] unknown action type: ${type}`)
      }
      return
    }

    try {
      //拷贝份订阅列表，如果订阅者同步调用退订，可以防止迭代器无效
      this._actionSubscribers
        .slice() // shallow copy to prevent iterator invalidation if subscriber synchronously calls unsubscribe
        .filter(sub => sub.before)
        .forEach(sub => sub.before(action, this.state))
    } catch (e) {
      if (__DEV__) {
        console.warn(`[vuex] error in before action subscribers: `)
        console.error(e)
      }
    }

    //action>,用Promise.all包裹，保证所有action都执行结束
    const result = entry.length > 1
      ? Promise.all(entry.map(handler => handler(payload)))
      : entry[0](payload)

    return new Promise((resolve, reject) => {
      result.then(res => {
        try {
          //action执行成功，通知所有的订阅
          this._actionSubscribers
            .filter(sub => sub.after)
            .forEach(sub => sub.after(action, this.state))
        } catch (e) {
          if (__DEV__) {
            console.warn(`[vuex] error in after action subscribers: `)
            console.error(e)
          }
        }
        resolve(res)
      }, error => {
        try {
          //失败通知
          this._actionSubscribers
            .filter(sub => sub.error)
            .forEach(sub => sub.error(action, this.state, error))
        } catch (e) {
          if (__DEV__) {
            console.warn(`[vuex] error in error action subscribers: `)
            console.error(e)
          }
        }
        reject(error)
      })
    })
  }

  subscribe(fn, options) {
    return genericSubscribe(fn, this._subscribers, options)
  }

  subscribeAction(fn, options) {
    const subs = typeof fn === 'function' ? { before: fn } : fn
    return genericSubscribe(subs, this._actionSubscribers, options)
  }

  //监听getter值的变化
  watch(getter, cb, options) {
    if (__DEV__) {
      assert(typeof getter === 'function', `store.watch only accepts a function.`)
    }
    //getter必须是函数，state和getters作为参数，当值变化会执行回调函数cb
    return this._watcherVM.$watch(() => getter(this.state, this.getters), cb, options)
  }

  //修改state,主要用于devtool插件的时空穿梭功能
  replaceState(state) {
    this._withCommit(() => {
      this._vm._data.$$state = state
    })
  }

  //动态注册module
  registerModule(path, rawModule, options = {}) {
    //统一path为Array
    if (typeof path === 'string') path = [path]

    if (__DEV__) {
      //断言path只接受string和Array
      assert(Array.isArray(path), `module path must be a string or an Array.`)
      assert(path.length > 0, 'cannot register the root module by using registerModule.')
    }

    //收集module，也就是module-collection里的方法
    this._modules.register(path, rawModule)
    //递归注册子module
    installModule(this, this.state, path, this._modules.get(path), options.preserveState)
    // reset store to update getters...
    //更新store._vm
    resetStoreVM(this, this.state)
  }

  //根据path注销module
  unregisterModule(path) {
    if (typeof path === 'string') path = [path]

    if (__DEV__) {
      assert(Array.isArray(path), `module path must be a string or an Array.`)
    }

    //注销module
    this._modules.unregister(path)
    this._withCommit(() => {
      const parentState = getNestedState(this.state, path.slice(0, -1))
      //将module的state移除
      Vue.delete(parentState, path[path.length - 1])
    })
    //更新_vm
    resetStore(this)
  }

  //根据path，判断模块是否注册
  hasModule(path) {
    if (typeof path === 'string') path = [path]

    if (__DEV__) {
      assert(Array.isArray(path), `module path must be a string or an Array.`)
    }

    return this._modules.isRegistered(path)
  }

  //更新模块，重设vm
  hotUpdate(newOptions) {
    this._modules.update(newOptions)
    resetStore(this, true)
  }

  //mutation只能通过commit来触发,this._committing状态判断处理
  _withCommit(fn) {
    const committing = this._committing
    this._committing = true
    fn()
    this._committing = committing
  }
}

function genericSubscribe(fn, subs, options) {
  if (subs.indexOf(fn) < 0) {
    options && options.prepend
      ? subs.unshift(fn)
      : subs.push(fn)
  }
  return () => {
    const i = subs.indexOf(fn)
    if (i > -1) {
      subs.splice(i, 1)
    }
  }
}

//重置store
function resetStore(store, hot) {
  store._actions = Object.create(null)
  store._mutations = Object.create(null)
  store._wrappedGetters = Object.create(null)
  store._modulesNamespaceMap = Object.create(null)
  const state = store.state
  // init all modules
  //重新安装全部模块
  installModule(store, state, [], store._modules.root, true)
  // reset vm
  //重新设置_vm
  resetStoreVM(store, state, hot)
}

//重置store，去更新
function resetStoreVM(store, state, hot) {
  const oldVm = store._vm

  // bind store public getters
  store.getters = {}
  // reset local getters cache
  store._makeLocalGettersCache = Object.create(null)
  const wrappedGetters = store._wrappedGetters
  const computed = {}
  forEachValue(wrappedGetters, (fn, key) => {
    // use computed to leverage its lazy-caching mechanism
    // direct inline function use will lead to closure preserving oldVm.
    // using partial to return function with only arguments preserved in closure environment.
    //getter报错在computed,执行时只需要给store参数,在registerGetter已做处理
    computed[key] = partial(fn, store)
    //处理可通过this.$store.getters.xxx访问属性值
    Object.defineProperty(store.getters, key, {
      get: () => store._vm[key],
      enumerable: true // for local getters
    })
  })

  // use a Vue instance to store the state tree
  // suppress warnings just in case the user has added
  // some funky global mixins
  const silent = Vue.config.silent 
  //selent：true 取消日志警告
  Vue.config.silent = true
  //使用一个vue实例来保存state树
  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  })
  //恢复用户的selent设置
  Vue.config.silent = silent

  // enable strict mode for new vm
  //strict模式
  if (store.strict) {
    enableStrictMode(store)
  }

  //存在oldVm，解除对state的引用，dom更新后将oldVm实例销毁
  if (oldVm) {
    if (hot) {
      // dispatch changes in all subscribed watchers
      // to force getter re-evaluation for hot reloading.
      store._withCommit(() => {
        oldVm._data.$$state = null
      })
    }
    Vue.nextTick(() => oldVm.$destroy())
  }
}

//递归注册子模块:mutation/action/getters/modules
function installModule(store, rootState, path, module, hot) {
  //路径为空，根路径
  const isRoot = !path.length
  debugger;
  //命名空间：格式为 'moduleA/'
  const namespace = store._modules.getNamespace(path)
  // register in namespace map
  //保存命名空间的模块:{命名空间:模块对象}
  if (module.namespaced) {
    debugger;
    if (store._modulesNamespaceMap[namespace] && __DEV__) {
      console.error(`[vuex] duplicate namespace ${namespace} for the namespaced module ${path.join('/')}`)
    }
    //store._modulesNamespaceMap = {'cart/':Module}
    store._modulesNamespaceMap[namespace] = module
  }

  // set state
  //非根组件，设置state
  if (!isRoot && !hot) {
    //根据path，获取父state
    const parentState = getNestedState(rootState, path.slice(0, -1))
    //当前模块名
    const moduleName = path[path.length - 1]
    store._withCommit(() => {
      if (__DEV__) {
        if (moduleName in parentState) {
          console.warn(
            `[vuex] state field "${moduleName}" was overridden by a module with the same name at "${path.join('.')}"`
          )
        }
      }
      //将state设置为响应式
      Vue.set(parentState, moduleName, module.state)
    })
  }

  //设置module的上下文，保证mutation和action的第一个参数能拿到对应的state getter等
  const local = module.context = makeLocalContext(store, namespace, path)

  //逐一注册mutation
  module.forEachMutation((mutation, key) => {
    //moduleA/mutationType
    const namespacedType = namespace + key
    registerMutation(store, namespacedType, mutation, local)
  })

  //逐一注册action
  module.forEachAction((action, key) => {
    const type = action.root ? key : namespace + key
    const handler = action.handler || action
    registerAction(store, type, handler, local)
  })

  //逐一注册getter
  module.forEachGetter((getter, key) => {
    const namespacedType = namespace + key
    registerGetter(store, namespacedType, getter, local)
  })
  
  //逐一注册子module
  module.forEachChild((child, key) => {
    installModule(store, rootState, path.concat(key), child, hot)
  })
}

/**
 * make localized dispatch, commit, getters and state
 * if there is no namespace, just use root ones
 */
//设置module的上下文，绑定对应的dispatch, commit, getters and state
//未设置namespaced，则采用根路径的
//namespace 如: moduleA/
function makeLocalContext(store, namespace, path) {
  const noNamespace = namespace === ''

  const local = {
    //无命名空间，
    dispatch: noNamespace ? store.dispatch : (_type, _payload, _options) => {
      //统一格式{type,payload,options}
      const args = unifyObjectStyle(_type, _payload, _options)
      const { payload, options } = args
      let { type } = args

      //root=true，根元素，不会添加命名空间，直接派发根元素的action
      if (!options || !options.root) {
        //添加命名空间
        type = namespace + type
        if (__DEV__ && !store._actions[type]) {
          console.error(`[vuex] unknown local action type: ${args.type}, global type: ${type}`)
          return
        }
      }
      //触发action
      return store.dispatch(type, payload)
    },

    commit: noNamespace ? store.commit : (_type, _payload, _options) => {
      const args = unifyObjectStyle(_type, _payload, _options)
      const { payload, options } = args
      let { type } = args

      if (!options || !options.root) {
        type = namespace + type
        if (__DEV__ && !store._mutations[type]) {
          console.error(`[vuex] unknown local mutation type: ${args.type}, global type: ${type}`)
          return
        }
      }
      //触发mutation
      store.commit(type, payload, options)
    }
  }

  // getters and state object must be gotten lazily
  // because they will be changed by vm update
  //getters和state需要延迟处理,需要等数据更新后才能计算。
  //使用getters函数，当访问的时候再进行一次计算
  Object.defineProperties(local, {
    getters: {
      get: noNamespace
        ? () => store.getters
        : () => makeLocalGetters(store, namespace) //获取namespace下的getters
    },
    state: {
      get: () => getNestedState(store.state, path)
    }
  })

  return local
}

//获取namespace的getters
function makeLocalGetters(store, namespace) {
  if (!store._makeLocalGettersCache[namespace]) {
    const gettersProxy = {}
    const splitPos = namespace.length
    Object.keys(store.getters).forEach(type => {
      // skip if the target getter is not match this namespace
      //如果getter未匹配到该命名空间，跳过
      if (type.slice(0, splitPos) !== namespace) return

      // extract local getter type
      //去掉type上的命名空间
      const localType = type.slice(splitPos)

      // Add a port to the getters proxy.
      // Define as getter property because we do not want to evaluate the getters in this time.
      //给getters加一层代理，
      //这样在module中获取到的getters不会带命名空间，
      //实际返回的是store.getters[type] type是有命名空间的
      Object.defineProperty(gettersProxy, localType, {
        get: () => store.getters[type],
        enumerable: true
      })
    })
    store._makeLocalGettersCache[namespace] = gettersProxy
  }

  return store._makeLocalGettersCache[namespace]
}

//包一层函数，然后保存到store._mutations,mutation可以重复注册，不会覆盖。this.$store.commit(mutationType,payload)触发
function registerMutation(store, type, handler, local) {
  //获取_mutation,不存在给空数组
  const entry = store._mutations[type] || (store._mutations[type] = [])
  entry.push(function wrappedMutationHandler(payload) {
    //包一层函数，commit执行时只需要传入payload
    //执行时让this指向store,参数为当前module上下文的state和用户额外添加的payload
    handler.call(store, local.state, payload)
  })
}

//注册action保存到store_actions
function registerAction(store, type, handler, local) {
  //获取_actions数组
  const entry = store._actions[type] || (store._actions[type] = [])
  entry.push(function wrappedActionHandler(payload) {
    let res = handler.call(store, {
      dispatch: local.dispatch,
      commit: local.commit,
      getters: local.getters,
      state: local.state,
      rootGetters: store.getters,
      rootState: store.state
    }, payload)
    //action执行结果包裹为Promise，支持链式调用
    if (!isPromise(res)) {
      res = Promise.resolve(res)
    }
    if (store._devtoolHook) {
      return res.catch(err => {
        store._devtoolHook.emit('vuex:error', err)
        throw err
      })
    } else {
      return res
    }
  })
}

//注册getters
function registerGetter(store, type, rawGetter, local) {
  //不允许重复
  if (store._wrappedGetters[type]) {
    if (__DEV__) {
      console.error(`[vuex] duplicate getter key: ${type}`)
    }
    return
  }
  //执行时传入store，执行对应的getter函数
  store._wrappedGetters[type] = function wrappedGetter(store) {
    return rawGetter(
      local.state, // local state
      local.getters, // local getters
      store.state, // root state
      store.getters // root getters
    )
  }
}

//监听state改变_committing是否为true。否，则报错。
//不允许在mutation外修改state
function enableStrictMode(store) {
  store._vm.$watch(function () { return this._data.$$state }, () => {
    if (__DEV__) {
      assert(store._committing, `do not mutate vuex store state outside mutation handlers.`)
    }
  }, { deep: true, sync: true })
}

//根据path获取父state
function getNestedState(state, path) {
  return path.reduce((state, key) => state[key], state)
}
//统一mutation/action入参格式
function unifyObjectStyle(type, payload, options) {
  if (isObject(type) && type.type) {
    options = payload
    payload = type
    type = type.type
  }

  if (__DEV__) {
    assert(typeof type === 'string', `expects string as the type, but found ${typeof type}.`)
  }

  return { type, payload, options }
}

//store挂载到vue上
export function install(_Vue) {
  if (Vue && _Vue === Vue) {
    if (__DEV__) {
      console.error(
        '[vuex] already installed. Vue.use(Vuex) should be called only once.'
      )
    }
    return
  }
  Vue = _Vue
  applyMixin(Vue)
}
