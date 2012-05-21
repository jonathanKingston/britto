Meteor.startup(function () {

//  console.log('Setup settings');
  setSetting('site_name', 'Britto blog', 'This is the name of your site');
  setSetting('disqus', '', 'This is to enable disqus comments on the blog instead of inbuilt comments, leave blank to use inbuilt ones');
  setSetting('analytics_code', '', 'Enable google analytics by adding code here');
  setSetting('madewith_shortname', 'britto.meteor.com', 'Enable madewith on your site specify [appname.meteor.com] or [urlname.com]');

  if(Users.find().count() === 0) {
    console.log('Adding in users');
    userId = createUser({username: 'admin', password: 'password', name: 'Your name'});
    userId2 = createUser({username: 'admin2', password: 'password', name: 'Your other name'});
    
    console.log('Logging in test user');
    var user = loginUser('admin', 'password');
    var key = user.auth;
    console.log('Adding in test post');
    makePost({title: 'Hello world', body: 'Cruel cruel world', slug: 'yellow_world', auth: key, author: userId, published: true, created: new Date() });
    
    //Make a long post now
    console.log('Adding in test post2');
    makePost({title: 'White Riot', body: "White riot - a riot of my own\nWhite riot - I want to riot\nWhite riot - a riot of my own\n\nBlack people gotta lot a problems\nBut they don't mind throwing a brick\nWhite people go to school\nWhere they teach you how to be thick\n\nAn' everybody's doing\nJust what they're told to\nAn' nobody wants\nTo go to jail!\n\n\nll the power's in the hands\nOf people rich enough to buy it\nWhile we walk the street\nToo chicken to even try it\n\nEverybody's doing\nJust what they're told to\nNobody wants\nTo go to jail!\n\nAre you taking over\nOr are you taking orders?\nAre you going backwards\nOr are you going forwards?", slug: 'white_riot', auth: key, author: userId, published: true, created: new Date() });
    
    console.log('Adding in test post3 - this should not be shown');
    makePost({title: 'White Riot - should not be shown', body: "should not be shown", slug: 'shouldnt_show', auth: key, author: userId2, published: false, created: new Date() });
    
    console.log('Log out test user');
    logoutSession(key);
  }
});
