Britto.plugin = {};

Britto.plugin.installed = Stellar.Collection('Britto_plugin_installed');
//TODO add installed plugins run

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
    Britto.plugin.installed.update({name: pluginName}, {$set: {installed: true}});
    return true;
  }
  return false;
};

Britto.plugin.run = function(pluginName) {
  //ADD in check if installed here then run
};