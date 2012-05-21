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


//called in user_area.html to get all users for the author select fields
Template.user_area.userlist = function () {
  return Users.find({}, { fields: { name: 1 } });
}

Template.user_area.dates = function () {
  dates = {};
  //first get now
  now = new Date();
  
  created = now;
  
  if ( params.id ) {
    created = Posts.find({ slug: params.id }, { fields: { created: 1 } });
  }
  
  if ( created && created.created && !isNaN( created.created.getTime() ) ) {
    now = created.created;
  }
  year = now.getFullYear();
  
  //setting the years:
  years = [];
  yearmax = year + 5;
  for ( var i = 1990; i < yearmax; i++ ) {
    selected = is_selected(i, year );
    years.push({ year: i, selected: selected });
  }
  dates.years = years;
  
  //setting the month
  months = [];
  for ( var i = 0; i < 12; i++ ) {
    selected = is_selected( i, now.getMonth() );
    months.push ( {monthnum: i, monthname: getMonthName(i), selected: selected} );
  } 
  dates.months = months;
  
  //setting the days for the current month
  days = [];
  //setting plus 1 to get the 0 day of the next month (last day of this month)
  monthForDay = now.getMonth() +1;
  //day 0 actually is the last day of the previous month
  
  lastDayInMonth = new Date( now.getFullYear(), monthForDay, 0 ).getDate();
  
  for ( var i = 1; i <= lastDayInMonth; i++ ) {
    selected = is_selected(i, now.getDate() );
    days.push({ day: i, selected: selected });
  }
  dates.days = days;
  
  //adding hours
  hours = [];
  for ( var i = 0; i < 24; i++ ) {
    selected = is_selected(i, now.getHours() );
    hours.push({hour: i, selected: selected });
  }
  dates.hours = hours;
  
  //adding minutes and seconds
  minutes = [];
  for ( var i = 0; i < 60; i++ ) {
    selected = is_selected(i, now.getMinutes() );
    
    minutes.push({ minute: i, selected: selected });
  }
  dates.minutes = minutes;
  
  return dates;
}

function is_selected ( i, now ) {
  if ( i == now ) {
    return true;
  }
  return false;
}

function getMonthName (month) {
  //maybe add this to the admin later, formatting of the date string as well as monthnames.
  var m = ['January','February','March','April','May','June','July', 'August','September','October','November','December'];
  return m[month];
} 

