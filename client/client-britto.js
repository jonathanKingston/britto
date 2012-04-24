  Session.set('loaded', false);
  Session.equals('page_type', false);

  Meteor.subscribe("allsettings");
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

  _.each(['user_area', 'comment', 'nav', 'post'], function(template) {
      Template[template].user = function() {
        return Session.get('user');
      }
  });

  function setPage(page, pageType, redirect) {
    if(redirect) {
      Router.navigate(page);
    }
    if(page !== Session.get('new_page')) {
      $('#mainContent').fadeOut('slow');
      $('#mainContent').promise().done(function() {window.scrollBy(0,0); Session.set('page_type', pageType); Session.set('new_page', page); });
    }
  }

  //create post callback
  function madePost(error, response) {
    if(!error) {
      setPage('/', false, true);
    }
  }

  function loginCallback(error, returnVal) {
    if(!error) {
      Session.set('auth', returnVal.auth);
      Session.set('user', returnVal);
      setPage('user_area', false, true);
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

  Handlebars.registerHelper('setting', function(options) {
    key = options.fn(this);
    setting = Settings.findOne({key: key.toString()});
    if(setting) {
      return setting.value;
    }
    return '';
  });

  Handlebars.registerHelper('short_content', function(slug, options) {
    renderedContent = options.fn(this);
    content = renderedContent.substring(0, 200);
    if(content != renderedContent) {
      content += " <a href=\"/blog/"+slug+"\" rel=\"internal\" >...</a>";
    }
    var converter = new Showdown.converter();
    return converter.makeHtml(content);
  });

  Handlebars.registerHelper('content', function() {
    if(Session.equals('loaded', true)) {
      if(Session.equals('page_type', 'post')) {
        post = Posts.findOne({slug: Session.get('new_page')});
        if(post) {
          //TODO  Meteor.subscribe("postcomments", post._id, init);
          return Meteor.ui.chunk(function() { return Template.postView({post: post}); });
        }
      } else if(Session.equals('new_page', 'user_area')) {
        return Meteor.ui.chunk(function() { return Template.user_area(); });
      } else if(Session.equals('new_page', 'change_password')) {
        return Meteor.ui.chunk(function() { return Template.change_password(); });
      } else if(Session.equals('new_page', 'login')) {
        return Meteor.ui.chunk(function() { return Template.login(); });
      }
      return Meteor.ui.chunk(function() { return Template.listView(); });
    }
    return Meteor.ui.chunk(function() { return ''; });
  });

  BrittoRouter = Backbone.Router.extend({
    routes: {
      "/": "homePage",
      "user_area/": "userAreaPage",
      "user_area": "userAreaPage",
      "login/": "login",
      "login": "login",
      "logout/": "logoutPage",
      "logout": "logoutPage",
      "change_password": "changePasswordPage",
      "change_password/": "changePasswordPage",
      "blog/:slug": "findPost",
      "blog/:slug/": "findPost",
      "": "homePage",
    },
    login: function() {
      setPage('login', false, false);
    },
    homePage: function() {
      setPage('/', false, false);
    },
    changePasswordPage: function() {
      setPage('change_password', false, false);
    },
    findPost: function(slug) {
      setPage(slug, 'post', false);
    },
    userAreaPage: function() {
      setPage('user_area', false, true);
    },
    logoutPage: function() {
      Session.set('user', false);
      Session.set('auth', false);
      setPage('/', false, true);
    }
  });
  Router = new BrittoRouter;


  Meteor.startup(function() {
    $('body').on('click', 'a[rel="internal"]', function(e){
      e.preventDefault();
      link = $(this).attr('href');
      Router.navigate(link, true);
    });

    //Internal Meteor events don't seem to always fire TODO check for bugs
    $('body').on('click', '#comment-button', makeComment);
    $('body').on('submit', '#comment-button', makeComment);

    $('body').on('submit', '#login-button', doLogin);
    $('body').on('click', '#login-button', doLogin);

    $('body').on('submit', '#post-button', makePost);
    $('body').on('click', '#post-button', makePost);

    $('body').on('submit', '#change-password-button', changePassword);
    $('body').on('click', '#change-password-button', changePassword);

    $('body').on('change', '#post-title', changeTitle);

    $('body').on('click', '.delete-comment', deleteComment);
    $('body').on('click', '.delete-post', deletePost);
  });

  function changePassword(e) {
    e.preventDefault();
    if(Session.get('auth')) {
      if($('#change-new-password').val() == $('#change-repeat-password').val()) {
        Meteor.call('changePassword', {current_password: $('#change-current-password').val(), password: $('#change-new-password').val(), auth: Session.get('auth')}, passwordChanged);
      } else {
        alert('Get the password the same fool!');
      }
    }
  }

  function passwordChanged(error, response) {
    if(!error && response) {
      setPage('', false, true);
    } else {
      alert('There was an error updating that');
    }
  }

  function deleteComment(e) {
    e.preventDefault();
    if(Session.get('auth')) {
      target = e.target;
      commentId = $(target).attr('data-id');
      Meteor.call('deleteComment', {commentId: commentId, auth: Session.get('auth')});
    }
  }

  function deletePost(e) {
    e.preventDefault();
    if(Session.get('auth') && confirm('Are you sure you want to delete this post?')) {
      target = e.target;
      postId = $(target).attr('data-id');
      Meteor.call('deletePost', {commentId: postId, auth: Session.get('auth')}, deletedPost);
    }
  }

  function deletedPost(error, response) {
    if(!error && response) {
      setPage('/', false, true);
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