
$ = require('jquery')
const { dialog } = require('electron').remote

function add_folder()
{
    dialog.showOpenDialog((file_path) =>
    {
        if (file_path)
        {
            let item = document.createElement('li')
            let location = document.createElement('text')
            let edit = document.createElement('img')
            let remove = document.createElement('text')

            location.id = 'location'
            location.innerHTML = file_path
            edit.src = 'edit.png'
            edit.onclick = edit_event
            remove.id = 'remove'
            remove.innerHTML = 'x'
            remove.onclick = remove_event

            item.appendChild(location)
            item.appendChild(edit)
            item.appendChild(remove)
            $('.file-list').append(item)
        }
    })
}

function edit_event(event)
{
    let item = event.target.parentElement
    let text = item.querySelector('#location')
    if (text)
    {
        let input = document.createElement('input')
        input.value = text.innerHTML
        input.onblur = () => 
        {
            text.innerHTML = input.value
            item.removeChild(input)
            item.prepend(text)
        }

        item.prepend(input)
        item.removeChild(text)
        item.querySelector('input').focus()
    }
}

function remove_event(event)
{
    let item = event.target.parentElement
    item.parentElement.removeChild(item)
}

$(document).ready(() => 
{
    $('.tab-content').hide()
    $('.tabs #selected').ready(() => 
    {
        let id = $('.tabs #selected').html()
        $('.content [id="' + id + '"]').show()
    })

    $('.tabs button').click((event) => 
    {
        $('.tabs button').attr('id', '')
        event.target.id = 'selected'

        let id = event.target.innerHTML
        $('.tab-content').hide()
        $('.content [id="' + id + '"]').show()
    })

    $('.file-list li img').click(edit_event)
    $('.file-list li #remove').click(remove_event)
})
