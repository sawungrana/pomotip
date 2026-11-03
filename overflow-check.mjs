import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  headless: 'new',
  args: ['--no-sandbox'],
})

const check = async (page, label) => {
  const r = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth
    const out = []
    for (const el of document.querySelectorAll('body *')) {
      const b = el.getBoundingClientRect()
      if (b.right > vw + 1 || b.left < -1) {
        out.push(
          `${el.tagName.toLowerCase()}.${(el.className.baseVal ?? el.className ?? '')
            .toString()
            .split(' ')
            .slice(0, 4)
            .join('.')} L${Math.round(b.left)} R${Math.round(b.right)}`,
        )
      }
    }
    return { vw, docW: document.documentElement.scrollWidth, out: out.slice(0, 8) }
  })
  const bad = r.docW > r.vw || r.out.length ? ' ❌' : ' ✓'
  console.log(`${label}${bad} vw=${r.vw} docW=${r.docW}${r.out.length ? '\n    ' + r.out.join('\n    ') : ''}`)
}

for (const width of [320, 360, 375, 390, 414]) {
  for (const blockFonts of [false, true]) {
    const page = await browser.newPage()
    await page.setViewport({ width, height: 800, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
    if (blockFonts) {
      await page.setRequestInterception(true)
      page.on('request', (req) => {
        if (req.url().includes('fonts.') || req.url().includes('gstatic')) req.abort()
        else req.continue()
      })
    }
    await page.goto('http://localhost:4174/', { waitUntil: 'networkidle0' })
    await new Promise((r) => setTimeout(r, 500))
    const tag = `${width}px${blockFonts ? ' no-fonts' : ''}`
    await check(page, `${tag} timer`)
    await page.evaluate(() => [...document.querySelectorAll('nav button')][1].click())
    await new Promise((r) => setTimeout(r, 450))
    await check(page, `${tag} tasks`)
    await page.evaluate(() => [...document.querySelectorAll('nav button')][2].click())
    await new Promise((r) => setTimeout(r, 450))
    await check(page, `${tag} reports`)
    await page.close()
  }
}
await browser.close()
console.log('done')
