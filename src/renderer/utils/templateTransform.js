export default (template, moment) => {
  let t = Object.assign({}, template)
  // 替换占位符
  // 替换内容
  t.content = t.content.replace(/%{r}/g, t.receiver)
  t.content = t.content.replace(/%{receiver}/g, t.receiver)
  t.content = t.content.replace(/%{b}/g, moment.day() === 5 ? '本周' : '今天')
  t.content = t.content.replace(/%{before}/g, moment.day() === 5 ? '本周' : '今天')
  t.content = t.content.replace(/%{a}/g, moment.day() === 5 ? '下周' : '明天')
  t.content = t.content.replace(/%{after}/g, moment.day() === 5 ? '下周' : '明天')
  // 替换主题
  t.subject = t.subject.replace(/%{n}/g, t.name)
  t.subject = t.subject.replace(/%{name}/g, t.name)
  t.subject = t.subject.replace(/%{j}/g, moment.day() === 5 ? '周报' : '日报')
  t.subject = t.subject.replace(/%{job}/g, moment.day() === 5 ? '周报' : '日报')
  return t
}
