
$ = require('jquery')

$(document).ready(() => 
{
    load_all_modules('modules', 'manager.js', () => 
    {
        $('.tab-content').hide()
        $('.tabs #selected').ready(() => 
        {
            let id = $('.tabs #selected').html()
            $('.content [id="' + id + '"]').show()
        })
        
        $('.tabs').children().first().attr('id', 'selected')
        $('.tabs button').click((event) => 
        {
            $('.tabs button').attr('id', '')
            event.target.id = 'selected'
    
            let id = event.target.innerHTML
            $('.tab-content').hide()
            $('.content [id="' + id + '"]').show()
        })
    })
})
