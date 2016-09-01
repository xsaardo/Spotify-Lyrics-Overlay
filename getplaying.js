
var hide = true;
var currLyrics = "";
var currHeight = 0;
var currWidth = 0;

var getlyrics = function() {
	hide = true;
	
	document.getElementById("showhide").innerHTML = "Hide Lyrics";
	
	var SpotifyWebHelper = require('@jonny/spotify-web-helper');
	//var music = require('musicmatch')(); Outdated
	
	window.resizeTo(370,420);
	var helper = SpotifyWebHelper();
	
	document.getElementById("lyrics").innerHTML = ""; // Clear window
	
	helper.player.on('ready', function(){
		// Find currently playing song
		var song = helper.status.track.track_resource.name;
		var artist = helper.status.track.artist_resource.name;
		// Write header (song + artist)
		document.getElementById("title").innerHTML =  artist + ' - ' + song;
		document.getElementById("class1").innerHTML ='<b>' + artist + '</b><br><i>' + song +'</i>';
		
		// Use musicmatch to find song
		$.getJSON("http://api.musixmatch.com/ws/1.1/matcher.track.get?q_artist="+artist+"&q_track="+song+"&apikey=d6b13470cafb0e694399017249e66227&callback=trackfound", function(trackfound) {
			// Set album art
			document.getElementById("albumart").src = trackfound.message.body.track.album_coverart_100x100;
				
			var searchterm = song + " " + artist;
			
			// Get lyrics
			$.getJSON("http://api.genius.com/search?q=" + searchterm + "&access_token=Et0edLuuw1UqlTV1QlvgUg0WNPqmAgNnJ5UbbB6giV74xIZyJic2JxvNpzeXYGCa&callback=json", function(json){
				var url = json.response.hits[0].result.url;
				url = url.slice(0,18) + "amp/" + url.slice(18);
				//alert(url);
				httpGet(url);
			});
		});	
		
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
			// Isolate lyrics html
			htmlcode = htmlcode.substring(htmlcode.search('<div class="lyrics">'));
			htmlcode = htmlcode.substring(21,htmlcode.search("</p>"));
			// Strip html tags
			htmlcode = htmlcode.replace(/<(?:.|\n)*?>/gm, ''); 
			if (htmlcode == "") {
				currLyrics = 'Instrumental';
			}
			currLyrics = htmlcode;
			document.getElementById("lyrics").innerHTML = htmlcode;
        }
    }
	
    xmlhttp.open("GET", theUrl, true);
    xmlhttp.send();
}