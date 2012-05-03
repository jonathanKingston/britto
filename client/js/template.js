Template.sidelinks.sidelinks = function() {
  var sidelinks = Sidelinks.find();
  if(sidelinks && sidelinks.count() > 0) {
    return sidelinks;
  }
  return false;
}

Template.posts.postlist = function() {
  return Posts.find({}, {sort: {created: -1}});
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
