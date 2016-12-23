// Global Vars
var hide = true;
var currLyrics = "";
var currHeight = 0;
var currWidth = 0;
var placeholderImg = "http://larics.rasip.fer.hr/wp-content/uploads/2016/04/default-placeholder.png";

var SpotifyWebHelper = require('@jonny/spotify-web-helper');
var lsdist = require('fast-levenshtein')
var song = "";
var artist = "";
var album = "";
var helper = SpotifyWebHelper();
var gui = require('nw.gui');
var mainWin = gui.Window.get();

var initialLyrics = function() {
	// Display loading animation
	document.getElementById("loader").style.display = "block";
	
	// Initial load lyrics/album art
	helper.player.on('ready',function() {
		console.log("Helper on");
		getAlbumArt(helper.status.track.album_resource.uri);
		loadnewlyrics(helper.status.track);
	});
	
	// Upon track change execute...
	helper.player.on('track-change', function(track){
		console.log("Track changed");
		getAlbumArt(track.album_resource.uri);
		loadnewlyrics(track);
	});
}

var getlyrics = function(helper) {
	console.log("Manual lyric request")
	// If getlyrics called from hidden state
	if (!hide){
		window.resizeTo(350,420);
	}
	hide = true;
	
	// Show loading animation
	document.getElementById("loader").style.display = "block";
	
	// Remember current window dimensions
	var winWidth = $(window).width();
	var winHeight = $(window).height();
	
	// Reset window to default
	document.getElementById("albumart").src = placeholderImg;
	document.getElementById("showhide").innerHTML = "Hide Lyrics";
	document.getElementById("lyrics").innerHTML = ""; 
	
	// Initial load lyrics
	try {
		getAlbumArt(helper.status.track.album_resource.uri);
		loadnewlyrics(helper.status.track);
	}
	catch (err) {
		alert("Error: Could not connect to Spotify")
	}
};

var loadnewlyrics = function(track) {
	// Show loading animation
	if (hide) {
		document.getElementById("loader").style.display = "block";
	}
	
	// Reset window to default
	document.getElementById("albumart").src = placeholderImg;
	document.getElementById("lyrics").innerHTML = ""; // Clear window
	
	// Find currently playing song		
	song = track.track_resource.name;
	artist = track.artist_resource.name;
	album = track.album_resource.name;
	console.log(artist + " " + song);
	
	// Write title and header (song + artist)
	document.getElementById("title").innerHTML =  artist + ' - ' + song;
	document.getElementById("class1").innerHTML ='<b>' + artist + '</b><br><i>' + song +'</i>';
					
	var searchterm = artist + " " + song;
	searchterm = searchterm.replace(/[&]/," ");
	console.log(searchterm);
	
	// Get lyrics
	console.log("Sending JSON request")
	$.getJSON("http://api.genius.com/search?q=" + searchterm + "&access_token=Et0edLuuw1UqlTV1QlvgUg0WNPqmAgNnJ5UbbB6giV74xIZyJic2JxvNpzeXYGCa&callback=json", function(json){
		try {
			// Get url of lyrics page
			var fulltitle = song + " by " + artist;
			fulltitle = fulltitle.replace(/[&]/g,"");
			var url = json.response.hits[0].result.url;
			
			// TEST levenshtein distance
			console.log(fulltitle);
			console.log(json.response.hits[0].result.full_title);
			console.log("Score: " + lsdist.get(fulltitle,json.response.hits[0].result.full_title));
			
			var similarityScore = lsdist.get(fulltitle,json.response.hits[0].result.full_title);
			if (similarityScore > 10) {
				var secondScore = lsdist.get(fulltitle,json.response.hits[1].result.full_title);
				console.log(secondScore);
				console.log(json.response.hits[1].result.full_title);
				if (secondScore > 10) {
					return;
					console.log("lyrics not found");
				}
				else {
					url = json.response.hits[1].result.url;
				}
			}
			
			url = url.slice(0,18) + "amp/" + url.slice(18);
			
			
			// Get HTML code from url
			httpGet(url);
		}
		catch(err) {
			console.log(err)
			console.log("Lyrics not found")
			currLyrics = 'Lyrics not found on Genius';
			document.getElementById("lyrics").innerHTML = currLyrics;
			document.getElementById("loader").style.display = "none";
		}
	})
	.done(function() {
		console.log('Genius search successful')
	})
	.fail(function() {
		alert('Failed Genius search request')
	});
}

var hidelyrics = function() {
	if (hide) {
		document.getElementById("loader").style.display = "none";
		winWidth = $(window).width()
		winHeight = $(window).height()
		document.getElementById("lyrics").innerHTML = "";
		window.resizeTo(350,120);
		hide = false;
		document.getElementById("showhide").innerHTML = "Show Lyrics";
	}
	else {
		if (currLyrics == "") {
			getlyrics();
		}
		else {
			document.getElementById("lyrics").innerHTML = currLyrics;
		}
		window.resizeTo(winWidth,winHeight);
		hide = true;
		document.getElementById("showhide").innerHTML = "Hide Lyrics";
	}
};

function httpGet(theUrl)
{  
	var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var xmlhttp = new XMLHttpRequest();
    
	var htmlcode;
	
	// Function to execute upon state change
    xmlhttp.onreadystatechange=function()
    {
		// Function to execute upon successful http request
        if (xmlhttp.readyState==4 && xmlhttp.status==200)
        {
			console.log("HTTP request successful");
			// Get html for lyrics page
			htmlcode = xmlhttp.responseText;
			
			// Isolate lyrics div of html
			htmlcode = htmlcode.substring(htmlcode.search('<div class="lyrics">'));
			htmlcode = htmlcode.substring(21,htmlcode.search("</p>"));
			
			// Strip html tags
			htmlcode = htmlcode.replace(/<(?:.|\n)*?>/gm, ''); 
			
			// Add extra <br> between [segments] for clarity
			var indices = findAllSubstringInd(htmlcode,"[");
			for (var index in indices) {
				htmlcode = htmlcode.slice(0,indices[index]+index*4) + '<br>' + htmlcode.slice(indices[index]+index*4);
			}
			
			currLyrics = htmlcode;
			
			// Disable loading animation and display lyrics
			document.getElementById("loader").style.display = "none";
			document.getElementById("lyrics").innerHTML = currLyrics;	
        }
    }
	
	// Send http request
	console.log("HTTP request sent")
    xmlhttp.open("GET", theUrl, true);
    xmlhttp.send();
}

// TODO: Settings windows
var settings = function(){
	var settingsWin = window.open('settings.html');
}

// Helper function: Find all indices of substring in string
function findAllSubstringInd(str, substring) {
	var indices = new Array();
	var j = 0;
	var i = 1;
	while (i > 0) {
		i = str.indexOf(substring,i);
		indices[j] = i;
		i = i+1;
		j++;
	}
	indices.pop();
	return indices;
}

// Alternate source of lyrics
function altSearch(artist, song) {
	
}

// Get album art from spotify
function getAlbumArt(uri) {
	uri = uri.split(":");
	uri = uri[2];
	$.getJSON("https://api.spotify.com/v1/albums/" + uri, function(response){
		document.getElementById("albumart").src = response.images[0].url
	})
}