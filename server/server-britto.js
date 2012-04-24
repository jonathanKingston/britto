Meteor.methods({
  comment: makeComment,
  changePassword: changePassword,
  post: makePost,
  login: loginUser,
  deleteComment: deleteComment
});

function changePassword(args) {
  if(user = Users.findOne({apikey: args.auth})) {
    if(hashPassword(args.current_password, user.salt) == user.password) {
      Users.update({apikey: args.auth}, {$set: {password: hashPassword(args.password, user.salt)}});
      return true;
    }
  }
  return false;
}

  function deleteComment(args) {
    if(user = Users.findOne({apikey: args.auth})) {
      Comments.remove({_id: args.commentId});
      return true;
    }
    return false;
  }

  function loginUser(username, password) {
    user = Users.findOne({username: username});
    if(user) {
      if(user.password == hashPassword(password, user.salt)) {
        thisUser = {name: user.name, username: user.username, auth: user.apikey};
        return thisUser;
      }
    }
    throw new Meteor.Error(401, 'Login not correct');
  }

  function makePost(args) {
    if(user = Users.findOne({apikey: args.auth})) {
      Posts.insert({
        title: args.title,
        body: args.body,
        slug: args.slug,
        userId: user._id,
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

  function hashPassword(password, salt) {
    return Meteor.hash('sha256', password + salt);
  }

  function createUser(vals) {
    vals.salt = Meteor.hash('md5', Math.random().toString());
    vals.password = hashPassword(vals.password, vals.salt);
    vals.created = new Date();
    //This apikey is because we don't have server side sessions yet
    vals.apikey = Meteor.hash('md5', Math.random().toString());
    id = Users.insert(vals);
    return id;
  }