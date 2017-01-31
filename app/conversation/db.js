var firebase = require('../firebase-client');
var database = firebase.database();
var Promise = firebase.Promise;

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
        .set({key: ref.key, channelId: channel_id});
    });
}

module.exports = {
  addStarter: addStarter,
  listStarters: listStarters,
  getLeastUsedStarter: getLeastUsedStarter,
  removeStarter: removeStarter,
  updateStarter: updateStarter,
  setCurrentConversation: setCurrentConversation,
  mapResult: mapResult,
  Promise: firebase.Promise
};
