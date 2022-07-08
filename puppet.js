const puppeteer = require('puppeteer-extra');
const recaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
const {query} = require("express");

const lehazminTor = async (teudatZehutNumber, phoneNumber, address) => {
    let registered = false;

    const populationAndImmigrationAuthority = 'https://myvisit.com/#!/home/provider/56';
    const signInWithReCaptcha = 'https://myvisit.com/#!/home/signin/';

    const browserOptions = {
        headless: false,
        defaultViewport: null,
        slowMo: 10
    };

    const getCalendar = async (page) => {                          // #mCSB_6_container > ul > li:nth-child(1) > button
        console.log('getCalendar(page) function started')
        let calendarSelector;
        try {
            calendarSelector = '#mCSB_5_container'
            await page.waitForSelector(calendarSelector, {timeout: 5000});
        } catch {
            try {
                calendarSelector = '#mCSB_6_container'
                await page.waitForSelector(calendarSelector, {timeout: 2000});
            } catch {
                try {
                    calendarSelector = '#mCSB_7_container'
                    await page.waitForSelector(calendarSelector, {timeout: 2000});
                } catch {
                    try {
                        calendarSelector = '#mCSB_8_container'
                        await page.waitForSelector(calendarSelector, {timeout: 2000});
                    } catch {
                        try {
                            calendarSelector = '#mCSB_9_container'
                            await page.waitForSelector(calendarSelector, {timeout: 2000});
                        } catch {
                            throw new Error('Calendar is unavailable')
                        }
                    }
                }
            }
        }
        let htmls;

        htmls = await page.$$eval(calendarSelector + ' > ul > li', dates => {
            return dates.map(date => date.outerHTML);
        });

        console.log(htmls)

        const dateFormat = new RegExp('\d{1,2}\s')

        htmls.forEach((el)=>{
            console.log(el.lastIndexOf(firstIndexFilter) + 1)
            console.log(el.lastIndexOf(lastIndexFilter) + 1)
        })

        // let dates = htmls.map(elem =>
        //     elem.substring(elem.charAt(elem.lastIndexOf(firstIndexFilter) + 1), elem.charAt(elem.lastIndexOf(lastIndexFilter) + 1))
        // );

        console.log(dates);

        // const element = elements.find(element => element.innerHTML === '<h1>Hello, world!</h1>');
        // element.click();
    }

    const solveRecaptcha = async (page) => {
        await page.goto(signInWithReCaptcha);
        await page.solveRecaptchas();
        await page.waitForSelector('#continueSkip > div.enter > div > a');
        await page.waitForTimeout(2000);
        await page.click('#continueSkip > div.enter > div > a');
        await page.waitForSelector('#continueSkip > div:nth-child(3) > div > div.highlighted.enter > button');
        await page.click('#continueSkip > div:nth-child(3) > div > div.highlighted.enter > button');
    }

    puppeteer.use(
        recaptchaPlugin({
            provider: {id: '2captcha', token: 'f6cc392481a659715f7ef3484387aeb4'},
            visualFeedback: true
        })
    );
    while (!registered) {
        try {
            var browser = await puppeteer.launch(browserOptions);
            let page = await browser.newPage();
            await page.setDefaultNavigationTimeout(120000);
            await page.setDefaultTimeout(120000);

            await solveRecaptcha(page);
            console.log('Recaptcha solved')

            await page.goto(populationAndImmigrationAuthority);
            await page.waitForSelector('#ID_KEYPAD');
            await page.type('#ID_KEYPAD', teudatZehutNumber);
            await page.keyboard.press('Enter');
            await page.waitForSelector('#PHONE_KEYPAD');
            await page.type('#PHONE_KEYPAD', phoneNumber);
            await page.keyboard.press('Enter');
            await page.waitForTimeout(2000);
            await page.waitForSelector(`#\\31 56`); //#\32 165תיאום\ פגישה\ לתיעוד\ ביומטרי
            await page.click(`#\\31 56`);
            await page.waitForSelector('#searchInput');
            await page.type('#searchInput', address);
            await page.waitForTimeout(3000);
            await page.click('#searchInput');
            await page.keyboard.press('Tab');
            await page.keyboard.press('Tab');
            await page.keyboard.press('Enter');
            await page.waitForSelector(`#\\32 219תיאום\\ פגישה\\ לתיעוד\\ ביומטרי`);
            await page.click(`#\\32 219תיאום\\ פגישה\\ לתיעוד\\ ביומטרי`);
            await page.waitForSelector(`#\\36 f2ffb58-b985-436c-a3f7-f5913299fa30`);
            await page.click(`#\\36 f2ffb58-b985-436c-a3f7-f5913299fa30`);
            console.log('goes to calendar page')


            // #mCSB_6_container > ul > li:nth-child(1) > button

            const calendarObj = await getCalendar(page);

            // await page.waitForRequest('https://myvisit.com/#!/home/summary/');
            // await page.waitForSelector('#accordiongroup-2074-6541-panel > div > div > div:nth-child(2) > div:nth-child(1) > button');
            // await page.click('#accordiongroup-2074-6541-panel > div > div > div:nth-child(2) > div:nth-child(1) > button');


            // await page.tracing.stop();
            // await browser.close();
            registered = true;
        } catch (error) {
            console.log(error);
            await browser.close();
        }
    }
}

module.exports = lehazminTor;