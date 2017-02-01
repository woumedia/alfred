var router = require("./event/router");
var db = require("./db");

function logEvent(teamId, event) {
  console.info("Processed event: " + event.type + " for team: " + teamId);
}

function failedEvent(teamId, event, value) {
  if (value) {
    console.error("Failed processing event: " + event.type + " for team: " + teamId,
                  value);
  }
}

router.subscribe("message", function(teamId, event) {
  db.getConversationChannelId(teamId)
    .then(function(channelId) {
      if (event.channel === channelId) {
        return db.getTeamData(teamId);
      } else {
        return Promise.reject();
      }
    })
    .then(function(teamData) {
      var botUserId = new RegExp(teamData.botUserId);
      if (botUserId.test(event.text)) {
        return db.recordConversationMessage(event.text, event.user, event.ts, teamId);
      } else {
        return Promise.reject();
      }
    })
    .then(logEvent.bind(null, teamId, event), failedEvent.bind(null, teamId, event));
});

router.subscribe("reaction_added", function(teamId, event) {
  if (event.item.type === "message") {
    db.getConversationMessage(event.item.ts, teamId)
      .then(function() {
        return db.addReaction(event.item.ts, event.user, event.reaction, teamId);
      })
      .then(logEvent.bind(null, teamId, event), failedEvent.bind(null, teamId, event));
  }
});

router.subscribe("reaction_removed", function(teamId, event) {
  if (event.item.type === "message") {
    db.getConversationMessage(event.item.ts, teamId)
      .then(function() {
        return db.removeReaction(event.item.ts, event.user, event.reaction, teamId);
      })
      .then(logEvent.bind(null, teamId, event), failedEvent.bind(null, teamId, event));
  }
});

module.exports = router.dispatch;
