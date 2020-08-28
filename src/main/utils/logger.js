import log from 'electron-log'
import path from 'path'

export default (app) => {
  // error, warn, info, verbose, debug, silly
  if (process.env.NODE_ENV === 'development') {
    log.transports.file.level = 'debug'
    log.transports.file.resolvePath = (variables) => {
      // userData + /logs/ + fileName on Linux and Windows
      return path.join(__dirname, '../../../logs/' + variables.fileName)
    }
  } else {
    log.transports.file.level = 'warn'
    log.transports.file.resolvePath = (variables) => {
      // userData + /logs/ + fileName on Linux and Windows
      return path.join(path.dirname(app.getAppPath()), '/logs/' + variables.fileName)
    }
  }
  console.log = log
}
