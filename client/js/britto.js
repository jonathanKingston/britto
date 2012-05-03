var timeStart = new Date().getTime();
//This is here to speed the site name being shown, sorry kids
Handlebars.registerHelper('setting', function(options) {
  key = options.fn(this);
  setting = Settings.findOne({key: key.toString()});
  if(setting) {
    return setting.value;
  }
  return '';
});

Britto = {};

Britto.settingsLoaded = function() {
  Britto.log('settings loaded');
  timeLoad = new Date().getTime();
  Britto.log('Time start:'+timeStart);
  Britto.log('Time Load:'+timeLoad);
  Britto.log('Time Load:'+(timeLoad - timeStart));
  Britto.load.analytics();
}

Britto.init = function() {
  Britto.log('init');
  Session.set('loaded', true);
  Backbone.history.start({pushState: true});
}

Britto.log = function(message) {
  if(console && console.log) {
    console.log(message);
  }
}

Meteor.subscribe("allsettings", Britto.settingsLoaded);
Session.set('loaded', false);
Session.equals('page_type', false);

Meteor.subscribe("allposts");
//TODO change this to a per post subscription - removing it was killing the templates :/
Meteor.subscribe("allcomments");
//Todo, find a better / more reliable init point
Meteor.subscribe("allusers", Britto.init);

Britto.alert = function(type, message) {
  Britto.log(message);
  className = 'alert';
  if(type == 'warning' || type == 'info' || type == 'error') {
    className += ' alert-'+type
  }
  if(type == 'warning') {
    sarcasm = 'You better check yourself; before you wreck yourself';
    message = sarcasm+': '+message;
  }
  alert = $('<div class="'+className+'">  <button class="close" data-dismiss="alert">×</button>  '+message+'</div>').alert();
  $('#slides').prepend(alert);
}

Britto.load = {};

Britto.load.analytics = function() {
  analytics = Settings.findOne({key: 'analytics_code'});
  if(analytics && analytics.value != '') {
    $.ga.load(analytics.value);
  }
}

Britto.load.disqus = function(slug) {
  disqus = Settings.findOne({key: 'disqus'});
  if(disqus && disqus.value != '') {
    var disqus_shortname = disqus.value;
    var disqus_identifier = slug;
    (function() {
        var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
        dsq.src = 'http://' + disqus_shortname + '.disqus.com/embed.js';
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
    })();
  }
}

Britto.load.disqusCount = function() {
  disqus = Settings.findOne({key: 'disqus'});
  if(disqus && disqus.value != '') {
    var disqus_shortname = disqus.value;
    (function () {
        var s = document.createElement('script'); s.async = true;
        s.type = 'text/javascript';
        s.src = 'http://' + disqus_shortname + '.disqus.com/count.js';
        (document.getElementsByTagName('HEAD')[0] || document.getElementsByTagName('BODY')[0]).appendChild(s);
    }());
  }
}

Britto.navigate = function(path, load) {
  Britto.logPageLoad(path);
  Router.navigate(path, load);
}

Britto.logPageLoad = function(path) {
  if(Britto.analytics) {
    Britto.log('log page'+path);
    Britto.analytics.push(['_trackPageview', path]);
  }
}

Britto.setPage = function(page, pageType, redirect) {
  Britto.log('set page');
  if(redirect) {
    Britto.navigate(page);
  }
  if(page !== Session.get('new_page')) {
    window.scrollBy(0,0);
    if(page) {
      page = page.replace(/#(.*)/, '');
    }
    Session.set('page_type', pageType);
    Session.set('new_page', page); 
  }
}

//create post callback
function madePost(error, response) {
  if(!error) {
    Britto.setPage('/', false, true);
  }
}

function loginCallback(error, returnVal) {
  if(!error) {
    Session.set('auth', returnVal.auth);
    Session.set('user', returnVal);
    Britto.setPage('user_area', false, true);
  }
  return false;
}

function renderNewSlide(content) {
  Britto.log('Render new slide');
  newSlide = $('<div class="slide">' + content + '</div>');
  newSlide.css('left', '0%');
  newSlide.css('top', '2em');
  newSlide.css('display', 'none');
  $('#slides').append(newSlide);
  if($('#slides .slide').length > 1) {
    counter = $('#slides .slide').length;
    $('#slides .slide').each(function(index) {
      if(index+1 !== counter) {
        $(this).fadeOut('slow').promise().done(function() {$(this).remove();});
      } else {
        $('#slides .slide:last').fadeIn('slow');
      }
    });
  } else {
    $('#slides .slide:last').css('display','block');
  }
}

Meteor.startup(function() {
  $('body').on('click', 'a[rel="internal"]', function(e){
    e.preventDefault();
    link = $(this).attr('href');
    Britto.navigate(link, true);
    Britto.log('Link clicked');
    Britto.log(Router);
    Britto.log(link);
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

  $('body').on('submit', '#change-user-button', changeUser);
  $('body').on('click', '#change-user-button', changeUser);

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
    Britto.setPage('', false, true);
  } else {
    Britto.alert('error', 'There was an error updating that');
  }    
}

function changePassword(e) {
  e.preventDefault();
  if(Session.get('auth')) {
    if($('#change-new-password').val() === '') {
      Britto.alert('warning', 'Your passwords were blank, what sort of parents would we be letting you do that?');
      return;
    }
    if($('#change-new-password').val() == $('#change-repeat-password').val()) {
      Meteor.call('changePassword', {current_password: $('#change-current-password').val(), password: $('#change-new-password').val(), auth: Session.get('auth')}, standardHandler);
    } else {
      Britto.alert('warning', 'Your passwords were not the same');
    }
  }
}

function changeUser(e) {
  e.preventDefault();
  if(Session.get('auth')) {
    details = {auth: Session.get('auth'), name: $('#change-user-name').val()};
    Meteor.call('changeUser', details, standardHandler);
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
    Britto.setPage('/', false, true);
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