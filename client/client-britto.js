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

  _.each(['postShort', 'post'], function(template) {
    Template[template].commentCount = function(id) {
      return Comments.find({postId: id}).count();
    }

    Template[template].postUser = function(id) {
      return Users.findOne({_id: id}).name;
    }
  });

  Template.comments.commentslist = function(post) {
    comments = Comments.find({postId: post._id}, {sort: {created: 1}});
    if(comments.count() === 0) {
      return false;
    }
    return comments;
  }

  _.each(['userArea', 'comment'], function(template) {
      Template[template].user = function() {
        return Session.get('user');
      }
  });

/*
  Template.userArea.events = {
    'submit #login-button, click #login-button': function() {
      Meteor.call('login', $('#login-username').val(), $('#login-password').val(), loginCallback);
      return false;
    },
    'submit #post-button, click #post-button': function() {
      Meteor.call('post', {title: $('#post-title').val(), body: $('#post-body').val(), slug: $('#post-slug').val(), auth: Session.get('auth')}, madePost);
      return false;
    }
  }
*/

  //create post callback
  function madePost(error, response) {
    if(!error) {
      Session.set('new_page', 'home');
      Router.navigate('/');
    }
  }

//Doesn't always work use startup at bottom
//  Template.postView.events = {
//    'submit #comment-button, click #comment-button': function() {
//      Meteor.call('comment', {name: $('#comment-name').val(), comment: $('#comment-comment').val(), postId: $('#comment-post').val()});
//      return false;
//    }
//  }

  function loginCallback(error, returnVal) {
    if(!error) {
      Session.set('auth', returnVal.auth);
      Session.set('user', returnVal);
    }
    return false;
  }

  Handlebars.registerHelper('date', function(date) {
    if(date) {
      dateObj = new Date(date);
      return $.timeago(dateObj);
    }
    return 'N/A';
  });

  Handlebars.registerHelper('short_content', function(slug, options) {
    renderedContent = options.fn(this);
    content = renderedContent.substring(0, 200);
    if(content != renderedContent) {
      content += " <a href=\"/"+slug+"/\">...</a>";
    }
    var converter = new Showdown.converter();
    return converter.makeHtml(content);
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
      "/": "homePage",
      "user-area/": "userAreaPage",
      ":slug": "findPost",
      ":slug/": "findPost"
    },
    homePage: function() {
      Session.set('new_page', 'home');
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


  Meteor.startup(function() {
      $('body').on('click', 'a[rel="internal"]', function(e){
          e.preventDefault();
          Router.navigate($(this).attr('href'), true);
      });

    //Internal Meteor events don't seem to always fire TODO check for bugs
    $('body').on('click', '#comment-button', makeComment);
    $('body').on('submit', '#comment-button', makeComment);

    $('body').on('submit', '#login-button', doLogin);
    $('body').on('click', '#login-button', doLogin);

    $('body').on('submit', '#post-button', makePost);
    $('body').on('click', '#post-button', makePost);

    $('body').on('change', '#post-title', changeTitle);

    $('body').on('click', '.delete-comment', deleteComment);
  });

  function deleteComment(e) {
    e.preventDefault();
    if(Session.get('auth')) {
      target = e.target;
      commentId = $(target).attr('data-id');
      Meteor.call('deleteComment', {commentId: commentId, auth: Session.get('auth')});
    }
  }

  function changeTitle() {
    slug = $('#post-title').val();
    $('#post-slug').val(slug.replace(/\s/g, '_'));
  }

  function makePost(e) {
    e.preventDefault();
    if(Session.get('auth')) {
      Meteor.call('post', {title: $('#post-title').val(), body: $('#post-body').val(), slug: $('#post-slug').val(), auth: Session.get('auth')}, madePost);
    }
    return false;
  }

  function doLogin(e) {
    e.preventDefault();
    Meteor.call('login', $('#login-username').val(), $('#login-password').val(), loginCallback);
    return false;
  }

  function makeComment(e) {
    e.preventDefault();
    nameText = $('#comment-name').val();
    commentText = $('#comment-comment').val();
    //Stop blank messages
    if(commentText.length > 0 && nameText.length > 0) {
      Meteor.call('comment', {name: nameText, comment: commentText, postId: $('#comment-post').val()}, madeComment);
    }
    return false;
  }

  function madeComment(error, response) {
    if(!error) {
      $('#comment-comment').val('');
    }
  }