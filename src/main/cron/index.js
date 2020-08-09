const CronJob = require('cron').CronJob

export default () => {
  let job = new CronJob('*/5 * * * * *', () => {

  }, null, true, 'America/Los_Angeles')
  job.start()
}
