let fs = require('fs')
let mm = require('music-metadata')

class FileLoader
{

    constructor()
    {
        this.songs_to_proccess = 0
    }

    finished_proccessing_song(callback)
    {
        this.songs_to_proccess--
        if (this.songs_to_proccess <= 0)
            callback()
    }

    load_file(lib, file, callback)
    {
        this.songs_to_proccess++
        
        mm.parseFile(file, {native: true})
        .then((metadata) => 
        {
            // Fetch the song data
            let common = metadata.common
            let name = common.title
            let album = common.album
            let artist = common.artist
            let cover = common.picture
            
            // Create and add the new song object
            let song = new Song(name, artist, lib.find_album(album), 
                new FilePlayer(file))
            lib.add_song(song)
            
            // Load the song cover if one exists
            if (cover != null)
            {
                lib.load_cover(song, cover[0], () => 
                { 
                    this.finished_proccessing_song(callback) 
                })
                return
            }
            this.finished_proccessing_song(callback)
        })
        .catch((err) => 
        {
            console.log(err.message)
            this.finished_proccessing_song(callback)
        })
    }

    load_from_folder(lib, folder, callback)
    {
        fs.readdir(folder, (err, files) => 
        {
            if (err)
                return console.log(err)

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
                        this.load_from_folder(lib, path, callback)
                        return
                    }
                    this.load_file(lib, path, callback)
                })
            })
        })
    }

}

class FilePlayer
{

    constructor(file)
    {
        this.file = file
        this.audio = null
    }

    play()
    {
        if (this.audio == null)
            this.audio = new Audio(this.file)
        
        this.audio.play()
    }

    pause()
    {
        this.audio.pause()
    }

    stop()
    {
        this.audio.pause()
        this.audio = null
    }

    skip_to(location)
    {
        this.audio.currentTime = (location / 100) * 
            this.audio.duration
    }

    current_location()
    {
        return (this.audio.currentTime / 
            this.audio.duration) * 100
    }

}
