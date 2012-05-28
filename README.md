Britto
======

Britto a simple blog made with Meteor.
Current version: 0.2.4

How to use
----------

To use Britto, you need to install Meteor:

    curl install.meteor.com | sh

Then you can clone the code onto your system:

    git clone git://github.com/jonathanKingston/britto.git

Add packages Britto needs:

    //You need to add in Stellar which isn't an official package yet
    //My meteor package dir was here: /usr/lib/meteor/packages/  or  /usr/local/meteor/packages. You should just be able to run the following command there.
    //If however this offends you, you should be able to copy stellas contents into the lib/ folder and it work fine :)
    git clone git://github.com/jonathanKingston/stellar.git
    
    //In the app direcory now:
    meteor add stellar

Move to that directory and deploy to your own location:

    cd britto
    meteor deploy [yourlocation].meteor.com

You can then visit your applications address and login with username: admin and password: password.

Styling
-------

To style Meteor you can edit: /client/css/britto.css
To use bootstrap:
  rm /client/css/britto.css
  mv /client/css/britto.bootstrap /client/css/britto.css
  meteor add bootstrap


Legacy
------
So if anyone wanted page transitions from before... it has been disabled but it is coming back, the code is still available just not working just yet :).