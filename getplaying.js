
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
						
		var searchterm = artist + " " + song;
		
		// Get lyrics
		$.getJSON("http://api.genius.com/search?q=" + searchterm + "&access_token=Et0edLuuw1UqlTV1QlvgUg0WNPqmAgNnJ5UbbB6giV74xIZyJic2JxvNpzeXYGCa&callback=json", function(json){
			document.getElementById("albumart").src = json.response.hits[0].result.header_image_url;
			var url = json.response.hits[0].result.url;
			url = url.slice(0,18) + "amp/" + url.slice(18);
			//alert(url);
			httpGet(url);
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
			console.log(htmlcode);
			
			// Strip html tags
			htmlcode = htmlcode.replace(/<(?:.|\n)*?>/gm, ''); 
			if (htmlcode == "") {
				currLyrics = 'Instrumental';
			}
			
			// Add extra <br>
			var indices = findAllSubstringInd(htmlcode,"[");
			
			for (var index in indices) {
				htmlcode = htmlcode.slice(0,indices[index]+index*4) + '<br>' + htmlcode.slice(indices[index]+index*4);
			}
			
			currLyrics = htmlcode;
			
			document.getElementById("lyrics").innerHTML = htmlcode;
        }
    }
	
    xmlhttp.open("GET", theUrl, true);
    xmlhttp.send();
}

function findAllSubstringInd(str, substring) {
	var indices = new Array();
	var j = 0;
	var i = 1;
	while (i > 0) {
		i = str.indexOf(substring,i);
		indices[j] = i;
		i = i+1;
		//console.log(i);
		j++;
	}
	indices.pop();
	return indices;
}