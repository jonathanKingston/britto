Posts = new Meteor.Collection("Posts");
Users = new Meteor.Collection("Users");
Comments = new Meteor.Collection("Comments");


Meteor.publish("postcomments", function(id) {
  return Comments.find({postId: id});
});

Meteor.publish("allcomments", function() {
  return Comments.find();
});

Meteor.publish("allusers", function() {
  return Users.find({}, {fields: {username: 0, password: 0, salt: 0, apikey: 0}});
});

Meteor.publish("allposts", function() {
  return Posts.find({}, {fields: {}});
});
