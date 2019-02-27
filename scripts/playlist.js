
$ = require('jquery')
let current_playlist = null
let current_playlist_song = null

function create_playlist_song_dom(song)
{
    let item = document.createElement('li')
    let artist = document.createElement('text')
    artist.id = 'artist'

    item.id = song.name
    item.onclick = () => 
    { 
        play_song(song) 
        playlist_select_song(song)
    }
    item.innerHTML = song.name
    artist.innerHTML = song.artist
    return item
}

function select_playlist(collection)
{
    if (collection != null)
    {
        let playlist = $('.playlist')
        playlist.empty()
        current_playlist_song = null

        collection.songs.forEach((song) => 
        {
            let item = create_playlist_song_dom(song)
            playlist.append(item)
        });

        $('#playlist-title').html(collection.name)
        current_playlist = collection
    }
}

function add_current_playlist(song)
{
    if (current_playlist != null)
    {
        if (current_playlist.add_song(song))
        {
            let item = create_playlist_song_dom(song)
            $('.playlist').append(item)
        }
    }
}

function playlist_select_song(song)
{
    $('.playlist *').removeClass('selected')
    $('.playlist [id="' + song.name + '"]')
        .addClass('selected')
    current_playlist_song = song
}

function next_song_in_playlist()
{
    if (current_playlist_song != null && current_playlist != null)
    {
        let index = current_playlist.songs.findIndex((e) => 
            e == current_playlist_song) + 1
        
        if (index >= current_playlist.songs.length)
            index = 0
        let song = current_playlist.songs[index]
        play_song(song)
        playlist_select_song(song)
    }
}

function last_song_in_playlist()
{
    if (current_playlist_song != null && current_playlist != null)
    {
        let index = current_playlist.songs.findIndex((e) => 
            e == current_playlist_song) - 1

        if (index < 0)
            index = current_playlist.songs.length - 1
        let song = current_playlist.songs[index]
        play_song(song)
        playlist_select_song(song)
    }
}
