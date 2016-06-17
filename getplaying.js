
var hide = true;
var currLyrics = "";

var getlyrics = function() {
	window.resizeTo(400,500);
	var SpotifyWebHelper = require('@jonny/spotify-web-helper')
	var helper = SpotifyWebHelper()

	helper.player.on('ready', function(){
		var song = helper.status.track.track_resource.name;
		var artist = helper.status.track.artist_resource.name;
		
		var music = require('musicmatch')();
		
		music.matcherLyrics({q_track: song, q_artist: artist})
		.then(function(trackfound) {

		document.getElementById("title").innerHTML =  artist + ' - ' + song;
		
			if (trackfound.message.body.lyrics.instrumental){
				document.getElementById("lyrics").innerHTML = artist + ' - ' + song + '\n' + "Instrumental";
			}
			else {
				currLyrics = '\n' + trackfound.message.body.lyrics.lyrics_body;
				document.getElementById("lyrics").innerHTML = currLyrics;
			}
			
		}).catch(function(err){
			console.log(err);
		});
		
	});
	
};

var hidelyrics = function() {
	if (hide) {
		document.getElementById("lyrics").innerHTML = "";
		window.resizeTo(250,10);
		hide = false;
	}
	else {
		document.getElementById("lyrics").innerHTML = currLyrics;
		window.resizeTo(400,500);
		hide = true;
	}
};

