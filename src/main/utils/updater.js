import {dialog} from 'electron'
import {autoUpdater} from 'electron-updater'
import log from 'electron-log'

export default () => {
  let message = {
    error: '检查更新出错',
    checking: '正在检查更新……',
    updateAva: '检测到新版本，正在下载……',
    updateNotAva: '现在使用的就是最新版本，不用更新'
  }
  // const loadUrl = `http://127.0.0.1:1024/`
  // autoUpdater.setFeedURL(loadUrl)
  autoUpdater.on('error', (e) => {
    dialog.showErrorBox('错误', message.error)
    log.error(e)
  })
  autoUpdater.on('checking-for-update', function () {
    dialog.showMessageBox({
      title: '提示',
      message: message.checking
    })
  })
  autoUpdater.on('update-available', function (info) {
    dialog.showMessageBox({
      title: '提示',
      message: message.updateAva
    })
  })
  autoUpdater.on('update-not-available', function (info) {
    dialog.showMessageBox({
      title: '提示',
      message: message.updateNotAva
    })
  })

  autoUpdater.checkForUpdatesAndNotify().then()
}
