tell application "Spotify"
    set currentArtist to artist of current track
    set currentTrack to name of current track
    set currentAlbumArtUrl to artwork url of current track
    return {currentArtist, currentTrack, currentAlbumArtUrl}
end tell