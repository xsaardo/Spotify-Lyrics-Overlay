#### Spotify Lyrics Overlay
Displays lyrics for the current track playing on Spotify on top of all other windows

##### Instructions:
* Install [node.js v4.45 LTS](https://nodejs.org/en/)

* Ensure you have the latest version of npm 

Using Powershell with administrative privileges: 
```
npm install npm -g
```

* Download repo

* cd to the repo and install the required node packages

```
npm install musicmatch
npm install "@jonny/spotify-web-helper"
npm install xmlhttprequest
```
* Download [NW.js NORMAL](http://nwjs.io/)

* Unzip the contents of the folder in the zip into the repo folder (nw.exe should be in the same directory as package.json)

* If the above setup is done correctly /Spotify-Lyrics-Overlay-master should also contain a node_modules folder and nw.exe

* Run nw.exe (If any time it doesn't seem to be working restart the SpotifyWebHelper.exe process located at $APPDATA%/Roaming/Spotify/)

* Example: ![alt tag](https://www.dropbox.com/s/l70lu0xjc09kijm/Screenshot%202016-06-22%2019.33.28.png) 

