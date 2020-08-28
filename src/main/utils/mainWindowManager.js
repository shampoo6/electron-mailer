import {BrowserWindow} from 'electron'

const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

class MainWindowManager {
  instance

  createMainWindow () {
    /**
     * Initial window options
     */
    this.instance = new BrowserWindow({
      height: 563,
      useContentSize: true,
      width: 1000
    })
    // todo
    this.instance.webContents.openDevTools()
    this.instance.loadURL(winURL)

    this.instance.on('closed', () => {
      this.instance = null
    })

    this.instance.on('close', (e) => {
      this.instance.setSkipTaskbar(true)
      this.instance.hide()
      e.preventDefault()
    })

    // todo
    // mainWindow.setSkipTaskbar(true)
    // mainWindow.hide()
  }

  // 任务栏闪烁
  flashFrame () {
    if (!this.instance.isVisible()) {
      this.instance.show()
      this.instance.setSkipTaskbar(false)
    }
    this.instance.flashFrame(true)
  }
}

const manager = new MainWindowManager()

export default manager
