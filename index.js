
const { app, BrowserWindow } = require('electron')
let win

function create_window()
{
	win = new BrowserWindow({width: 1000, height: 600})
	win.setMenuBarVisibility(false)
	win.loadFile('index.html')
//	win.webContents.openDevTools()

	win.on('closed', () => 
	{
		win = null
	})
}

app.on('window-all-closed', () => 
{
	if (process.platform != "darwin")
		app.quit()
})

app.on('activate', () => 
{
	if (win === null)
		create_window()
})

app.on('ready', create_window)
