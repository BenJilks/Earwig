
const { app, BrowserWindow } = require('electron')
let { ipcMain } = require('electron')
let win, manager

function create_window()
{
	win = new BrowserWindow({width: 1000, height: 600})
	win.setMenuBarVisibility(false)
	win.loadFile('index.html')
	//	win.webContents.openDevTools()
	
	win.on('closed', () => 
	{
		win = null
		if (manager != null)
		{
			manager.close()
			manager = null
		}
	})
}

ipcMain.on('manage_libs', () => 
{
	if (manager == null)
	{
		manager = new BrowserWindow({width: 800, height: 600})
		manager.setMenuBarVisibility(false)
		manager.loadFile('manager.html')

		manager.on('closed', () => 
		{
			manager = null
		})
	}
})

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
