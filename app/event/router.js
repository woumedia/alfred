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

function dispatch(data, res) {
  switch(data.type) {
  case "url_verification":
    res.send(data.challenge);
    break;
  case "event_callback":
    var event = data.event;
    var callable = subscriptions[event.type];
    var matched = false;
    for (var ref in callable) {
      if (matches(event, callable[ref].filters)) {
        matched = true;
        callable[ref].callback(event, res);
      }
    }
    if (!matched) {
      res.status(204).send("");
    }
    break;
  default:
    res.status(500).send("Unkown event type: " + data.type);
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
