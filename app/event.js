var router = require("./event/router");
var db = require("./db");

router.subscribe("message.channels", function(teamId, event) {
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
        db.recordConversationMessage(event.text, event.user, event.ts, teamId);
      }
    });
});

router.subscribe("reaction_added", function(teamId, event) {
  if (event.item.type === "message") {
    db.getConversationMessage(event.item.ts, teamId)
      .then(function() {
        db.addReaction(event.item.ts, event.user, event.reaction, teamId);
      });
  }
});

router.subscribe("reaction_removed", function(teamId, event) {
  if (event.item.type === "message") {
    db.getConversationMessage(event.item.ts, teamId)
      .then(function() {
        db.removeReaction(event.item.ts, event.user, event.reaction, teamId);
      });
  }
});

module.exports = router.dispatch;
