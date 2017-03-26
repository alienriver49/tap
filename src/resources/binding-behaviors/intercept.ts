const interceptMethods = ['updateTarget', 'updateSource', 'callSource'];

export class InterceptBindingBehavior {

  bind(binding, source, interceptor) {
    console.log('THIS IS EXCITING: ABOUT TO BIND', binding, interceptor);
    let i = interceptMethods.length;
    while (i--) {
      let method = interceptMethods[i];
      if (!binding[method]) {
        continue;
      }
      binding[`intercepted-${method}`] = binding[method];
      let update = binding[method].bind(binding);
      binding[method] = interceptor.bind(binding, method, update);
    }
  }

  unbind(binding, source) {
    console.log('THIS IS EXCITING: ABOUT TO UNBIND', binding, source);
    let i = interceptMethods.length;
    while (i--) {
      let method = interceptMethods[i];
      if (!binding[method]) {
        continue;
      }
      binding[method] = binding[`intercepted-${method}`];
      binding[`intercepted-${method}`] = null;
    }
  }
}

