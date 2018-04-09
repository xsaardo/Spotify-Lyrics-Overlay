// Global Vars
var hide = true;
var currLyrics = "";
var currHeight = 0;
var currWidth = 0;

var placeholderImg = "placeholder_album_art.jpeg";

var SpotifyWebApi = require('spotify-web-api-node');
var SpotifyWebHelper = require('spotify-web-helper');
const Lyricist = require('lyricist');

var song = "";
var artist = "";
var album = "";
var maxListCount = 5;
var helper = SpotifyWebHelper();
var gui = require('nw.gui');
var mainWin = gui.Window.get();

const access_token = "JK5Op4NX-2vNtN821RMDlbK9p38JgEeMxOLsb_lyy2g8u9LTB9u1tpmwzJGoSPDs";
const lyricist = new Lyricist(access_token);

const clientId = "3448610306b048e5942108a3db1d2536";
const clientSecret = "82a8ade95d7149c59c7a9a99e1dc6c62";

// Create the api object with the credentials
var spotifyApi = new SpotifyWebApi({
  clientId : clientId,
  clientSecret : clientSecret
});

var initialLyrics = function() {
	console.log("Initial execution")
	
	// Display loading animation
	document.getElementById("loader").style.display = "block";
	
	// Initial load lyrics/album art
	helper.player.on('ready',function() {
		loadnewlyrics(helper.status.track);
	});
	
	// Upon track change update track info and lyrics
	helper.player.on('track-change', function(track){
		console.log("Track changed");
		loadnewlyrics(track);
	});
}

var getlyrics = function() {
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
	document.getElementById("showhide").innerHTML = "Hide Lyrics";
	document.getElementById("lyrics").innerHTML = ""; 
	
	// Initial load lyrics
	try {
		console.log("hiding: " + helper.status.track);
		loadnewlyrics(helper.status.track);
	}
	catch (err) {
		alert("Error: Could not connect to Spotify")
	}
};

const getSongLyrics = async function (searchterm) {
	var lyrics = await lyricist.search(searchterm)
		.then(result => lyricist.song(result[0].id, {fetchLyrics: true})
		.then(result => result.lyrics)); 
	return lyrics;
}

var loadnewlyrics = function(track) {
	// Show loading animation
	if (hide) {
		document.getElementById("loader").style.display = "block";
	}
	
	// Reset window to default
	document.getElementById("lyrics").innerHTML = ""; // Clear window
	
	// Find currently playing song info
	var trackUri = track.track_resource.uri;
	var albumUri = track.album_resource.uri;

	console.log(trackUri);

	trackUri = trackUri.split(":");
	trackUri = trackUri[2];

	albumUri = albumUri.split(":");
	albumUri = albumUri[2];
	 
	// Retrieve an access token.
	spotifyApi.clientCredentialsGrant()
	  .then(function(data) {
	    console.log('The access token expires in ' + data.body['expires_in']);
	    console.log('The access token is ' + data.body['access_token']);
	 
	    // Save the access token so that it's used in future calls
	    spotifyApi.setAccessToken(data.body['access_token']);

    	// fetch album art
    	console.log("Album uri = " + albumUri);
		spotifyApi.getAlbum(albumUri)
		.then(result => document.getElementById("albumart").src = result.body.images[0].url);

		// fetch track info
		console.log("Track uri = " + trackUri);
		spotifyApi.getTrack(trackUri).then(result => {
			
			var artists = result.body.artists[0].name;
			var song = result.body.name;
			var id = result.id;

			for (i = 1; i < result.body.artists.length; i++) {
				artists = artists + ", " + result.body.artists[i].name;
			}
			console.log(artists);

			document.getElementById("title").innerHTML =  artists + ' - ' + song;
			document.getElementById("class1").innerHTML ='<b>' + artists + '</b><br><i>' + song +'</i>';

			var searchTerm = artists + " " + song;

			getSongLyrics(searchTerm).then(result => {
				document.getElementById("lyrics").innerHTML = result;
				document.getElementById("loader").style.display = "none";
			})

		});

	
	  }, function(err) {
	        console.log('Something went wrong when retrieving an access token', err);
  	 });

	/*
	$.getJSON("http://api.genius.com/search?q=" + searchterm + "&access_token=Et0edLuuw1UqlTV1QlvgUg0WNPqmAgNnJ5UbbB6giV74xIZyJic2JxvNpzeXYGCa&callback=json", function(json){
		try {
			// Get url of lyrics page
			var fulltitle = song + " by " + artist;
			fulltitle = fulltitle.replace(/[&]/g,"");
			var url = json.response.hits[0].result.url;
			console.log("Found URL for: " + json.response.hits[0].result.full_title)
			
			//Populate dropdown list
			$("#otherLyrics").empty();
			for (i = 1; i <= maxListCount; i++) {
				if (json.response.hits[i]) {
					otherURL = json.response.hits[i].result.url;
					otherURL = otherURL.slice(0,18) + "amp/" + otherURL.slice(18);
					$("#otherLyrics").append('<a href="javascript:httpGet(&#39;' + otherURL + '&#39;)">    ' + json.response.hits[i].result.full_title + '</a><div class="dropdown-divider"></div>');
				}
			}
			
			// TEST levenshtein distance
			/*console.log(fulltitle);
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
	*/
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