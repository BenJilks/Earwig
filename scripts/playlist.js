
$ = require('jquery')
let current_playlist = null

function create_playlist_song_dom(song)
{
    let item = document.createElement('li')
    let artist = document.createElement('text')
    artist.id = 'artist'

    item.onclick = () => { play_song(song) }
    item.innerHTML = song.name
    artist.innerHTML = song.artist
    //item.appendChild(artist)
    return item
}

function select_playlist(collection)
{
    let playlist = $('.playlist')
    playlist.empty()

    collection.songs.forEach((song) => 
    {
        let item = create_playlist_song_dom(song)
        playlist.append(item)
    });

    $('#playlist-title').html(collection.name)
    current_playlist = collection
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
