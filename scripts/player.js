
$ = require('jquery')
let dragging = false

function set_progress(progress)
{
    progress = Math.max(Math.min(progress, 100), 0);
    $('.nav-bar #background #progress').css('width', progress + '%')
    $('.nav-bar .grabber').css('left', progress + '%')
}

function set_pre_progress(progress)
{
    $('.nav-bar #background #pre-progress').css('width', progress + '%')
}

$(document).ready(() =>
{
    $('.nav-bar').mousemove((event) =>
    {
        let selected = event.clientX / $('.nav-bar').width();
        if (!dragging)
            set_pre_progress(selected * 100);
        else
            set_pre_progress(0);
    })
    
    $('.nav-bar').mousedown(() =>
    {
        let selected = event.clientX / $('.nav-bar').width();
        set_progress(selected * 100);
        dragging = true;
    })

    $('.nav-bar').mouseleave((event) =>
    {
        set_pre_progress(0);
    })

    $(document).mousemove((event) =>
    {
        if (dragging)
        {
            let selected = event.clientX / $('.nav-bar').width();
            set_progress(selected * 100);
        }
    })

    $(document).mouseup(() =>
    {
        dragging = false;
    })
})
