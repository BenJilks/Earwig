
let fs = require('fs')
let mm = require('music-metadata')

class FileLoader
{

    constructor()
    {
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
                
            // Load the song cover if one exists
            if (cover != null)
            {
                lib.load_cover(song, cover[0], () => 
                {
                    lib.add_song(song)
                    callback(song)
                })
                return
            }

            lib.add_song(song)
            callback(song)
        })
        .catch((err) => 
        {
            console.log(err.message)
        })
    }

    check_cover(file)
    {
        if (file.match(/\.(jpeg|jpg|gif|png)$/) != null)
            return true
        return false
    }

    load_from_folder(lib, folder, callback)
    {
        fs.readdir(folder, (err, files) => 
        {
            if (err)
                return console.log(err)

            // Go through all the files within the folder
            let songs = []
            let cover = null
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
                        this.load_from_folder(lib, path, (song) =>
                        {
                            songs.push(song)
                            callback(song)
                        })
                    }
                    else if (this.check_cover(path))
                    {
                        cover = path
                    }
                    else
                    {
                        this.load_file(lib, path, (song) =>
                        {
                            if (cover != null)
                                song.album.cover = cover
                            callback(song)
                        })
                    }
                })
            })
        })
    }

    save_lib(lib)
    {
        fs.writeFile(lib.name + '.json', 
            JSON.stringify(lib.get_save_data()), 
            () => {})
    }

    load_lib(lib, callback)
    {
        fs.readFile(lib.name + '.json', (err, data) =>
        {
            if (err)
                return console.log(err)

            lib.load_save_data(JSON.parse(data))
            callback()
        })
    }

}

class FilePlayer
{

    constructor(file)
    {
        this.type = 'file'
        this.file = file
        this.audio = null
    }

    play()
    {
        if (this.audio == null)
            this.audio = new Audio(this.file)
        
        this.audio.play()
    }

    duration()
    {
        if (this.audio != null)
            return this.audio.duration
        return 0
    }

    pause()
    {
        if (this.audio != null)
            this.audio.pause()
    }

    stop()
    {
        if (this.audio != null)
        {
            this.audio.pause()
            this.audio = null
        }
    }

    skip_to(location)
    {
        if (this.audio != null)
            this.audio.currentTime = (location / 100) * 
                this.audio.duration
    }

    current_location()
    {
        if (this.audio != null)
            return (this.audio.currentTime / 
                this.audio.duration) * 100
        return 0
    }

}
