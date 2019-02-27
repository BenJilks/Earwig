
$ = require('jquery')
const { ipcRenderer } = require('electron')
let default_cover = 'pretty bad.png'

class Album
{
    constructor(name)
    {
        this.name = name
        this.cover = null
    }

    get_cover()
    {
        if (this.cover == null)
            return default_cover
        return this.cover
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
    constructor(name, type, update_callback)
    {
        this.name = name
        this.type = type
        this.songs = []
        this.albums = []
        this.update_callback = update_callback
        this.is_displayed = false
    }

    add_song(song)
    {
        this.songs.push(song)

        if (!this.albums.includes(song.album))
            this.albums.push(song.album)

        return true
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
        cover.src = album.get_cover()
        content.id = 'album-content'

        this.songs.forEach((song) =>
        {
            if (song.album === album)
            {
                let song_dom = document.createElement('text')
                song_dom.innerHTML = song.name
                song_dom.onclick = () => 
                { 
                    add_current_playlist(song)
                    this.update_callback(song) 
                }
                content.appendChild(song_dom)
            }
        })

        view.appendChild(cover)
        view.appendChild(content)
        return view
    }
    
    on_click()
    {
        let view = $('.collection-view')
        view.empty()

        this.albums.forEach((album) => 
        {
            let album_view = this.create_album_view(album)
            view.append(album_view)
        })

        view.show()
        $('.play').click(() => { select_playlist(this) })
        $('.collection-only').show()
    }
}

class SongLibrary
{
    constructor(name, update_callback)
    {
        this.name = name
        this.albums = {}
        this.songs = []
        this.cover_cache = {}
        this.update_callback = update_callback

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

    has_song(song)
    {
        let has_song = false
        this.songs.forEach((other) => 
        {
            if (other.name === song.name && 
                other.album.name === song.album.name)
            {
                has_song = true
                return
            }
        })
        return has_song
    }

    add_song(song)
    {
        if (!this.has_song(song))
        {
            this.songs.push(song)
            this.group_song(song)
            return true
        }
        return false
    }

    add_playlist(playlist)
    {
        if (!this.playlists.includes(playlist))
            this.playlists.push(playlist)
    }

    group_song(song)
    {
        let artist = song.artist
        if (!(artist in this.artist_groups))
            this.artist_groups[artist] = new SongCollection(artist, 
                'artist', this.update_callback)
        this.artist_groups[artist].add_song(song)
    }

    update_album_list()
    {
        let list = $('.collection-list #items')

        Object.keys(this.artist_groups).forEach((artist) =>
        {
            let collection = this.artist_groups[artist]
            if (!collection.is_displayed)
            {
                let album = collection.create_dom()
                list.append(album)
                collection.is_displayed = true
            }
        })

        this.playlists.forEach((playlist) => 
        {
            if (!playlist.is_displayed)
            {
                list.append(playlist.create_dom())
                playlist.is_displayed = true
            }
        });
    }

    get_save_data()
    {
        let data =
        {
            albums: this.albums,
            songs: this.songs,
            playlists: this.playlists
        }
        return data
    }

    load_song_data(song_info)
    {
        let album_info = song_info.album
        let song = new Song(song_info.name, song_info.artist, 
            this.find_album(album_info.name))
        
        let player_info = song_info.player
        switch(player_info.type)
        {
            case 'file': song.player = new FilePlayer(player_info.file); break
            default: console.log('Error: no player')
        }
        return song
    }

    load_save_data(data)
    {
        Object.keys(data.albums).forEach((album_name) =>
        {
            let album_info = data.albums[album_name]
            let album = new Album(album_name)
            album.cover = album_info.cover
            this.albums[album_name] = album
        })
        
        data.songs.forEach((song_info) => 
        {
            let song = this.load_song_data(song_info)
            this.add_song(song)
        })

        data.playlists.forEach((playlist_info) => 
        {
            let playlist = new SongCollection(playlist_info.name, 
                playlist_info.type, this.update_callback)
            
            playlist_info.songs.forEach((song_info) => 
            {
                let song_found = false
                this.songs.forEach((song) => 
                {
                    if (song.name == song_info.name && 
                        song.album.name == song_info.album.name)
                    {
                        playlist.add_song(song)
                        song_found = true
                    }
                })

                if (!song_found)
                    this.add_song(this.load_song_data(song_info))
            })
            this.add_playlist(playlist)
        })
    }

}

function manage_libs()
{
    ipcRenderer.send('manage_libs')
}

$(document).ready(() =>
{
    $('.back').click(() =>
    {
        $('.collection-view').hide()
        $('.collection-only').hide()
    })
    $('.collection-only').hide()

    let lib = new SongLibrary("default", () =>
    {
        file_loader.save_lib(lib)
    })

    let file_loader = new FileLoader()
    file_loader.load_lib(lib, () => 
    {
        lib.update_album_list()
        select_playlist(lib.artist_groups['Lil Peep'])
    })

    file_loader.load_from_folder(lib, '/run/media/benjilks/Files/Music', () =>
    {
        lib.update_album_list()
        file_loader.save_lib(lib)
    })

    $('#new-playlist').click(() => 
    {
        let playlist = new SongCollection('Unnamed Playlist', 
            'playlist', lib.update_callback)
        
        lib.add_playlist(playlist)
        lib.update_album_list()
        file_loader.save_lib(lib)
    })
})
