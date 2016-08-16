
var hide = true;
var currLyrics = "";
var currHeight = 0;
var currWidth = 0;



var getlyrics = function() {
	hide = true;
	document.getElementById("showhide").innerHTML = "Hide Lyrics";
	var SpotifyWebHelper = require('@jonny/spotify-web-helper')
	var music = require('musicmatch')();
	
	window.resizeTo(370,420);
	var helper = SpotifyWebHelper()
	
	document.getElementById("lyrics").innerHTML = "";
	
	helper.player.on('ready', function(){
		var song = helper.status.track.track_resource.name;
		var artist = helper.status.track.artist_resource.name;
		
		document.getElementById("title").innerHTML =  artist + ' - ' + song;
		
		document.getElementById("class1").innerHTML ='<b>' + artist + '</b><br><i>' + song +'</i>';
		/*
		artist = artist.replace(/[^\w]|_/g, "");
		artist = artist.toLowerCase();
		
		song = song.replace(/[^\w]|_/g, "");
		song = song.toLowerCase();
		*/
		
		$.getJSON("http://api.musixmatch.com/ws/1.1/matcher.track.get?q_artist="+artist+"&q_track="+song+"&apikey=d6b13470cafb0e694399017249e66227&callback=trackfound", function(trackfound) {
		
			document.getElementById("albumart").src = trackfound.message.body.track.		album_coverart_100x100;
				
			if (trackfound.message.body.track.has_lyrics == 0) {
				altLyricsSearch(song,artist);
			}
			
			$.getJSON("http://api.musixmatch.com/ws/1.1/matcher.lyrics.get?q_artist=" + artist + "&q_track=" + song + "&apikey=d6b13470cafb0e694399017249e66227&callback=lyricsfound",function(lyricsfound) {
				if (lyricsfound.message.body.lyrics.instrumental){
						currLyrics = "Instrumental";
						document.getElementById("lyrics").innerHTML = currLyrics;
				}
				
				else if (lyricsfound.message.body.lyrics.restricted){
					altLyricsSearch(song,artist);
				}
				
				else {
					currLyrics = lyricsfound.message.body.lyrics.lyrics_body;
					document.getElementById("lyrics").innerHTML = currLyrics;
				}
			});
			
		});	
		
			/*
		music.matcherTrack({q_track: song, q_artist: artist})
		.then(function(trackfound) {
				
				document.getElementById("albumart").src = trackfound.message.body.track.album_coverart_100x100;
				
				if (trackfound.message.body.track.has_lyrics == 0) {
					altLyricsSearch(song,artist);
				}
				
				music.trackLyrics({track_id:trackfound.message.body.track.track_id})
				.then(function(lyricsfound) {
					if (lyricsfound.message.body.lyrics.instrumental){
						currLyrics = "Instrumental";
						document.getElementById("lyrics").innerHTML = currLyrics;
					}
					
					else if (lyricsfound.message.body.lyrics.restricted){
						altLyricsSearch(song,artist);
					}
					
					else {
						currLyrics = lyricsfound.message.body.lyrics.lyrics_body;
						document.getElementById("lyrics").innerHTML = currLyrics;
					}
				})
		}).catch(function(err){
			altLyricsSearch(song,artist);
		});*/
		
	});
	
};

var hidelyrics = function() {
	if (hide) {
		document.getElementById("lyrics").innerHTML = "";
		window.resizeTo(370,120);
		hide = false;
		document.getElementById("showhide").innerHTML = "Show Lyrics";
	}
	else {
		document.getElementById("lyrics").innerHTML = currLyrics;
		window.resizeTo(370,420);
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
			htmlcode = htmlcode.replace("<br>","");
			document.getElementById("lyrics").innerHTML =htmlcode;
			currLyrics = htmlcode;
        }
    }
	
    xmlhttp.open("GET", theUrl, true);
    xmlhttp.send();
}