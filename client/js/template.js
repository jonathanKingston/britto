Template.sidelinks.blogRoll = function() {
  var blogRoll = BlogRoll.find();
  if(blogRoll && blogRoll.count() > 0) {
    return blogRoll;
  }
  return false;
}

Template.nav.links = function() {
  var links = [{url: '/blog/', text: 'Home'}];
  if(Session.get('user')) {
    links.push({url: '/user_area', text: 'User area'});
    links.push({url: '/user_area/users', text: 'Users'});
    links.push({url: '/user_area/options', text: 'Options'});
    links.push({url: '/user_area/settings', text: 'Settings'});
    links.push({url: '/home/logout', text: 'Logout'});
  } else {
    links.push({url: '/home/login', text: 'Login'});
  }

  return links;
}

_.each(['postShort', 'post'], function(template) {
  Template[template].commentCount = function(id) {
    return Comments.find({postId: id}).count();
  }

  Template[template].postUser = function(id) {
    user = Users.findOne({_id: id});
    if(user) {
      return user.name;
    } else {
      return '';
    }
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

//Hack to hell - this needs to go soon as possible
Template.post.attach_event = function(slug) {
  //Use this to add some lag to the event
  $('head').append('<script type="text/javascript">Britto.load.disqus("/blog/'+slug+'");</script>');
}

Template.listView.attach_event = function() {
  //Use this to add some lag to the event
  $('head').append('<script type="text/javascript">Britto.load.disqusCount();</script>');
}

_.each(['postShort', 'post', 'postView'], function(template) {
  Template[template].disqus = function() {
    setting = Settings.findOne({key: 'disqus'});
    if(setting && setting.value != '') {
      return setting.value;
    }
    return false;
  }
});

_.each(['options', 'user_area', 'comment', 'nav', 'post'], function(template) {
  Template[template].user = function() {
    return Session.get('user');
  }
});
