Stellar = {};
Stellar._controllers = {};
Stellar.client = {};
Stellar.page = {};
Stellar.loaded = false;

Stellar.client.init = function() {
  if(Meteor.is_client) {
    //Call controllers when everything exists
    Stellar.page.call();

    Stellar.log('Init');
    Stellar.loaded = true;
    Meteor.startup(function() {
      Stellar.client.linkHandler();
    });
  }
}

Stellar.client.linkHandler = function() {
  $('body').on('click', 'a', function(e){
    link = $(this).attr('href');
    //TODO decide what links should use this function
    if(!link.match(/^http:\/\/www\./)) {
      e.preventDefault();
      Stellar.log('Link clicked');
      Stellar.navigate(link, true);
      Stellar.log('Link Navigated');
      Stellar.page.call();
      Stellar.log('Link called');
    }
  });
}

Stellar.client.registerHelper = function(name, func) {
  if(Meteor.is_client) {
    Handlebars.registerHelper(name, func);
  }
};

Stellar.navigate = function(path, load) {
  Stellar.log('Navigate to:' + path);
  Stellar.logPageLoad(path);
  Router.navigate(path, load);
};

Stellar.render = function(template, properties) {
  Stellar.log('Render called: ' + template);
  if(properties) {
    _.each(properties, function(property, key) {
      Stellar.log(key);
      Stellar.log(property);
      Template[template][key] = property;
    });
  }
  Stellar.page.template = template;
  Stellar.page.context.invalidate();
};

Stellar.logPageLoad = function(path) {
//TODO make this an event where a analytics extension can hook in instead
//  if(Stellar.analytics) {
//    Stellar.log('log page'+path);
//    Stellar.analytics.push(['_trackPageview', path]);
//  }
};

//This will allow us to turn logs off quicker
Stellar.log = function(message) {
  if(console && console.log) {
    console.log(message);
  }
}

Stellar.Controller = function(name) {
  self = this;
  Stellar._controllers[name] = self;
};

Stellar.Collection = function(name, manager, driver) {
  collection = new Meteor.Collection(name, manager, driver);
  if(Meteor.is_server) {
    Meteor.startup(function () {
      _.each(['insert', 'update', 'remove'], function(method) {
        Meteor.default_server.method_handlers['/' + name + '/' + method] = function() {};
      });
    });
  }
  return collection;
};

Stellar.page.set = function(controller, action) {
  //TODO make this whole method more flexible
  Stellar.log('Set page called');
  Stellar.log('Controller: ' + controller);
  Stellar.log('Action: ' + action);
  Stellar.page.controller = controller;

  if(!action) {
    action = 'index';
  }

  params = {};
  //TODO - pass in get string here
  actionBits = action.split('#');
  action = actionBits[0];
  params['hash'] = actionBits[1];

  //Check for controller, if it exists check for that action
  //If it doesn't exist look for a show action instead
  if(Stellar._controllers[controller]) {
    if(!Stellar._controllers[controller][action] && Stellar._controllers[controller]['show']) {
      params['show'] = action;
      action = 'show';
    }
  }

  Stellar.page.params = params;
  Stellar.page.action = action;
};

Stellar.page.call = function() {  
  Stellar.log(Stellar._controllers[Stellar.page.controller.toString()]);
  Stellar.log(Stellar.page.controller);
  if(Stellar._controllers[Stellar.page.controller]) { //TODO fix missing error
    controllerObj = Stellar._controllers[Stellar.page.controller];
    Stellar.log(controllerObj);
    if(controllerObj[Stellar.page.action]) {
      controllerObj[Stellar.page.action]();
    }
  }
};

Stellar.client.registerHelper('stellar_page', function() {
  Stellar.log('Content helper');
  var context = Meteor.deps.Context.current;
  if(context && !Stellar.page.context) {
    Stellar.page.context = context;
    context.on_invalidate(function() {
      Stellar.log('invalidate');
      Stellar.page.context = null;
    });
  }

  if(Stellar.loaded) {
    if(Template[Stellar.page.template]) {
      console.log('Load new page');
      return Meteor.ui.chunk(function() { return Template[Stellar.page.template]();});
    } else {
      throw new Meteor.Error('404', 'Page not found');
    }
    return '';
  }
  Stellar.log('Show nowt');
  return '';
});

if(Meteor.is_client) {
  //This needs to be called so all the controllers are initialised
  $(window).load(function() {
    Stellar.client.init();
  });

  StellarRouter = Backbone.Router.extend({
    routes: {
      ":controller/:action": "actionPage",
      ":contoller/:action/": "actionPage",
      "/": "homePage",
      "": "homePage",
      ":controller": "basicPage",
      ":controller/": "basicPage",
    },
    homePage: function() {
      Stellar.page.set('home');
    },
    basicPage: function(controller) {
      Stellar.page.set(controller);
    },
    actionPage: function(controller, action) {
      Stellar.page.set(controller, action);
    }
  });
  Router = new StellarRouter;

  Backbone.history.start({pushState: true});
}