  Session.set('loaded', false);
  Session.equals('page_type', false);

  Meteor.subscribe("allsettings");
  Meteor.subscribe("allposts");
  //TODO change this to a per post subscription - removing it was killing the templates :/
  Meteor.subscribe("allcomments");
  //Todo, find a better / more reliable init point
  Meteor.subscribe("allusers", init);

  function init() {
    loadDisqus();
    loadAnalytics();
    Session.set('loaded', true);
    Backbone.history.start({pushState: true});
  }

  function loadAnalytics() {
    analytics = Settings.findOne({key: 'analytics_code'});
    if(analytics && analytics.value != '') {
      var _gaq = _gaq || [];
      _gaq.push(['_setAccount', analytics.value]);
//      _gaq.push(['_setDomainName', 'britto.co']);
      _gaq.push(['_setAllowLinker', true]);
      _gaq.push(['_trackPageview']);

      (function() {
        var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
        ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
      })();

    }
  }

  function loadDisqus() {
    disqus = Settings.findOne({key: 'disqus'});
    if(disqus && disqus.value != '') {
      $(document).load(function() {
        var disqus_shortname = disqus.value;
        (function() {
            var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
            dsq.src = 'http://' + disqus_shortname + '.disqus.com/embed.js';
            (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
        })();
      });
    }
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

  Template.settings.settings = function() {
    settings = Settings.find();
    if(settings.count() === 0) {
      return false;
    }
    return settings;
  }

  Template.postView.is_disqus = function() {
    setting = Settings.findOne({key: 'disqus'});
    if(setting && setting.value != '') {
      return true;
    }
    return false;
  }

  Template.postView.disqus = function() {
    setting = Settings.findOne({key: 'disqus'});
    if(setting && setting.value != '') {
      return setting.value;
    }
    return false;
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

  Handlebars.registerHelper('labelify', function(options) {
    label = options.fn(this).replace(/\_/g, ' ');
    return label.charAt(0).toUpperCase() + label.substr(1);
  });

  Handlebars.registerHelper('content', function() {
    if(Session.equals('loaded', true)) {

      //Stupid issue of home page not rendering, will refactor below to use this instead of equals
      console.log(Session.get('new_page'));

      if(Session.equals('page_type', 'post')) {
        post = Posts.findOne({slug: Session.get('new_page')});
        if(post) {
          //TODO  Meteor.subscribe("postcomments", post._id, init);
          return Meteor.ui.chunk(function() { return Template.postView({post: post}); });
        }
      } else if(Session.equals('new_page', 'user_area')) {
        return Meteor.ui.chunk(function() { return Template.user_area(); });
      } else if(Session.equals('new_page', 'settings')) {
        return Meteor.ui.chunk(function() { return Template.settings(); });
      } else if(Session.equals('new_page', 'change_password')) {
        return Meteor.ui.chunk(function() { return Template.change_password(); });
      } else if(Session.equals('new_page', 'login')) {
        return Meteor.ui.chunk(function() { return Template.login(); });
      }
      return Meteor.ui.chunk(function() { return Template.listView(); });
    }
    return Meteor.ui.chunk(function() { return ''; });
  });

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

    $('body').on('submit', '#change-setting-button', changeSetting);
    $('body').on('click', '#change-setting-button', changeSetting);

    $('body').on('submit', '#change-password-button', changePassword);
    $('body').on('click', '#change-password-button', changePassword);

    $('body').on('change', '#post-title', changeTitle);

    $('body').on('click', '.delete-comment', deleteComment);
    $('body').on('click', '.delete-post', deletePost);
  });

  function changeSetting(e) {
    e.preventDefault();
    if(Session.get('auth')) {
     settings = [];
     $('#change-setting-form input').each(function(input) { settings.push([$(this).attr('data-key'), $(this).val()]);});
     Meteor.call('changeSetting', {settings: settings, auth: Session.get('auth')}, standardHandler);
    }
  }

  function standardHandler(error, response) {
    if(!error && response) {
      setPage('', false, true);
    } else {
      alert('There was an error updating that');
    }    
  }

  function changePassword(e) {
    e.preventDefault();
    if(Session.get('auth')) {
      if($('#change-new-password').val() == $('#change-repeat-password').val()) {
        Meteor.call('changePassword', {current_password: $('#change-current-password').val(), password: $('#change-new-password').val(), auth: Session.get('auth')}, standardHandler);
      } else {
        alert('Get the password the same fool!');
      }
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
    $('#post-slug').val(slug.replace(/\s/g, '_').toLowerCase());
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