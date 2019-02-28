
$ = require('jquery')
fs = require('fs')
local_files_list = []
const { dialog } = require('electron').remote

function add_item(file_path)
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

function add_folder()
{
    dialog.showOpenDialog((file_path) =>
    {
        if (file_path)
        {
            add_item(file_path)
            local_files_list.push(file_path[0])
            save_list()
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
            local_files_list.splice(local_files_list.indexOf(text.innerHTML), 1)
            local_files_list.push(input.value)
            save_list()

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
    let text = item.querySelector('#location')
    local_files_list.splice(local_files_list.indexOf(text.innerHTML), 1)
    item.parentElement.removeChild(item)
    save_list()
}

function save_list()
{
    fs.writeFile('data/local_files.json', 
        JSON.stringify(local_files_list), 
        () => {})
}

function load_list()
{
    fs.readFile('data/local_files.json', (err, data) => 
    {
        if (err)
            return console.log(err)

        $('.file-list').empty()
        local_files_list = JSON.parse(data)
        local_files_list.forEach((file_path) => 
        {
            add_item(file_path)
        })
    })
}

$(document).ready(() => 
{
    let module_name = 'Local Files'

    let tab = document.createElement('button')
    let tab_content = document.createElement('div')
    tab.innerHTML = module_name
    tab_content.id = module_name
    tab_content.className = 'tab-content'
    fs.readFile('modules/local_files/manager.html', (err, data) => { tab_content.innerHTML = data })
    $('.tabs').append(tab)
    $('.content').append(tab_content)

    $('.file-list li img').click(edit_event)
    $('.file-list li #remove').click(remove_event)
    load_list()
    module_done_loading()
})
