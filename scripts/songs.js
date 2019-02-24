
let $ = require('jquery')
let fs = require('fs')
let mm = require('music-metadata')
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
    constructor(name, artist, album)
    {
        this.name = name
        this.artist = artist
        this.album = album
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
        this.songs.push(song)
        if (!(song.album in this.albums))
            this.albums.push(song.album)
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

    on_click()
    {
        alert(this.name)
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
                this.finished_proccessing_song(callback)
            })
        }
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
        let list = $('.album-list')
        list.empty()

        Object.keys(this.artist_groups).forEach((artist) =>
        {
            let collection = this.artist_groups[artist]
            let album = collection.create_dom()
            list.append(album)
        })
    }

    finished_proccessing_song(callback)
    {
        this.songs_to_proccess--
        if (this.songs_to_proccess <= 0)
            callback()
    }

    load_file(file, callback)
    {
        mm.parseFile(file, {native: true})
        .then((metadata) => 
        {
            let common = metadata.common
            let name = common.title
            let album = common.album
            let artist = common.artist
            let cover = common.picture
            
            let song = new Song(name, artist, this.find_album(album))
            this.songs.push(song)
            this.group_song(song)
            
            if (cover != null)
                this.load_cover(song, cover[0], callback)
            else
                this.finished_proccessing_song(callback)
        })
        .catch((err) => 
        {
            console.log(err.message)
            this.finished_proccessing_song(callback)
        })
    }

    load_from_folder(folder, callback)
    {
        fs.readdir(folder, (err, files) => 
        {
            if (err)
                return console.log(err)
            this.songs_to_proccess += files.length

            // Go through all the files within the folder
            files.forEach((file) =>
            {
                let path = folder + '/' + file
                fs.lstat(path, (err, stats) =>
                {
                    if (err)
                        return console.log(err)

                    // If the file is a folder, then go through that, 
                    // otherwise proccess the file
                    if (stats.isDirectory())
                    {
                        this.songs_to_proccess--
                        this.load_from_folder(path, callback)
                        return
                    }
                    this.load_file(path, callback)
                })
            })
        })
    }

}

$(document).ready(() =>
{
    let lib = new SongLibrary()
    lib.load_from_folder('/run/media/benjilks/Files/Music', () =>
    {
        lib.update_album_list()
    })
})
