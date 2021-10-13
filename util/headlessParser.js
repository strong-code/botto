const puppeteer = require('puppeteer')
const Helpers = require('./helpers.js')

module.exports = class HeadlessParser {

  constructor() {}

  static async fetch(url) {
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()

    await page.setUserAgent(Helpers.httpOptions.headers['User-Agent'])
    await page.goto(url, { waitUntil: 'networkidle0' })
    const data = await page.content()
    return data
  }
}
