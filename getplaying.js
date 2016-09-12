// Global Vars
var hide = true;
var currLyrics = "";
var currHeight = 0;
var currWidth = 0;
var placeholderImg = "http://larics.rasip.fer.hr/wp-content/uploads/2016/04/default-placeholder.png"

// Init

var defaultArtSrc = "https://assets.genius.com/images/default_cover_image.png?1473449143"

var getlyrics = function() {
	if (!hide){
		window.resizeTo(350,420);
	}
	hide = true;
	var song = "";
	var artist = "";
	var winWidth = $(window).width();
	console.log(winWidth)
	var winHeight = $(window).height();
	//window.resizeTo(winWidth,winHeight);
	
	currLyrics = "";
	document.getElementById("albumart").src = placeholderImg;
	document.getElementById("showhide").innerHTML = "Hide Lyrics";
	document.getElementById("lyrics").innerHTML = ""; // Clear window
	
	// Show loading animation
	document.getElementById("loader").style.display = "block";
	
	
	var SpotifyWebHelper = require('@jonny/spotify-web-helper');
	var helper = SpotifyWebHelper();
	
	helper.player.on('ready', function(){
		// Find currently playing song		
		song = helper.status.track.track_resource.name;
		artist = helper.status.track.artist_resource.name;
		
		// Write title and header (song + artist)
		document.getElementById("title").innerHTML =  artist + ' - ' + song;
		document.getElementById("class1").innerHTML ='<b>' + artist + '</b><br><i>' + song +'</i>';
						
		var searchterm = artist + " " + song;
		
		// Get lyrics
		$.getJSON("http://api.genius.com/search?q=" + searchterm + "&access_token=Et0edLuuw1UqlTV1QlvgUg0WNPqmAgNnJ5UbbB6giV74xIZyJic2JxvNpzeXYGCa&callback=json", function(json){
			// Start loading animation
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
			document.getElementById("loader").style.display = "none";
			document.getElementById("lyrics").innerHTML = currLyrics;
			
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
	
	// Function to execute upon successful http request
    xmlhttp.onreadystatechange=function()
    {
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
			
			// Disable loading animation
			document.getElementById("loader").style.display = "none";
			document.getElementById("lyrics").innerHTML = currLyrics;	
        }
    }
	
	// Send http request
    xmlhttp.open("GET", theUrl, true);
    xmlhttp.send();
}

// Find all indices of substring in string
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