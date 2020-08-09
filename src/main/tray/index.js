const {Menu, Tray} = require('electron')
const path = require('path')
const createSendBox = require('../sendBox')

export default (mainWindow) => {
  let tray
  let icoPath = path.join(__dirname, '../../../static/icon.ico')
  tray = new Tray(icoPath)
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '打开界面',
      click: () => {
        mainWindow.show()
      }
    },
    {
      label: '发送邮件',
      click: () => {
        createSendBox()
      }
    },
    {
      label: '退出',
      click: () => {
        mainWindow.destroy()
      }
    }
  ])
  tray.addListener('double-click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
    mainWindow.isVisible() ? mainWindow.setSkipTaskbar(false) : mainWindow.setSkipTaskbar(true)
  })
  tray.setToolTip('日报助手')
  tray.setContextMenu(contextMenu)
  mainWindow.on('show', () => {
    tray.setHighlightMode('always')
  })
  mainWindow.on('hide', () => {
    tray.setHighlightMode('never')
  })
  return tray
}
