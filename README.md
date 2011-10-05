# WASP 

## Overview

  Wasp is a monitoring tool, exclusively based on NodeJS. 
  It aims to be light and extensible, for the delight of developpers.

  Wasp comes in two parts:
  - a web application, that can be installed multiples times. 
    Each webapp can handle advanced scripting behavior, using a plugins system called "viewers".

  - the workers, basically the daemons you have to install on each system you want to monitor.
    Each worker use a plugins system called "watchers". 
    Watcher are about monitoring and providing API to execute basic commands on the monitored task.
    For example, a typical watcher will expose the info command, the must have command for every watcher, a start and stop command.


## How it works? Hands Shaking and Monitoring

 Well, first thing you do when installing Wasp is first to install workers on each system you want to monitor.
 Using appropriate watchers, you can monitor almost everything, if you can't find a Watcher type for a specific task, then just developp it and share it, it's just so easy.
 
 When you worker is up and running, it will expose each of your watcher and its associated through a REST interface.
 For example, let's say you monitoring a rails webserver and a redis database. 
 Your worker will expose the following routes:

- http://my-worker/
root : get worker's metadata and list all available watchers id and their associated refresh time
  response sample: 
```javascript
{
  "name":"my-worker",
  "timer":5000,
  "watchers": {

    "nginx": {
      "type":"http",
      "timer":5000
    },

    "resque": {
      "type":"process",
      "timer":5000
    }
  }
}
```
 
This means that the following routes are also exposed for both of them
 
    http://my-worker/nginx
    http://my-worker/nginx/start
    http://my-worker/nginx/stop
    http://my-worker/nginx/info
  

## Requirements

  - NodeJS 4.x
  - Redis
  - Unix system

Wasp is currently not designed to work under Windows. 
Not that it's not going to work at all, it just hasn't be tested at all.

## Dashboard Webapp

### Installation

 Use npm to get the latest version of Wasp webapplication:
  
    npm install wasp-web

 Create a folder where you will place your Wasp config file:

    mkdir wasp-web

 Create the config file, if needed use wasp-starter.js.example available here on Github.
 Then start the application with the following command:

    node wasp-starter.js

  Note that the web app run on port 3001.

### Viewers

  Coming soon...

## Workers
  
  Worker is a daemon used for Wasp's goal : monitoring. Each workers depend only of your Redis server.

### Installation

 Use npm to get the latest version of Wasp Worker:
  
    npm install wasp-worker

 Create a folder where you will place your Wasp config file:

    mkdir wasp-worker

 Create the config file, if needed use wasp-worker-starter.js.example available here on Github.
 Then start the application with the following command:

    node wasp-starter.js

### Watchers

  Watchers will monitor a process, you can use a specific plugin for specific behavior.
  If i want to monitor nginx, i want to know if i can reach an URL like "/".
  See wasp-worker-starter.js.example for more information on Watcher's type.

### Mixins
  Coming soon

## Developper Guide

### Wasp webapp and Wasp-worker

 Clone (fork before) the Github repository in a dedicated folder. Let's say it's named %surce_dir%

 Install the project (to retrieve its dependencies) 

    /%source_dir%/npm install

 You're now ready to developp. You can start wasp (or wasp-worker).

    /%source_dir%/node wasp-starter.js
  
  You can also use "npm link" see http://npmjs.org/doc/link.html for more information.

  Note that each time you do a modification, you need to restart wasp.