const puppeteer = require('puppeteer-extra');
const recaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
const getCalendar = require("./parsers/getCalendar");
const getTimes = require("./parsers/getTimes");
const getLocations = require("./parsers/getLocations");
const solveRecaptcha = require("./solveRecaptcha");

const lehazminTor = async (teudatZehutNumber, phoneNumber, calendarsEmitter, timeEmitter, readyEmitter) => {
    console.log('LehazminTor function running...')
    let orderedFlag = false;
    let calendarPassedFlag = false;
    let calendars = [];

    const populationAndImmigrationAuthority = 'https://myvisit.com/#!/home/provider/56';

    const browserOptions =
        {
            headless: false,
            slowMo: 500
        };

    puppeteer.use(
        recaptchaPlugin({
            provider: {id: '2captcha', token: 'f6cc392481a659715f7ef3484387aeb4'},
        })
    );

    for (let attempts = 0; attempts < 20; attempts++) {
        try {
            var browser = await puppeteer.launch(browserOptions);
            console.log('browser started with option headless mode: ' + browserOptions.headless);
            let page = await browser.newPage();
            console.log('browser tab opened');
            let defaultTimeout = 120000;
            await page.setDefaultNavigationTimeout(defaultTimeout);
            await page.setDefaultTimeout(defaultTimeout);

            console.log('default timeouts was set to ' + defaultTimeout)

            await page.goto(populationAndImmigrationAuthority);
            await solveRecaptcha(page);
            console.log('Recaptcha solved');
            await page.setDefaultNavigationTimeout(120000);
            await page.setDefaultTimeout(120000);
            console.log('default timeouts was set to 120 seconds');
            // console.log('waiting for input main > div > div > div > div > div > div > div > div > div > div > ul > li:nth-child(2)')
            // await page.waitForSelector('main > div > div > div > div > div > div > div > div > div > div > ul > li:nth-child(2)');
            // await page.click('main > div > div > div > div > div > div > div > div > div > div > ul > li:nth-child(2)')
            // await page.waitForTimeout(3000);
            // await page.reload();
            // await solveRecaptcha(page);
            // console.log('Recaptcha solved 2');

            console.log('waiting for id input[ng-change="inputChange(questionnaireForm)"]');
            await page.waitForSelector('input[ng-change="inputChange(questionnaireForm)"]');
            console.log('input[ng-change="inputChange(questionnaireForm)"] is on the page')
            for (let i = 0; i < 5; i++) {
                try {
                    await page.type('input[ng-change="inputChange(questionnaireForm)"]', teudatZehutNumber);
                    await page.keyboard.press('Enter');
                    console.log('teudat zehut accepted');
                    console.log('waiting for #PHONE_KEYPAD')
                    await page.waitForTimeout(2000)
                    await page.waitForSelector('#PHONE_KEYPAD', {timeout: 4000});
                    await page.type('input[ng-change="inputChange(questionnaireForm)"]', phoneNumber);
                    await page.keyboard.press('Enter');
                    console.log('phone number accepted')
                    break;
                } catch (e) {
                    console.log(e)
                }
            }
            console.log('waiting for selector li[data-ng-click="selectServiceType(serviceType)"]')
            await page.waitForTimeout(2000);
            await page.waitForSelector('li[data-ng-click="selectServiceType(serviceType)"]');
            await page.click('li[data-ng-click="selectServiceType(serviceType)"]');
            await page.waitForSelector('input[data-ng-change="updateparent({providersQuery: providersQuery})"]');
            await page.waitForTimeout(3000);

// =============== address input ====================

            await page.click('input[data-ng-change="updateparent({providersQuery: providersQuery})"]');
            await page.waitForTimeout(5000);
            await page.keyboard.press('Tab');
            await page.keyboard.press('Tab');
            await page.keyboard.press('Enter');
            await page.waitForTimeout(1000);
            await page.waitForSelector('button[ng-click="selectServicePage(i.serviceId);"]');
            await page.click('button[ng-click="selectServicePage(i.serviceId);"]');

            calendars = await getLocations(page);
            if (calendars[0] = ![]) {
                await page.setDefaultNavigationTimeout(600000);
                await page.setDefaultTimeout(600000);
                console.log('default timeouts set to 10 minutes');
            }
            calendarsEmitter.emit('calendarsParsed', calendars);

            await new Promise((resolve, reject) => {
                calendarsEmitter.on('dateChosen', (selector) => {
                    console.log('calendarsEmitter in Promise: ' + selector);
                    dateSelector = selector;
                    resolve();
                })
                calendarsEmitter.on('error', reject);
            });
            console.log('got selector from emitter: ' + dateSelector);
            let timesWithSelectorsObjs = []
            for (let i = 0; i < 10; i++) {
                try {
                    await page.click(dateSelector);
                    await page.click(dateSelector);
                    timesWithSelectorsObjs = await getTimes(page);
                    if (timesWithSelectorsObjs === [] || !timesWithSelectorsObjs) {
                        throw new Error('Time was not parsed')
                    }
                    break;
                } catch (e) {
                    console.log(e)
                }
            }
            timeEmitter.emit('timeParsed', timesWithSelectorsObjs)
            let timeSelector;
            await new Promise((resolve, reject) => {
                timeEmitter.on('timeChosen', (selector) => {
                    console.log('Emitter in Promise: ' + selector);
                    timeSelector = selector;
                    resolve();
                })
                timeEmitter.on('error', reject);
            })

            await page.click(timeSelector);
            console.log('waiting for selector button[data-ng-click="createAppointment()"]')
            await page.waitForSelector('button[data-ng-click="createAppointment()"]');
            console.log('final button is ready')
            // await page.click('button[data-ng-click="createAppointment()"]');
            orderedFlag = true;
            break;

        } catch (e) {
            console.log(e);
            await browser.close();
        }
    }
    await browser.close();
    readyEmitter.emit('ready');
}

module.exports = lehazminTor;