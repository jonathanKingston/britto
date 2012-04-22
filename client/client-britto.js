  Session.set('loaded', false);
  Posts = new Meteor.Collection("Posts");
  Comments = new Meteor.Collection("Comments");
  Users = new Meteor.Collection("Users");

  Meteor.subscribe("allposts");
  //TODO change this to a per post subscription - removing it was killing the templates :/
  Meteor.subscribe("allcomments");
  //Todo, find a better / more reliable init point
  Meteor.subscribe("allusers", init);

  function init() {
    Session.set('loaded', true);
    Backbone.history.start({pushState: true});
  }

  Template.posts.postlist = function() {
    return Posts.find({}, {sort: {created: -1}});
  }

  Template.post.commentCount = function(id) {
    return Comments.find({postId: id}).count();
  }

  Template.post.postUser = function(id) {
    return Users.findOne({_id: id}).name;
  }

  Template.comments.commentslist = function(post) {
    console.log('comments');
    return Comments.find({postId: post._id}, {sort: {created: -1}});
  }

  Template.userArea.user = function() {
    return Session.get('user');
  }

  Template.userArea.events = {
    'submit #login-button, click #login-button': function() {
      Meteor.call('login', $('#login-username').val(), $('#login-password').val(), loginCallback);
      return false;
    },
    'submit #post-button, click #post-button': function() {
      Meteor.call('post', {title: $('#post-title').val(), body: $('#post-body').val(), slug: $('#post-slug').val(), auth: Session.get('auth')});
      return false;
    }
  }

  Template.postView.events = {
    'submit #comment-button, click #comment-button': function() {
      Meteor.call('comment', {name: $('#comment-name').val(), comment: $('#comment-comment').val(), postId: $('#comment-post').val()});
      return false;
    }
  }

  Template.post.events = {
    'click .postView': function(e) {
      e.stopPropagation();
      console.log(e);
      return false;
    }
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

  Handlebars.registerHelper('content', function() {
    if(Session.equals('loaded', true)) {
      if(Session.equals('new_page', 'post')) {
        post = Posts.findOne({slug: Session.get('new_slug')});
        if(post) {
  //TODO        Meteor.subscribe("postcomments", post._id, init);
          return Meteor.ui.chunk(function() { return Template.postView({post: post}); });
        }
      } else if(Session.equals('new_page', 'userArea')) {
        return Meteor.ui.chunk(function() { return Template.userArea(); });
      }
      return Meteor.ui.chunk(function() { return Template.listView(); });
    }
    return '';
  });

  BrittoRouter = Backbone.Router.extend({
    routes: {
      "user-area/": "userAreaPage",
      ":slug": "findPost",
      ":slug/": "findPost"
    },
    findPost: function(slug) {
      Session.set('new_page', 'post');
      Session.set('new_slug', slug);
    },
    userAreaPage: function() {
      Session.set('new_page', 'userArea');
    }
  });
  Router = new BrittoRouter;