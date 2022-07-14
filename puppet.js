const puppeteer = require('puppeteer-extra');
const recaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
const fullXPathToSelector = require("./utils");


const lehazminTor = async (teudatZehutNumber, phoneNumber, address, dateEmitter, timeEmitter, readyEmitter) => {
    console.log('LehazminTor function running...')
    let orderedFlag = false;
    let calendarPassedFlag = false;
    let htmls = [];
    let dates = [];
    let times = [];

    const populationAndImmigrationAuthority = 'https://myvisit.com/#!/home/provider/56';

    const browserOptions =
        {
            headless: true,
            slowMo: 20
        };

    const getTimes = async (page) => {
        console.log('getTimes function started')
        const timeSelector = `main > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > ul`
        console.log(timeSelector)

        const getTimeArray = async (page) => {
            console.log('getTimeArray function started')
            htmls = await page.$$eval(timeSelector + ' > li', tms => {
                console.log('parsed: ' + tms);
                return tms.map(tm => tm.outerHTML);
            });
            console.log('array of time htmls: ' + htmls);
            const timeExp = /\d{1,2}:\d{2}/;
            // \s[A-P]{2}
            times = htmls.map(time => timeExp.exec(time)[0]);
        }
        const createTimeAndSelectorObjectArray = (timeSelector) => {
            let arr = [];
            for (let i = 0; i < times.length; i++) {
                let timeAndSelectorObject = {
                    time: times[i],
                    selector: timeSelector + ' > li:nth-child(' + +(i + 1) + ') > button[data-ng-click="chooseTime(s.Time)"]'
                };
                arr.push(timeAndSelectorObject);
            }
            return arr;
        }
        await page.waitForTimeout(2000);
        await getTimeArray(page);
        let arr = createTimeAndSelectorObjectArray(timeSelector);
        return arr;

    }

    const getCalendar = async (page) => {
        console.log('getCalendar function started')
        const calendarSelector = 'body > div > div:nth-child(1) > div > div > main > div > div > div > div > div:nth-child(1) > div > div:nth-child(2) > div > div > div > div > div:nth-child(2) > div > div > div > div > div > div > div:nth-child(1) > div:nth-child(3) > div > div:nth-child(1) > ul > li:nth-child(2) > div:nth-child(2) > div > div > div > div > div:nth-child(1) > ul'

        const getDateArray = async (page) => {
            for (let i = 0; i < 10; i++) {
                try {
                    htmls = await page.$$eval(`${calendarSelector} > li > button`, dates => {
                        return dates.map(date => date.outerHTML)
                    });
                    if (htmls == []) {
                        await getDateArray(page);
                    }
                } catch (e) {
                    console.log(e)
                }
            }

            console.log(htmls);
            const dateExp = /\D{6,},\s(\D{3,}\s\d{1,2},\s\d{4})/;
            dates = htmls.map(html => dateExp.exec(html)[1]);
            htmls = [];
            console.log(dates);
        }

        const createDateAndSelectorObjectArray = (calendarSelector) => {
            let arr = [];
            for (let i = 0; i < dates.length; i++) {
                let dateAndSelectorObject = {
                    date: new Date(dates[i]),
                    selector: calendarSelector + ' > li:nth-child(' + +(i + 1) + ') > button'
                };
                arr.push(dateAndSelectorObject);
            }
            return arr;
        }

        await page.waitForSelector(calendarSelector)
        await getDateArray(page);
        let arr = createDateAndSelectorObjectArray(calendarSelector);
        return arr;
    }


    const solveRecaptcha = async (page) => {
        console.log('solveRecaptcha function is running')
        await page.goto(populationAndImmigrationAuthority);
        console.log('redirected to the recaptcha')
        console.log('waiting for selector textarea[id="g-recaptcha-response"]')
        await page.waitForSelector('textarea[id="g-recaptcha-response"]')
        console.log('running method solveRecaptchas from recaptchaPlugin')
        await page.solveRecaptchas();
        console.log('recaptcha solved')
        console.log('Waiting for continue button')
        await page.waitForSelector('a[data-i18n="ContinueWithoutSignIn"]')
        await page.click('a[data-i18n="ContinueWithoutSignIn"]');
        console.log('continueButton clicked');
        console.log('waiting for selector button[ng-click="continueAsAnonymous();"]')

        await page.waitForSelector('button[ng-click="continueAsAnonymous();"]')
        await page.click('button[ng-click="continueAsAnonymous();"]');
        await page.click('button[ng-click="continueAsAnonymous();"]');
        console.log('button[ng-click="continueAsAnonymous();"] clicked')
    }

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
            let defaultTimeuot = 120000;
            await page.setDefaultNavigationTimeout(defaultTimeuot);
            await page.setDefaultTimeout(defaultTimeuot);

            console.log('default timeouts was set to ' + defaultTimeuot)

            await solveRecaptcha(page);
            console.log('Recaptcha solved');
            await page.setDefaultNavigationTimeout(20000);
            await page.setDefaultTimeout(20000);
            console.log('default timeouts was set to 20 seconds');
            console.log('waiting for id input[ng-change="inputChange(questionnaireForm)"]');
            await page.waitForTimeout(4000);
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
            await page.type('input[data-ng-change="updateparent({providersQuery: providersQuery})"]', address);
            await page.waitForTimeout(5000);
            await page.click('input[data-ng-change="updateparent({providersQuery: providersQuery})"]');
            await page.keyboard.press('Tab');
            await page.keyboard.press('Tab');
            await page.keyboard.press('Enter');
            await page.waitForTimeout(1000);
            await page.waitForSelector('button[ng-click="selectServicePage(i.serviceId);"]');
            await page.click('button[ng-click="selectServicePage(i.serviceId);"]');
            let datesWithSelectorsObjs = null;
            for (let attempts = 0; attempts < 10; attempts++) {
                try {
                    await page.waitForSelector('ul[aria-labelledby="lblmultiorcheck"] > li:nth-child(1)')
                    await page.click('ul[aria-labelledby="lblmultiorcheck"] > li:nth-child(1)');
                    console.log('goes to calendar page');
                    datesWithSelectorsObjs = await getCalendar(page);
                    dateEmitter.emit('calendarParsed', datesWithSelectorsObjs)
                    calendarPassedFlag = true;
                    break;
                } catch (e) {
                    console.log(e);
                    await page.reload();
                    await page.waitForTimeout(2000);
                }
            }

            if (calendarPassedFlag && datesWithSelectorsObjs) {
                await page.setDefaultNavigationTimeout(600000);
                await page.setDefaultTimeout(600000);
                console.log('default timeouts set to 10 minutes');
            }
            let dateSelector;
            await new Promise((resolve, reject) => {
                dateEmitter.on('dateChosen', (selector) => {
                    console.log('dateEmitter in Promise: ' + selector);
                    dateSelector = selector;
                    resolve();
                })
                dateEmitter.on('error', reject);
            });
            console.log('got selector from emitter: ' + dateSelector);
            let timesWithSelectorsObjs = []
            for (let i = 0; i < 10; i++) {
                try {
                    await page.click(dateSelector);
                    await page.click(dateSelector);
                    timesWithSelectorsObjs = await getTimes(page);
                    if (timesWithSelectorsObjs == [] || !timesWithSelectorsObjs) {
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

        } catch
            (error) {
            console.log(error);
            await browser.close();
        }
        break;
    }
    await browser.close();
    readyEmitter.emit('ready');
}

module.exports = lehazminTor;