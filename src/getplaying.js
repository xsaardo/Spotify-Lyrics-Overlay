const Genius = require('genius-lyrics');
const applescript = require('applescript');
const client = new Genius.Client();

const DEFAULT_WIN_HEIGHT = 420;
const DEFAULT_WIN_WIDTH = 350;
const HIDDEN_LYRICS_HEIGHT = 120;

const LYRICS_APP = (function () {
  const state = {
    isHidden: false,
    currLyrics: '',
    winHeight: DEFAULT_WIN_HEIGHT,
    winWidth: DEFAULT_WIN_WIDTH,
  };

  function init() {
    console.log('Initial execution');
    loadNewLyrics();
  };

  function loadNewLyrics() {
    console.log('loading new lyrics');
    if (state.isHidden) {
      window.resizeTo(state.winWidth, state.winHeight);
      state.isHidden = false;
    }

    document.querySelector('.loader').style.display = 'block';
    
    // Reset window to default
    document.querySelector('.showhide').textContent = 'Hide Lyrics';
    document.querySelector('.lyrics').textContent = ''; // Clear window
    
    applescript.execFile('src/getplaying.applescript', (err, rtn) => {
      if (err) {
        console.log(err);
      }
      const track = rtn;
      const artist = track[0];
      const song = track[1];
      const albumArtUrl = track[2];
      console.log(track);
      searchForSongLyrics(artist + ' ' + song).then(lyrics => {
        document.querySelector('.lyrics').textContent = lyrics;
        document.querySelector('.albumart-img').src = albumArtUrl;
        //document.querySelector(".artist").textContent = artist;
        //document.querySelector(".song").textContent = song;
        document.querySelector('.info').innerHTML ='<b>' + song + '</b><br>' + artist;
        document.querySelector('.loader').style.display = 'none';
        state.currLyrics = lyrics;
      })
    });
  };

  const searchForSongLyrics = async function (searchTerm) {
    console.log('Searching for ' + searchTerm);
    const searches = await client.songs.search(searchTerm, { limit: 1 });
    const song = searches[0];
    const lyrics = await song.lyrics();
    return lyrics;
  };
  
  function hideLyrics() {
    if (!state.isHidden) {
      // Hiding lyrics
      document.querySelector('.loader').style.display = 'none';
      state.winWidth = $(window).width();
      state.winHeight = $(window).height();
      document.querySelector('.lyrics').textContent = '';
      window.resizeTo(DEFAULT_WIN_WIDTH, HIDDEN_LYRICS_HEIGHT);
      state.isHidden = true;
      document.querySelector('.showhide').textContent = 'Show Lyrics';
    }
    else {
      // Showing lyrics
      if (state.currLyrics == '') {
        loadNewLyrics();
      }
      else {
        document.querySelector('.lyrics').textContent = state.currLyrics;
      }
      window.resizeTo(state.winWidth, state.winHeight);
      state.isHidden = false;
      document.querySelector('.showhide').textContent = 'Hide Lyrics';
    }
  };

  return {
    init: init,
    hideLyrics: hideLyrics,
    getLyrics: loadNewLyrics,
  };
})();

LYRICS_APP.init();







