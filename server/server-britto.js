Posts = new Meteor.Collection("Posts");
Users = new Meteor.Collection("Users");
Comments = new Meteor.Collection("Comments");

  Meteor.publish("postcomments", function(id) {
    return Comments.find({postId: id});
  });


  Meteor.publish("allcomments", function() {
    return Comments.find();
  });


//  Meteor.publish("allusers", function() {
//    return Users.find({}, {fields: {password: 0, salt: 0, apikey: 0}});
//  });

  Meteor.publish("allposts", function() {
    return Posts.find({}, {fields: {}});
  });

  Meteor.methods({
    comment: makeComment,
    post: makePost,
    login: loginUser
  });

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
    if(Users.findOne({apikey: args.auth})) {
      Posts.insert({
        title: args.title,
        body: args.body,
        slug: args.slug,
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
    Users.insert(vals);
  }

  Meteor.startup(function () {
    _.each(['Posts', 'Users'], function(collection) {
      _.each(['insert', 'update', 'remove'], function(method) {
        Meteor.default_server.method_handlers['/' + collection + '/' + method] = function() {};
      });
    });

    if (Posts.find().count() === 0) {
      makePost({title: 'Hello world', body: 'Cruel cruel world', slug: 'yellow_world'});
    }
    if(Users.find().count() === 0) {
      console.log('Adding in users');
      createUser({username: 'jonathan', password: 'test', name: 'Jonathan Kingston'});
    }
  });