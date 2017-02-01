var subscriptions = {};

function subscribe(eventType, callback) {
  subscriptions[eventType] = subscriptions[eventType] || [];
  subscriptions[eventType].push(callback);
}

function dispatch(data, res) {
  switch(data.type) {
  case "url_verification":
    res.send(data.challenge);
    break;
  case "event_callback":
    var event = data.event;
    var callbacks = subscriptions[event.type] || [];
    callbacks.forEach(function(callback) {
      callback(data.team_id, event);
    });
    console.info("Event: '" + event.type + "' processed by " + callbacks.length + " handlers");
    res.status(204).send("");
    break;
  default:
    console.error("Unknown event type: " + data.type);
    res.status(500).send("Unkown event type: " + data.type);
  }
}

module.exports = {
  subscribe: subscribe,
  dispatch: dispatch
};
