/* eslint-disable no-console -- Logging out errors. */
import path from 'path'

import { expect, assert } from 'chai'
import puppeteer from 'puppeteer'

const TIMEOUT = 80000
interface TestCaseInfo {
  name: string
  span: string
  error?: string
}

function getCountAndDisplayError(result): number {
  let count = 0
  for (const testCase of result.test) {
    if (Object.prototype.hasOwnProperty.call(testCase, 'error')) {
      count += 1
      console.log(
        `${count})`,
        result.type,
        JSON.stringify(testCase, null, '\t'),
      )
    }
  }
  return count
}

describe('Browser Tests', () => {
  it(
    'Integration Tests',
    // eslint-disable-next-line max-statements -- Testing
    async () => {
      console.log('before launch')
      const browser = await puppeteer.launch({ headless: true })
      console.log('after launch')
      let jest_results
      try {
        console.log('before new page')
        const page = await browser.newPage().catch()
        console.log('after new page')
        page.setDefaultNavigationTimeout(0)

        console.log(
          'before page.goto: ',
          'file:///',
          __dirname,
          '../localIntegrationRunner.html',
        )
        await page.goto(
          path.join('file:///', __dirname, '../localIntegrationRunner.html'),
        )
        console.log('after page.goto')

        await page.waitForFunction(
          'document.querySelector("body").innerText.includes("closing test")',
          { timeout: TIMEOUT },
        )

        console.log('after transaction for closing test')

        jest_results = await page.evaluate(() => {
          const results: Array<{ type: string; test: TestCaseInfo[] }> = []
          const items = document.querySelectorAll('.suite')
          items.forEach((item) => {
            const tests = item.querySelectorAll('li')
            const cases: TestCaseInfo[] = []
            tests.forEach((testCase) => {
              cases.push({
                name: testCase.querySelector('h2')?.outerText as string,
                span: testCase.querySelector('.duration')
                  ?.textContent as string,
                error: testCase.querySelector('.error')?.textContent as string,
              })
            })
            results.push({
              type: item.querySelector('h1')!.textContent as string,
              test: cases,
            })
          })
          return results
        })

        const fails = await page.evaluate(() => {
          const element = document.querySelector('.failures')

          return element == null ? null : element.textContent
        })
        const passes = await page.evaluate(() => {
          const element = document.querySelector('.passes')

          return element == null ? null : element.textContent
        })

        expect(fails).to.equal('failures: 0')
        expect(passes).to.not.equal('passes: 0')
      } catch (error) {
        console.error('Error running browser tests: ', error)
        // '\x1b[31m' specifies that console text will be displayed in color red here on.
        console.log('\x1b[31m', 'Failed Tests:')
        let count = 0
        if (jest_results) {
          // eslint-disable-next-line max-depth -- Necessary for loop.
          for (const result of jest_results) {
            count += getCountAndDisplayError(result)
          }
        }

        // '\x1b[0m' specifies that console text color will be reset.
        console.log(
          `Total ${count} test${count === 1 ? '' : 's'} failed. \n`,
          '\x1b[0m',
        )

        // we would always want the number of failing tests to be zero.
        assert.equal(0, count)
      } finally {
        await browser.close()
      }
    },
    TIMEOUT,
  )
})