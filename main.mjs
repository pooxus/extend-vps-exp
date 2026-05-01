import puppeteer from 'puppeteer'
import { setTimeout } from 'node:timers/promises'

const args = ['--no-sandbox', '--disable-setuid-sandbox']
if (process.env.PROXY_SERVER) {
    const proxy_url = new URL(process.env.PROXY_SERVER)
    proxy_url.username = ''
    proxy_url.password = ''
    args.push(`--proxy-server=${proxy_url}`.replace(/\/$/, ''))
}

const browser = await puppeteer.launch({
    defaultViewport: { width: 1080, height: 1024 },
    args,
})
const [page] = await browser.pages()
const userAgent = await browser.userAgent()
await page.setUserAgent(userAgent.replace('Headless', ''))
const recorder = await page.screencast({ path: 'recording.webm' })

try {
    if (process.env.PROXY_SERVER) {
        const { username, password } = new URL(process.env.PROXY_SERVER)
        if (username && password) {
            await page.authenticate({ username, password })
        }
    }

  await page.goto('https://secure.xserver.ne.jp/xapanel/login/xvps/', { waitUntil: 'domcontentloaded' })
  await page.locator('#memberid').fill(process.env.EMAIL)
  await page.locator('#user_password').fill(process.env.PASSWORD)
  await page.locator('text=ログインする').click()
  await page.waitForNavigation({ waitUntil: 'domcontentloaded' })

  await page.goto('https://secure.xserver.ne.jp/xapanel/xmgame/index', { waitUntil: 'domcontentloaded' })

  await page.locator('a[href^="/xapanel/xmgame/jumpvps/?"]').click()

  await page.waitForNavigation({ waitUntil: 'networkidle2' })
  await page.locator('a[href^="/xmgame/game/freeplan/extend/index"]').click()

  await page.waitForNavigation({ waitUntil: 'networkidle2' })
  await page.locator('a[href^="/xmgame/game/freeplan/extend/input"]').click()

  await page.waitForNavigation({ waitUntil: 'networkidle2' })
  await page.click('button[type="submit"]');

  await page.waitForNavigation({ waitUntil: 'networkidle2' })
  await page.click('button[formaction="/xmgame/game/freeplan/extend/do"]')

} catch (e) {
    console.error(e)
} finally {
    await setTimeout(5000)
    await recorder.stop()
    await browser.close()
}
