
$ = require('jquery')

function add_manager_tab(name, content)
{
    let tab = document.createElement('button')
    let tab_content = document.createElement('div')
    tab.innerHTML = name
    tab_content.id = name
    tab_content.className = 'tab-content'
    fs.readFile(content, (err, data) => { tab_content.innerHTML = data })
    $('.tabs').append(tab)
    $('.content').append(tab_content)
}

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
