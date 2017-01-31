var subscriptions = {};

function subscribe(ref, eventType, filters, callback) {
  subscriptions[eventType] = subscriptions[eventType] || {};
  subscriptions[eventType][ref] = {filters, callback};
}

function unsubscribe(ref) {
  for (var eventType in subscriptions) {
    delete subscriptions[eventType][ref];
  }
}

function dispatch(event, res) {
  var callable = subscriptions[event.type];
  for (var ref in callable) {
    if (matches(event, callable[ref].filters)) {
      callable[ref].callback(event, res);
    }
  }
}

function matches(event, filter) {
  for (var key in filter) {
    if (event[key] != filter[key]) {
      return false;
    }
  }
  return true;
}

module.exports = {
  subscribe: subscribe,
  unsubscribe: unsubscribe,
  dispatch: dispatch
};
