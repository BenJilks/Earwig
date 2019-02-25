
$ = require('jquery')
let default_cover = 'pretty bad.png'

class Album
{
    constructor(name)
    {
        this.name = name
        this.cover = null
    }
}

class Song
{
    constructor(name, artist, album, player)
    {
        this.name = name
        this.artist = artist
        this.album = album
        this.player = player
    }
}

class SongCollection
{
    constructor(name, type)
    {
        this.name = name
        this.type = type
        this.songs = []
        this.albums = []
    }

    add_song(song)
    {
        if (!this.songs.includes(song))
        {
            this.songs.push(song)

            if (!this.albums.includes(song.album))
                this.albums.push(song.album)
            return true
        }
        return false
    }

    cover_image()
    {
        if (this.albums.length == 0)
            return default_cover

        let album = this.albums[0]
        if (album.cover == null)
            return default_cover
        
        return album.cover
    }

    create_dom()
    {
        let album = document.createElement('div')
        let cover = document.createElement('img')
        let name = document.createElement('h3')

        album.className = 'album'
        cover.src = this.cover_image()
        name.innerHTML = this.name
        album.appendChild(cover)
        album.appendChild(name)
        album.onclick = () => { this.on_click() }
        return album
    }

    create_album_view(album)
    {
        let view = document.createElement('div')
        let cover = document.createElement('img')
        let content = document.createElement('div')
        view.className = 'album-view'
        cover.src = album.cover == null ? default_cover : album.cover
        content.id = 'album-content'

        this.songs.forEach((song) =>
        {
            if (song.album === album)
            {
                let song_dom = document.createElement('text')
                song_dom.innerHTML = song.name
                song_dom.onclick = () => { add_current_playlist(song) }
                content.appendChild(song_dom)
            }
        })

        view.appendChild(cover)
        view.appendChild(content)
        return view
    }

    select()
    {
        select_playlist(this)
    }

    on_click()
    {
        let view = $('.collection-view')
        view.empty()

        this.albums.forEach((album) => 
        {
            console.log(album.name)
            let album_view = this.create_album_view(album)
            view.append(album_view)
        })

        view.show()
        $('.play').click(() => { this.select() })
        $('.collection-only').show()
    }
}

class SongLibrary
{
    constructor()
    {
        this.albums = {}
        this.songs = []
        this.cover_cache = {}

        this.artist_groups = {}
        this.playlists = []
        this.songs_to_proccess = 0
    }

    find_album(album)
    {
        if (!(album in this.albums))
            this.albums[album] = new Album(album, null)
        return this.albums[album]
    }

    find_cover_path(name, data, callback)
    {
        if (name in this.cover_cache)
            return this.cover_cache[name]
        
        let file_extention = ''
        switch (data.format)
        {
            case 'image/jpeg': file_extention = '.jpg'; break
            case 'image/png': file_extention = '.png'; break
        }

        let path = 'covers/' + name + file_extention
        fs.mkdir('covers', (err) =>
        {
            fs.writeFile(path, data.data, (err) =>
            {
                if (err)
                    return console.log(err)
                
                this.cover_cache[name] = path
                callback(path)
            })
        })
    }

    load_cover(song, data, callback)
    {
        let album = song.album
        if (album.cover == null)
        {
            this.find_cover_path(album.name, data, (path) =>
            {
                album.cover = path
                callback()
            })
        }
    }

    add_song(song)
    {
        this.songs.push(song)
        this.group_song(song)
    }

    add_playlist(playlist)
    {
        this.playlists.push(playlist)
    }

    group_song(song)
    {
        let artist = song.artist
        if (!(artist in this.artist_groups))
            this.artist_groups[artist] = new SongCollection(artist, 'artist')
        this.artist_groups[artist].add_song(song)
    }

    update_album_list()
    {
        let list = $('.collection-list #items')
        list.empty()

        Object.keys(this.artist_groups).forEach((artist) =>
        {
            let collection = this.artist_groups[artist]
            let album = collection.create_dom()
            list.append(album)
        })

        this.playlists.forEach((playlist) => {
            list.append(playlist.create_dom())
        });
    }

}

$(document).ready(() =>
{
    $('.back').click(() =>
    {
        $('.collection-view').hide()
        $('.collection-only').hide()
    })
    $('.collection-only').hide()

    let lib = new SongLibrary()
    let file_loader = new FileLoader()
    file_loader.load_from_folder(lib, '/run/media/benjilks/Files/Music', () =>
    {
        lib.update_album_list()
        select_playlist(lib.artist_groups['Lil Peep'])
    })

    $('#new-playlist').click(() =>
    {
        let playlist = new SongCollection('Unnamed Playlist', 'playlist')
        lib.add_playlist(playlist)
        lib.update_album_list()
    })
})
