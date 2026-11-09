import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  headless: 'new',
  args: ['--no-sandbox'],
})
const page = await browser.newPage()
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await page.goto('http://localhost:4174/', { waitUntil: 'networkidle0' })

const now = Date.now()
const H = 3_600_000
await page.evaluate((now) => {
  localStorage.setItem('pomotip:sessions', JSON.stringify([
    ...Array.from({ length: 3 }, (_, i) => ({ id: 'a' + i, taskId: 't1', type: 'focus', duration: 25, completedAt: now - (i + 2) * 3600_000 })),
    ...Array.from({ length: 2 }, (_, i) => ({ id: 'b' + i, taskId: 't3', type: 'focus', duration: 25, completedAt: now - (i + 1) * 3600_000 })),
    { id: 'c', taskId: null, type: 'focus', duration: 25, completedAt: now - 1800_000 },
    { id: 'd', taskId: 't1', type: 'focus', duration: 25, completedAt: now - 26 * 3600_000 },
  ]))
  localStorage.setItem('pomotip:tasks', JSON.stringify([
    { id: 't1', title: 'BT Dashboard', done: false, estimatedPomos: 1, completedPomos: 3, createdAt: now, completedAt: null },
    { id: 't2', title: 'BT Classification Refinement for the weekly dashboard import pipeline', done: false, estimatedPomos: 1, completedPomos: 0, createdAt: now + 1, completedAt: null },
    { id: 't3', title: 'Data Collection - KYL', done: false, estimatedPomos: 3, completedPomos: 1, createdAt: now + 2, completedAt: null },
  ]))
}, now)
await page.reload({ waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 700))

const log = (label, ok, extra = '') => console.log(`${ok ? 'PASS' : 'FAIL'} ${label} ${extra}`)
await page.evaluate(() => [...document.querySelectorAll('nav button')][2].click())
await new Promise((r) => setTimeout(r, 500))

const readChart = () =>
  page.evaluate(() => ({
    svg: !!document.querySelector('svg[aria-label="Focus time chart"]'),
    timeToggle: [...document.querySelectorAll('button[aria-pressed]')].find((b) => b.textContent.trim() === 'By time')?.getAttribute('aria-pressed'),
    taskToggle: [...document.querySelectorAll('button[aria-pressed]')].find((b) => b.textContent.trim() === 'By task')?.getAttribute('aria-pressed'),
    taskRows: [...document.querySelectorAll('li')].filter((li) => li.querySelector('div[title*="session"]')).length,
    barWidths: [...document.querySelectorAll('li div[title*="session"] > div')].map((d) => d.style.width),
  }))

const timeView = await readChart()
log('default chart is time-series', timeView.svg && timeView.timeToggle === 'true', JSON.stringify({ svg: timeView.svg }))

await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'By task').click())
await new Promise((r) => setTimeout(r, 400))
const taskView = await readChart()
log('By task swaps chart to one bar per task', !taskView.svg && taskView.taskToggle === 'true' && taskView.taskRows === 3, `rows=${taskView.taskRows}`)
log('task bars scaled by focus time', taskView.barWidths.length === 3 && taskView.barWidths[0] === '100%', JSON.stringify(taskView.barWidths))
await page.screenshot({ path: '/tmp/reports-task-chart.png' })

await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'By time').click())
await new Promise((r) => setTimeout(r, 400))
const backView = await readChart()
log('switching back restores bar chart', backView.svg && backView.timeToggle === 'true')

await page.screenshot({ path: '/tmp/reports-time-chart.png' })
await browser.close()
