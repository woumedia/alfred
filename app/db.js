var firebase = require('firebase');
var _ = require('lodash');

var config = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_SENDER_ID
};

firebase.initializeApp(config);

var database = firebase.database();

function addStarter(text, team_id) {
  return database.ref("starters/" + team_id).push({text: text});
}

function updateStarter(id, team_id, data) {
  return database.ref("starters/" + team_id + "/" + id).update(data);
}

function listStarters(team_id) {
  return database.ref("starters/" + team_id).once("value");
}

function getLeastUsedStarter(team_id) {
  return database.ref("starters/" + team_id)
    .orderByChild('timesUsed')
    .limitToFirst(1)
    .once("child_added");
}

function removeStarter(id, team_id) {
  var ref = database.ref("starters/" + team_id + "/" + id);

  return ref
    .once("value")
    .then(function(snapshot) {
      return ref
        .remove()
        .then(function() {
          return Promise.resolve(snapshot);
        });
    });
}

function mapResult(collection, callback) {
  var elements = [];
  collection.forEach(function(element) {
    elements.push(callback(element));
  });
  return elements;
}

function startConversation(text, channel_id, team_id) {
  var ref = database.ref("conversations/" + team_id).push({text: text});
  return ref
    .then(function(ref) {
      return database.ref("conversations/" + team_id + "/current")
        .set({key: ref.key, channelId: channel_id, started: new Date()});
    });
}

function updateConversation(teamId, key, data) {
  return database.ref("conversations/" + teamId + "/" + key).update(data);
}

function score(msg) {
  return _.size(msg.reactions);
}

function calculateResult(messages) {
  var winner = _.maxBy(_.values(messages), score);
  var results = _.values(messages)
      .map(msg => { return {[msg.userId]: score(msg)}; })
      .reduce((acc, elem) => _.mergeWith(acc, elem, (lhs, rhs) => lhs + rhs));

  return {
    winner: {
      userId: winner.userId,
      points: _.size(winner.reactions),
      text: winner.text
    },
    results: results
  };
}

function finishConversation(teamId) {
  return database.ref("conversations/" + teamId + "/current")
    .once("value")
    .then(function(snapshot) {
      if (snapshot.exists()) {
        var key = snapshot.val().key;
        var messages = snapshot.val().messages;
        var result = calculateResult(messages);
        var update = updateConversation(teamId, key, result);
        return Promise.all([update, snapshot.ref.remove()])
          .then(() => Promise.resolve(result));
      } else {
        return Promise.resolve();
      }
    });
}

function getConversationChannelId(teamId) {
  return database.ref("conversations/" + teamId + "/current/channelId")
    .once("value")
    .then(function(snapshot) {
      if (snapshot.exists()) {
        return Promise.resolve(snapshot.val());
      } else {
        return Promise.reject();
      }
    });
}

function messageKey(teamId, ts) {
  return "conversations/" + teamId + "/current/messages/" + ts.replace(".", "-");
}

function recordConversationMessage(text, userId, ts, teamId) {
  return database.ref(messageKey(teamId, ts))
    .set({
      text: text,
      userId: userId
    });
}

function getConversationMessage(ts, teamId) {
  return database.ref(messageKey(teamId, ts))
    .once("value")
    .then(function(snapshot) {
      if (snapshot.exists()) {
        return Promise.resolve(snapshot.val());
      } else {
        return Promise.reject();
      }
    });
}

function addReaction(ts, userId, reaction, teamId) {
  var key = messageKey(teamId, ts) + "/reactions/" + userId + "-" + reaction;
  return database.ref(key).set(true);
}

function removeReaction(ts, userId, reaction, teamId) {
  var key = messageKey(teamId, ts) + "/reactions/" + userId + "-" + reaction;
  return database.ref(key).remove();
}

function setTeamData(data, teamId) {
  return database.ref("teams/" + teamId).set(data);
}

function getTeamData(teamId) {
  return database.ref("teams/" + teamId)
    .once("value")
    .then(function(snapshot) {
      return Promise.resolve(snapshot.val());
    });
}

module.exports = {
  addStarter: addStarter,
  listStarters: listStarters,
  getLeastUsedStarter: getLeastUsedStarter,
  removeStarter: removeStarter,
  updateStarter: updateStarter,
  startConversation: startConversation,
  finishConversation: finishConversation,
  getConversationChannelId: getConversationChannelId,
  recordConversationMessage: recordConversationMessage,
  getConversationMessage: getConversationMessage,
  addReaction: addReaction,
  removeReaction: removeReaction,
  setTeamData: setTeamData,
  getTeamData: getTeamData,
  mapResult: mapResult
};
