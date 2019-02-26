
$ = require('jquery')
let dragging = false
let current_song = null
let seek_updater = null

function set_progress(progress)
{
    progress = Math.max(Math.min(progress, 100), 0)
    $('.nav-bar #background #progress').css('width', progress + '%')
    $('.nav-bar #grabber').css('left', progress + '%')
}

function set_pre_progress(progress)
{
    $('.nav-bar #background #pre-progress').css('width', progress + '%')
}

function toggle_song_view()
{
    let song_list = $('.song-list')
    if (song_list.css('top') == '0px')
        song_list.css('top', '100%')
    else
        song_list.css('top', '0%')
}

function format_time(time)
{
    if (!time)
        return "00:00"
    
    let h = Math.floor(time / (60 * 60))
    let m = Math.floor(time / 60) % 60
    let s = time % 60
    let date = new Date(0, 0, 0, h, m, s)

    if (h > 0)
        return date.toLocaleTimeString()
    return date.toLocaleTimeString().substring(3)
}

function play_song(song)
{
    if (current_song != null)
    {
        console.log('test')
        current_song.player.stop()
        clearInterval(seek_updater)
    }
    
    $('.cover').attr('src', song.album.get_cover())
    $('.player-back').css('background-image', 'url("' + song.album.get_cover() + '")')
    $('.nav-buttons #play>span').attr('id', 'pause-icon')
    set_progress(0)
    current_song = song
    song.player.play()
    
    seek_updater = setInterval(() =>
    {
        let pregress = song.player.current_location()
        set_progress(pregress)
        
        let duration = song.player.duration()
        let time = pregress / 100 * duration
        $('.nav-bar #curr_time').html(format_time(time))
        $('.nav-bar #duration').html(format_time(duration))
        
        if (pregress >= 100)
            next_song_in_playlist()
    }, 100)    
}

function play_pause()
{
    if (current_song != null)
    {
        let button = $('.nav-buttons #play>span')
        if (button.attr('id') == 'play-icon')
        {
            button.attr('id', 'pause-icon')
            current_song.player.play()
        }
        else
        {
            button.attr('id', 'play-icon')
            current_song.player.pause()
        }
    }
}

function update_location(progress)
{
    if (current_song != null)
        current_song.player.skip_to(progress)
}

$(document).ready(() =>
{
    $('.nav-bar').mousemove((event) =>
    {
        let selected = event.clientX / $('.nav-bar').width()
        if (!dragging)
            set_pre_progress(selected * 100)
        else
            set_pre_progress(0)
    })
    
    $('.nav-bar').mousedown(() =>
    {
        let selected = event.clientX / $('.nav-bar').width()
        set_progress(selected * 100)
        update_location(selected * 100)
        dragging = true
    })

    $('.nav-bar').mouseleave((event) =>
    {
        set_pre_progress(0)
    })

    $(document).mousemove((event) =>
    {
        if (dragging)
        {
            let selected = event.clientX / $('.nav-bar').width()
            set_progress(selected * 100)
            update_location(selected * 100)
        }
    })

    $(document).mouseup(() =>
    {
        dragging = false
    })
})
