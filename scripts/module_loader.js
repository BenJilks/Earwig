
fs = require('fs')
still_loading = 0
finished_loading = null

function module_done_loading()
{
    still_loading--
    if (still_loading <= 0)
        finished_loading()
}

function load_module(folder, target)
{
    console.log('loading module ' + folder)

    fs.readdir(folder, (err, files) => 
    {
        if (err)
            return console.log(err)

        files.forEach((file) => 
        {
            let path = folder + '/' + file
            if (file == target)
            {
                let script = document.createElement('script')
                script.src = path
                script.onload = () => 
                {
                    console.log('loaded script ' + file)
                }
                
                still_loading++
                document.body.appendChild(script)
            }
        })
    })
}

function load_all_modules(folder, target, callback)
{
    finished_loading = callback

    fs.readdir(folder, (err, files) => 
    {
        if (err)
            return console.log(err)
        
        files.forEach((file) => {
            load_module(folder + '/' + file, target)
        })
    })
}
