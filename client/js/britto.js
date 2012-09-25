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
//TODO change this to a per post subscription - removing it was killing the templates :/
Meteor.subscribe("allcomments");
Meteor.subscribe("allusers");
Meteor.subscribe("alltags");
Meteor.subscribe("alltagsinposts");

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
      return madewith.value;
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

    $('body').append(Meteor.render(function() { return Template.madewith();}));
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
    var disqus_identifier = '/blog/'+slug;
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
