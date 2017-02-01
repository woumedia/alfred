var firebase = require('firebase');

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

function setCurrentConversation(text, channel_id, team_id) {
  var ref = database.ref("conversations/" + team_id).push({text: text});
  return ref
    .then(function(ref) {
      return database.ref("conversations/" + team_id + "/current")
        .set({key: ref.key, channelId: channel_id, started: new Date()});
    });
}

function getConversationChannelId(teamId) {
  return database.ref("conversations/" + team_id + "/current/channelId")
    .once("value")
    .then(function(snapshot) {
      if (snapshot.exists()) {
        return Promise.resolve(snapshot.val());
      } else {
        return Promise.reject();
      }
    });
}

function recordConversationMessage(text, userId, ts, teamId) {
  return database.ref("conversations/" + teamId + "/current/messages/" + ts)
    .set({
      text: text,
      userId: userId
    });
}

function getConversationMessage(ts, teamId) {
  return database.ref("conversations/" + teamId + "/current/messages/" + ts)
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
  var unique = userId + "-" + reaction;
  var key = "conversations/" + teamId + "/current/messages/" + ts + "/reactions";
  return database.ref(key).child(unique).set(true);
}

function removeReaction(ts, userId, reaction, teamId) {
  var unique = userId + "-" + reaction;
  var key = "conversations/" + teamId + "/current/messages/" + ts + "/reactions";
  return database.ref(key).child(unique).remove();
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
  setCurrentConversation: setCurrentConversation,
  setTeamData: setTeamData,
  getTeamData: getTeamData,
  mapResult: mapResult
};
