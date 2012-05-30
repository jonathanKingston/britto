Britto.plugin = {};

//TODO add interface for all plugins
//TODO add this to client side too

Britto.plugin.installed = Stellar.Collection('Britto_plugin_installed');

Meteor.startup(function () {
  var installedPlugins = Britto.plugin.installed.find({installed: true});
  _.each(installedPlugins, function(plugin) {
    Britto.plugin.run(plugin.name);
  });
});

Britto.plugin.plugins = {};
 
Britto.plugin.add = function(pluginObject) {
  //TODO some validation here
  Britto.plugin.plugins[pluginObject.name] = pluginObject;
};

Britto.plugin.install = function(pluginName) {
  if(Britto.plugin.plugins[pluginName]) {
    var install = true;
    if(Britto.plugin.plugins[pluginName]['install']) {
      install = false;
      if(Britto.plugin.plugins[pluginName]['install']()) {
        install = true;
      }
    }
    Britto.plugin.installed.insert({name: pluginName, installed: true});
    return true;
  }
  return false;
};

Britto.plugin.uninstall = function(pluginName) {
  if(Britto.plugin.plugins[pluginName]) {
    var uninstall = true;
    if(Britto.plugin.plugins[pluginName]['uninstall']) {
      uninstall = false;
      if(Britto.plugin.plugins[pluginName]['uninstall']()) {
        uninstall = true;
      }
    }
    Britto.plugin.installed.update({name: pluginName}, {$set: {installed: false}});
    return true;
  }
  return false;
};

Britto.plugin.run = function(pluginName) {
  if(installed = Britto.plugin.installed.findOne({name: pluginName, installed: true})) {
    if(Britto.plugin.plugins[pluginName] && Britto.plugin.plugins[pluginName].run) {
      Britto.plugin.plugins[pluginName].run();
    }
  }
};