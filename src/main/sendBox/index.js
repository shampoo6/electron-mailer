import {BrowserWindow} from 'electron'

export default () => {
  const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`
  let win
  win = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })
  win.loadURL(winURL)

  win.on('closed', () => {
    win = null
  })

  win.on('close', (e) => {
    win.setSkipTaskbar(true)
    win.hide()
    e.preventDefault()
  })

  win.setSkipTaskbar(true)
  win.hide()
}
