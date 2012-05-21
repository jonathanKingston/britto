//TODO add auth filters here to neaten and also put these methods in a class
Meteor.methods({
  pageCount: pageCount,
  comment: makeComment,
  changePassword: changePassword,
  changeUser: changeUser,
  addUser: addUser,
  removeUser: removeUser,
  changeSetting: changeSetting,
  post: makePost,
  login: loginUser,
  sessionUser: sessionUser,
  logout: logoutSession,
  deleteComment: deleteComment,
  deletePost: deletePost,
  deleteBlogRoll: deleteBlogRoll,
  insertBlogRoll: insertBlogRoll
});

//TODO when minimogo adds in limit and so on, clear this function out its just a helper
function pageCount() {
  var posts = Posts.find();
  return Math.ceil(posts.count()/10);
}


function logoutSession(key) {
  return Stellar.session.delete(key); //Delete the session key
}

function checkAuth(auth) {
  sessionData = Stellar.session.get(auth); //Get session data
  if(sessionData) {
    return Users.findOne({username: sessionData.data.username}); //Make sure there is a user with this id
  } else {
    return false;
  }
}

function changePassword(args) {
  if(user = checkAuth(args.auth)) {
    if(hashPassword(args.current_password, user.salt) == user.password) {
      val = Users.update({_id: user._id}, {$set: {password: hashPassword(args.password, user.salt)}});
      return true;
    }
  }
  return false;
}

function changeUser(args) {
  if(user = checkAuth(args.auth)) {
    Users.update({_id: user._id}, {$set: {name: args.name}});
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
      thisUser = {name: user.name, username: user.username}; //Filter what is sent to the client, this can be then stored in a cookie safely
      sessionKey = Stellar.session.set(thisUser); //Set the session data
      thisUser['auth'] = sessionKey;
      return thisUser;
    }
  }
  throw new Meteor.Error(401, 'Login not correct');
  return false;
}

//Returns to the client what is stored in the session, don't do this if you are storing things in the session the client should not know
function sessionUser(key) {
  sessionKey = Stellar.session.get(key);
  if(sessionKey) {
    return sessionKey.data;
  }
  return false;
}

function makePost(args) {
  if(user = checkAuth(args.auth)) {
    post = Posts.findOne({slug: args.slug});
    //console.log("created =="+args.created+" in server britto");
    created = new Date(args.created);
    //console.log ( "created = "+created);
    //TODO If the user changes the slug, this will create a new post, Should fix at some point
    if(post) {
      Posts.update({slug: args.slug}, {$set: {
          title: args.title,
          body: args.body,
          author: args.author,
          published: args.published,
          created: created
        } 
      });
    } else {
      Posts.insert({
        title: args.title,
        body: args.body,
        slug: args.slug,
        userId: user._id,
        author: args.author,
        published: args.published,
        created: created
      });
    }
    return true;
  }
  return false;
};
    

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
  id = Users.insert(vals);
  return id;
}
