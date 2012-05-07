//This is here to speed the site name being shown, sorry kids
Handlebars.registerHelper('setting', function(options) {
  //TODO: escaping the key here could cause issues
  var key = options.fn(this);
  var setting = Settings.findOne({key: key.toString()});
  if(setting) {
    return Handlebars._escape(setting.value);
  }
  return '';
});

Britto = {};

Britto.settingsLoaded = function() {
  Stellar.log('settings loaded');
  timeLoad = new Date().getTime();
  Britto.load.analytics();
  Britto.load.madewith();
}

Meteor.subscribe("allsettings", Britto.settingsLoaded);

Meteor.subscribe("allblogroll");
Meteor.subscribe("allposts");
//TODO change this to a per post subscription - removing it was killing the templates :/
Meteor.subscribe("allcomments");
Meteor.subscribe("allusers");

Britto.alert = function(type, message) {
  Stellar.log(message);
  className = 'alert';
  if(type == 'warning' || type == 'info' || type == 'error') {
    className += ' alert-'+type
  }
  if(type == 'warning') {
    sarcasm = 'You better check yourself; before you wreck yourself';
    message = sarcasm+': '+message;
  }
  alert = $('<div class="'+className+'">  <button class="close" data-dismiss="alert">×</button>  '+message+'</div>').alert();
  $('#mainContent').prepend(alert);
}

Britto.load = {};

//TODO this is a hack as it shouldn't be here, I need to get Madewith allowing me to change the path
Britto.load.madewith = function() {
  madewith = Settings.findOne({key: 'madewith_shortname'});
  if(madewith && madewith.value != '') {
    var hostname = madewith.value;
    var match = hostname.match(/(.*)\.meteor.com$/);
    var shortname = match ? match[1] : hostname; // connect to madewith and subscribe to my app's record
    var server = Meteor.connect("http://madewith.meteor.com/sockjs");
    var sub = server.subscribe("myApp", hostname);

    // minimongo collection to hold my singleton app record.
    var apps = new Meteor.Collection('madewith_apps', server);

    server.methods({
      vote: function (hostname) {
        apps.update({name: hostname}, {$inc: {vote_count: 1}});
      }
    });

    Template.madewith.vote_count = function() {
      var app = apps.findOne();
      return app ? app.vote_count : '???';
    };

    Template.madewith.shortname = function () {
      return madewith;
    };

    Template.madewith.events = {
      'click .madewith_upvote': function(event) {
        var app = apps.findOne();
        if (app) {
          server.call('vote', hostname);
          // stop these so you don't click through the link to go to the
          // app.
          event.stopPropagation();
          event.preventDefault();
        }
      }
    };

    $('body').append(Meteor.ui.render(function() { return Template.madewith();}));
  }
}

Britto.load.analytics = function() {
  analytics = Settings.findOne({key: 'analytics_code'});
  if(analytics && analytics.value != '') {
    $.ga.load(analytics.value);
  }
}

$(window).bind('stellar_page_load', function(event, path) {
  if(path && $.ga && $.ga.trackPageview) {
    try {
      $.ga.trackPageview(path);
    } catch(err) {
      Stellar.log('Not tracking due to issue :/');
    }
  }
});

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

//create post callback
function madePost(error, response) {
  if(!error) {
    Stellar.redirect('/');
  } else {
    return standardHandler(error, response);
  }
}

function loginCallback(error, returnVal) {
  if(!error) {
    Session.set('auth', returnVal.auth);
    Session.set('user', returnVal);
    Stellar.redirect('user_area');
  } else {
    return standardHandler(error, response);
  }
}

/* TODO - Goodbye for now, add back later
function renderNewSlide(content) {
  Stellar.log('Render new slide');
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
*/

Meteor.startup(function() {
  //Internal Meteor events don't seem to always fire TODO check for bugs
  //TODO need a better way to do this crap
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

  $('body').on('submit', '#add-user-button', addUser);
  $('body').on('click', '#add-user-button', addUser);

  $('body').on('change', '#post-title', changeTitle);

  $('body').on('submit', '#add-blog-roll-button', addBlogRoll);
  $('body').on('click', '#add-blog-roll-button', addBlogRoll);

  $('body').on('click', '.delete-comment', deleteComment);
  $('body').on('click', '.delete-post', deletePost);
  $('body').on('click', '.delete-user', deleteUser);
  $('body').on('click', '.delete-blog-roll', deleteBlogRoll);

  $('body').on('click', '.edit-post', editPost);

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
    Stellar.redirect('');
  } else {
    if(error.error == 401) {
      Stellar.redirect('home/login');
      Britto.alert('error', error.reason);
      return false;
    }
    Britto.alert('error', 'There was an error updating that');
    return false;
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

function addUser(e) {
  e.preventDefault();
  if(Session.get('auth')) {
    details = {auth: Session.get('auth'), name: $('#add-user-name').val(), username: $('#add-user-username').val(), password: $('#add-user-password').val()};
    Meteor.call('addUser', details, standardHandler);
  }
}

function addBlogRoll(e) {
  e.preventDefault();
  if(Session.get('auth')) {
    details = {auth: Session.get('auth'), name: $('#add-blog-roll-name').val(), link: $('#add-blog-roll-link').val()};
    Meteor.call('insertBlogRoll', details, standardHandler);
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


function deleteUser(e) {
  e.preventDefault();
  if(Session.get('auth') && confirm('Are you sure you want to delete this user?')) {
    target = e.target;
    userId = $(target).attr('data-user-id');
    Meteor.call('removeUser', {id: userId, auth: Session.get('auth')}, standardHandler);
  }
}

function deleteBlogRoll(e) {
  e.preventDefault();
  if(Session.get('auth')) {
    target = e.target;
    id = $(target).attr('data-id');
    Meteor.call('deleteBlogRoll', {id: id, auth: Session.get('auth')}, standardHandler);
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

function editPost(e) {
  e.preventDefault();
  target = e.target;
  postId = $(target).attr('data-slug');
  Stellar.redirect('/user_area/edit?id='+postId);
}

function deletedPost(error, response) {
  if(!error && response) {
    Stellar.redirect('/');
  } else {
    return standardHandler(error, response);
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
  } else {
    return standardHandler(error, response);
  }
}