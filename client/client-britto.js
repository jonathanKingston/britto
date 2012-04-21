  Posts = new Meteor.Collection("Posts");
  Users = new Meteor.Collection("Users");

  Meteor.subscribe("allposts");

  Template.posts.postlist = function() {
    return Posts.find({}, {sort: {created: -1}});
  }

  Template.userArea.user = function() {
    return Session.get('user');
  }

  Template.userArea.events = {
    'submit #login-form, click #login-button': function() {
      Meteor.call('login', $('#login-username').val(), $('#login-password').val(), loginCallback);
      return false;
    },
    'submit #post-form, click #post-button': function() {
      Meteor.call('post', {title: $('#post-title').val(), body: $('#post-body').val(), slug: $('#post-slug').val(), auth: Session.get('auth')}, postCallback);
      return false;
    }
  }

  function postCallback(error, returnVal) {
    console.log('makeapost');
  }

  function loginCallback(error, returnVal) {
    if(!error) {
      Session.set('auth', returnVal.auth);
      Session.set('user', returnVal);
    }
    return false;
  }

  Handlebars.registerHelper('date', function(date) {
    if(date) {
      return date;
    } else {
      return Date().toString();
    }
  });


  BrittoRouter = Backbone.Router.extend({
    routes: {
      ":slug": "findPost",
      ":slug/": "findPost"
    },
    findPost: function(slug) {
      post = Posts.findOne({slug: slug});
      console.log(slug);
      console.log(post);
    }
  });
  Router = new BrittoRouter;
  Backbone.history.start({pushState: true});