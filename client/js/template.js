Template.widgets.showSearch = function () {
  setting = Settings.findOne({key: 'show_search'});
  if ( setting && setting.value ) {
    return setting.value;
  }
  return false;
}
Template.widgets.showBlogRoll = function () {
  setting = Settings.findOne({key: 'show_blogroll'});
  if ( setting && setting.value ) {
    return setting.value;
  }
  return false;
}
Template.widgets.showTagCloud = function () {
  setting = Settings.findOne({key: 'show_tagcloud'});
  if ( setting && setting.value ) {
    return setting.value;
  }
  return false;
}
Template.sidelinks.blogRoll = function() {
  var blogRoll = BlogRoll.find();
  if(blogRoll && blogRoll.count() > 0) {
    return blogRoll;
  }
  return false;
}

Template.nav.links = function() {
  var post_sub_links = [];
  
  //replace this with database entries soon
  var links = [{url: '/blog/', text: 'Home'}];
  
  //if the user is not logged in, show loginlink in menu
  if(!Session.get('user')) {
    links.push({url: '/home/login', text: 'Login'});
  }else{
    links.push({url: '/home/logout', text: 'Logout'});
  }

  return links;
}

//helper to easily see if the user is logged in.
Template.user_area_nav.user_is_logged_in = function () {
  return Session.get('user');
}

//admin menu
Template.user_area_nav.user_area_links = function () {
  //only show to logged in users
  if (!Session.get('user')) {
    return false;
  }
  //defining the menu items.
  //should be read from the db soon - hmm might slow it down while we don't have prerendered html
  user_area_links = [
    {url: '/user_area/posts', text: 'Posts'},
    {url: '/user_area', text: '&nbsp;&nbsp;New Post'}, //TODO make sub pages here and neaten up, this path should be /user_area/posts/new but that needs a change in stellar :/
    {url: '/user_area/post_tags', text: '&nbsp;&nbsp;Tags'},
    {url: '/user_area/users', text: 'Users'},
    {url: '/user_area/options', text: 'Options'},
    {url: '/user_area/settings', text: 'Settings'}
  ];
  
  return user_area_links;
}

_.each(['postShort', 'post'], function(template) {
  //get commentcount
  Template[template].commentCount = function(id) {
    return Comments.find({postId: id}).count();
  }
  
  //helper that returns the name after getting the user._id
  Template[template].postUser = function(id) {
    user = Users.findOne({_id: id});
    if(user) {
      return user.name;
    } else {
      return '';
    }
  }
});

//list of comments for one post
Template.comments.commentslist = function(post) {
  console.log('commentslist');
  console.log(this);
  console.log(post);
  if(!post) {
    return false;
  }
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


_.each(['postShort', 'post', 'postView', 'post_list', 'user_area'], function(template) {
  Template[template].disqus = function() {
    setting = Settings.findOne({key: 'disqus'});
    if(setting && setting.value != '') {
      return setting.value;
    }
    return false;
  }
  
  Template[template].hasTag = function ( postId ) {
    tagCount = TagsInPosts.find( { postId: postId} ).count()
    if ( !tagCount || tagCount == 0 ) {
      return false;
    }
    return  tagCount > 0;
  }
  
  Template[template].postTags = function( postId ) {
    tagsInPost = TagsInPosts.find( { postId: postId }, {fields: { tagId: 1 } } );
    
    tagIds = [];
    tagsInPost.forEach ( function ( tag ) {
      tagIds.push ( tag.tagId );
    });
    
    tags = Tags.find({ _id: { $in: tagIds } }, {fields: { name: 1, slug: 1 }});
    
    if ( tags ) {
      return tags;
    } else {
      return false;
    }
  }
});

_.each(['options', 'user_area', 'post_list', 'comment', 'nav', 'post'], function(template) {
  Template[template].user = function() {
    return Session.get('user');
  }
});


Template.post_list.postUser = function(id) {
  user = Users.findOne({_id: id});
  if(user) {
    return user.name;
  } else {
    return '';
  }
}


//called in user_area.html to get all users for the author select fields
Template.user_area.userlist = function () {
  return Users.find({}, { fields: { name: 1, _id: 1 } });
}

_.each(['user_area', 'tagcloud'], function (template) {
  Template[template].alltags = function(){
    
    tags = Tags.find({}, { fields: { name: 1, slug: 1, _id: 1 } });

    //this should be moved somewhere else or be cached, pretty intensely hitting the database here i guess
    counts = [];
    highest_count = 0;
    lowest_count = 1000;
    
    tagsWithCount = [];
    tags.forEach(function(tag){
      count = TagsInPosts.find({ tagId: tag._id }).count();
      if ( highest_count < count ) {
        highest_count = count;
      }
      if ( lowest_count > count && count > 0 ) {
        lowest_count = count;
      }
      returnTag = { count: count, name: tag.name, slug: tag.slug};
      tagsWithCount.push(returnTag);
    });    
    
    
    returnTags = [];
    for (var i = 0; i < tagsWithCount.length; i++ ){
      
      tag = tagsWithCount[i];
      
      fontsize = tag.count / ( highest_count - lowest_count );
      //TODO This should be classes
      if ( fontsize > 1.4 ) {
        fontsize = 1.4;
      }
      if ( fontsize < 1 ) {
        fontsize = 1;
      }
      
      returnTag = { fontsize: fontsize, name: tag.name, slug: tag.slug};
      returnTags.push(returnTag);
    }
    return returnTags;
  }
});

//TODO neaten this method, needs explanation too
Template.user_area.dates = function () {
  dates = {};
  //first get now
  now = new Date();
  
  created = now;
  
  if(params.id) {
    created = Posts.find({ slug: params.id }, { fields: { created: 1 } });
  }
  
  if(created && created.created && !isNaN(created.created.getTime())) {
    now = created.created;
  }
  year = now.getFullYear();
  
  //setting the years:
  years = [];
  yearmax = year + 5;
  for(var i = 1990; i < yearmax; i++) {
    selected = is_selected(i, year );
    years.push({ year: i, selected: selected });
  }
  dates.years = years;
  
  //setting the month
  months = [];
  for(var i = 0; i < 12; i++) {
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
  
  for(var i = 1; i <= lastDayInMonth; i++) {
    selected = is_selected(i, now.getDate() );
    days.push({ day: i, selected: selected });
  }
  dates.days = days;
  
  //adding hours
  hours = [];
  for(var i = 0; i < 24; i++) {
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

function is_selected(i, now) {
  if ( i == now ) {
    return true;
  }
  return false;
}

function getMonthName(month) {
  //maybe add this to the admin later, formatting of the date string as well as monthnames.
  var m = ['January','February','March','April','May','June','July', 'August','September','October','November','December'];
  return m[month];
}
