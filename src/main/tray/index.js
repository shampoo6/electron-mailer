const {Menu, Tray} = require('electron')
const path = require('path')

// 创建系统通知区菜单
// tray = new Tray(path.join(__dirname, 'icon.ico'));
// const contextMenu = Menu.buildFromTemplate([
//   {label: '退出', click: () => {win.destroy()}},//我们需要在这里有一个真正的退出（这里直接强制退出）
// ])
// tray.setToolTip('My托盘测试')
// tray.setContextMenu(contextMenu)
// tray.on('click', ()=>{ //我们这里模拟桌面程序点击通知区图标实现打开关闭应用的功能
//   win.isVisible() ? win.hide() : win.show()
//   win.isVisible() ?win.setSkipTaskbar(false):win.setSkipTaskbar(true);
// })

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
