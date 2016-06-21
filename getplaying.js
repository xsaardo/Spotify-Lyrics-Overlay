
var hide = true;
var currLyrics = "";

var getlyrics = function() {
	
	var SpotifyWebHelper = require('@jonny/spotify-web-helper')
	var music = require('musicmatch')();
	
	window.resizeTo(400,500);
	
	var helper = SpotifyWebHelper()
	
	document.getElementById("lyrics").innerHTML = "";
	
	helper.player.on('ready', function(){
		var song = helper.status.track.track_resource.name;
		var artist = helper.status.track.artist_resource.name;
		
		music.matcherLyrics({q_track: song, q_artist: artist})
		.then(function(trackfound) {

			document.getElementById("title").innerHTML =  artist + ' - ' + song;
			
			
				if (trackfound.message.body.lyrics.instrumental){
					currLyrics = '\n' + artist + ' - ' + song + '\n' + "Instrumental";
					document.getElementById("lyrics").innerHTML = currLyrics;
				}
				
				else if (trackfound.message.body.lyrics.restricted){
					altLyricsSearch(song,artist);
				}
				
				else {
					currLyrics = '\n' + artist + ' - ' + song + '\n' + trackfound.message.body.lyrics.lyrics_body;
					document.getElementById("lyrics").innerHTML = currLyrics;
				}
			
		}).catch(function(err){
			altLyricsSearch(song,artist);
		});
		
	});
	
};

var hidelyrics = function() {
	if (hide) {
		document.getElementById("lyrics").innerHTML = "";
		window.resizeTo(250,10);
		hide = false;
		document.getElementById("showhide").innerHTML = "Show Lyrics";
	}
	else {
		document.getElementById("lyrics").innerHTML = currLyrics;
		window.resizeTo(400,500);
		hide = true;
		document.getElementById("showhide").innerHTML = "Hide Lyrics";
	}
};

var altLyricsSearch = function(song,artist) {
	
	artist = artist.replace(/[^\w]|_/g, "");
	artist = artist.toLowerCase();
	if (artist.substring(0,3) == "the") {
		artist = artist.substring(3);
	}
	
	song = song.replace(/[^\w]|_/g,"");
	song = song.toLowerCase();
	
	url = "http:\/\/www.azlyrics.com\/lyrics\/" + artist + "\/" + song + ".html";
	
	httpGet(url);
}

function httpGet(theUrl)
{  
	var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var xmlhttp = new XMLHttpRequest();
    var htmlcode;
	
    xmlhttp.onreadystatechange=function()
    {
        if (xmlhttp.readyState==4 && xmlhttp.status==200)
        {
			htmlcode = xmlhttp.responseText;
			htmlcode = htmlcode.substring(htmlcode.search("Sorry about that. -->"));
			htmlcode = htmlcode.substring(23,htmlcode.search("</div>"));
			document.getElementById("lyrics").innerHTML = '\n' + htmlcode;
			currLyrics = '\n' + htmlcode;
        }
    }
	
    xmlhttp.open("GET", theUrl, true);
    xmlhttp.send();
}
