//TODO add auth filters here to neaten and also put these methods in a class
Meteor.methods({
  comment: makeComment,
  changePassword: changePassword,
  changeUser: changeUser,
  addUser: addUser,
  removeUser: removeUser,
  changeSetting: changeSetting,
  post: makePost,
  login: loginUser,
  logout: logoutSession,
  deleteComment: deleteComment,
  deletePost: deletePost,
  deleteBlogRoll: deleteBlogRoll,
  insertBlogRoll: insertBlogRoll
});

function logoutSession(key) {
  ServerSessions.remove({key: key});
  return true;
}

//This isn't a public method
//This method should be called when the user has no session, it isn't perfect as there is no built in cookies or on start up passing of cookied to the server.
//Howeverl  it should be just as secure just not as quick/simple as I would like
function generateServerSession(data) {
  var key = generateRandomKey();
  var expires = new Date();
  expires.setDate(expires.getDate()+5);
  serverSession = ServerSessions.insert({data: data, created: new Date(), key: key, expires: expires}); //Set expire time to now to check this works
  return key;
}

//This is not a public method at all, never make it public
//function updateServerSession(key, data) {
//  newquay = generateRandomKey(); //Generate a random key to stop session fixation, client will need to update their copy.
//  serverSession = ServerSessions.update({key: key}, {$set: {key: newquay, data: data}});
//}

//This is not a public method at all, never make it public
function getServerSession(key) {
  if(serverSession = ServerSessions.findOne({key: key})) {
    now = new Date();
    if(serverSession.expires < now) {
      sessionGarbageCollection();
      throw new Meteor.Error(401, 'Session timeout');
      return false;
    }
    //TODO check expired here, if it has... delete it and return false
    return serverSession
  } else {
    throw new Meteor.Error(401, 'Invalid session');
    return false;
  }
}

//Clears all expired sessions
function sessionGarbageCollection() {
  now = new Date();
  ServerSessions.remove({expires: {$lt: now}})
}

//This might need to be more random and will need to check for collisions
function generateRandomKey() {
  return Crypto.SHA256(Math.random().toString());
}


function checkAuth(auth) {
  data = getServerSession(auth);
  return Users.findOne({apikey: data.data.apikey});
}

function changePassword(args) {
  if(user = checkAuth(args.auth)) {
    if(hashPassword(args.current_password, user.salt) == user.password) {
      Users.update({apikey: args.auth}, {$set: {password: hashPassword(args.password, user.salt)}});
      return true;
    }
  }
  return false;
}

function changeUser(args) {
  if(user = checkAuth(args.auth)) {
    Users.update({apikey: args.auth}, {$set: {name: args.name}});
    return true;
  }
  return false;
}

function addUser(args) {
  if(user = checkAuth(args.auth)) {
    //strip out crap
    user = {name: args.name, username: args.username, password: args.password};
    createUser(user);
    return true;
  }
  return false;
}

function removeUser(args) {
  if(user = checkAuth(args.auth)) {
    Users.remove({_id: args.id});
    return true;
  }
  return false;
}

function changeSetting(args) {
  if(user = checkAuth(args.auth)) {
    _.each(args.settings, function(setting) {
      Settings.update({key: setting[0]}, {$set: {value: setting[1]}});
    });
    return true;
  }
  return false;
}

function deleteComment(args) {
  if(user = checkAuth(args.auth)) {
    Comments.remove({_id: args.commentId});
    return true;
  }
  return false;
}

function deletePost(args) {
  if(user = checkAuth(args.auth)) {
    Posts.remove({_id: args.commentId});
    return true;
  }
  return false;
}

function deleteBlogRoll(args) {
  if(user = checkAuth(args.auth)) {
    BlogRoll.remove({_id: args.id});
    return true;
  }
  return false;
}

function loginUser(username, password) {
  user = Users.findOne({username: username});
  if(user) {
    if(user.password == hashPassword(password, user.salt)) {
      sessionKey = generateServerSession(user);
      thisUser = {name: user.name, username: user.username, auth: sessionKey}; //user.apikey
      return thisUser;
    }
  }
  throw new Meteor.Error(401, 'Login not correct');
  return false;
}

function makePost(args) {
  if(user = checkAuth(args.auth)) {
    post = Posts.findOne({slug: args.slug});
    //TODO If the user changes the slug, this will create a new post, Should fix at some point
    if(post) {
      Posts.update({slug: args.slug}, {$set: {
          title: args.title,
          body: args.body
        } 
      });
    } else {
      Posts.insert({
        title: args.title,
        body: args.body,
        slug: args.slug,
        userId: user._id,
        created: new Date()
      });
    }
    return true;
  }
  return false;
}

function insertBlogRoll(args) {
  if(user = checkAuth(args.auth)) {
    BlogRoll.insert({
      name: args.name,
      link: args.link,
      created: new Date()
    });
    return true;
  }
  return false;
}

function makeComment(args) {
  if(args && args.postId) {
    Comments.insert({
      postId: args.postId,
      name: args.name,
      comment: args.comment,
      created: new Date()
    });
  }
}

function setSetting(key, value, description) {
  if(!Settings.findOne({key: key})) {
    Settings.insert({
      key: key,
      value: value,
      description: description
    });
  }
}

function hashPassword(password, salt) {
  return Crypto.SHA256(salt + '-' + password);
}

function createUser(vals) {
  vals.salt = Crypto.SHA256(Math.random().toString());
  vals.password = hashPassword(vals.password, vals.salt);
  vals.created = new Date();
  //This apikey is because we don't have server side sessions yet
  vals.apikey = Crypto.SHA256(Math.random().toString());
  id = Users.insert(vals);
  return id;
}
