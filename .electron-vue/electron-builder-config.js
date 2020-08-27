const pjson = require('../package')

module.exports = {
  'publish': ['github'],
  'extraResources': [
    'static/'
  ],
  'productName': 'electron-mailer',
  'artifactName': `electron-mailer-setup-${pjson.version}.exe`,
  'appId': 'com.shampoo6.electronmailer',
  'directories': {
    'output': 'build'
  },
  'files': [
    'dist/electron/**/*'
  ],
  'dmg': {
    'contents': [
      {
        'x': 410,
        'y': 150,
        'type': 'link',
        'path': '/Applications'
      },
      {
        'x': 130,
        'y': 150,
        'type': 'file'
      }
    ]
  },
  'mac': {
    'icon': 'build/icons/icon.icns'
  },
  'win': {
    'icon': 'build/icons/icon.ico'
  },
  'linux': {
    'icon': 'build/icons'
  },
  'nsis': {
    'oneClick': false,
    'allowToChangeInstallationDirectory': true
  }
}
