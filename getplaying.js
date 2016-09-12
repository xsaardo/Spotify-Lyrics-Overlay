// Global Vars
var hide = true;
var currLyrics = "";
var currHeight = 0;
var currWidth = 0;
var placeholderImg = "http://larics.rasip.fer.hr/wp-content/uploads/2016/04/default-placeholder.png";
var SpotifyWebHelper = require('@jonny/spotify-web-helper');
var song = "";
var artist = "";
var album = "";
//var defaultArtSrc = "https://assets.genius.com/images/default_cover_image.png?1473449143"

// Init

var getlyrics = function() {
	// If getlyrics called from hidden state
	if (!hide){
		window.resizeTo(350,420);
	}
	hide = true;
	
	// Remember current window dimensions
	var winWidth = $(window).width();
	var winHeight = $(window).height();
	
	// Reset window to default
	document.getElementById("albumart").src = placeholderImg;
	document.getElementById("showhide").innerHTML = "Hide Lyrics";
	document.getElementById("lyrics").innerHTML = ""; 
	
	var helper = SpotifyWebHelper();
	// Upon track change execute...
	helper.player.on('track-change', function(track){
		// Show loading animation
		document.getElementById("loader").style.display = "block";
		
		// Reset window to default
		document.getElementById("albumart").src = placeholderImg;
		document.getElementById("lyrics").innerHTML = ""; // Clear window
		
		// Find currently playing song		
		song = track.track_resource.name;
		artist = track.artist_resource.name;
		album = track.album_resource.name;
		
		// Write title and header (song + artist)
		document.getElementById("title").innerHTML =  artist + ' - ' + song;
		document.getElementById("class1").innerHTML ='<b>' + artist + '</b><br><i>' + song +'</i>';
						
		var searchterm = artist + " " + song;
		
		// Get lyrics
		$.getJSON("http://api.genius.com/search?q=" + searchterm + "&access_token=Et0edLuuw1UqlTV1QlvgUg0WNPqmAgNnJ5UbbB6giV74xIZyJic2JxvNpzeXYGCa&callback=json", function(json){
			try {
				// Set album art
				document.getElementById("albumart").src = json.response.hits[0].result.header_image_url;
				
				// Get url of lyrics page
				var url = json.response.hits[0].result.url;
				url = url.slice(0,18) + "amp/" + url.slice(18);
				httpGet(url);
			}
			catch(err) {
				currLyrics = 'Lyrics not found on Genius';
			}
		})
		.done(function() {
			console.log('Genius search successful')
		})
		.fail(function() {
			alert('Failed Genius search request')
		});
	});
};

var hidelyrics = function() {
	if (hide) {
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
    xmlhttp.open("GET", theUrl, true);
    xmlhttp.send();
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