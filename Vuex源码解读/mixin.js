export default function (Vue) {
  const version = Number(Vue.version.split('.')[0])

  if (version >= 2) {
    /*
    *全局混入Vue的生命周期，
    *同名钩子函数将合并为一个数组，都将被调用。另外，混入对象的钩子将在组件自身钩子之前调用。
    */
    Vue.mixin({ beforeCreate: vuexInit })
  } else {
    // override init and inject vuex init procedure
    // for 1.x backwards compatibility.
    const _init = Vue.prototype._init
    Vue.prototype._init = function (options = {}) {
      options.init = options.init
        ? [vuexInit].concat(options.init)
        : vuexInit
      _init.call(this, options)
    }
  }

  /**
   * Vuex init hook, injected into each instances init hooks list.
   * 
   * new Vue({
   *  store
   * })
   * 创建应用实例，传入store字段，根组件从这里拿到store，
   * 子组件从父组件拿到，一层层传递下去，实现所有组件共用$store属性。
   */
  function vuexInit () {
    const options = this.$options
    // store injection
    if (options.store) {
      debugger;
      //根组件，注册store实例
      this.$store = typeof options.store === 'function'
        ? options.store()
        : options.store
    } else if (options.parent && options.parent.$store) {
      //从父组件获取store实例，实现共用一个store
      this.$store = options.parent.$store
    }
  }
}
