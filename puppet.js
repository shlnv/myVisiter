const puppeteer = require('puppeteer-extra');
const recaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');

const lehazminTor = async (teudatZehutNumber, phoneNumber, address, datesEmitter) => {
    let orderedFlag = false;
    let calendarPassedFlag = false;

    const populationAndImmigrationAuthority = 'https://myvisit.com/#!/home/provider/56';
    const signInWithReCaptcha = 'https://myvisit.com/#!/home/signin/';

    const browserOptions =
        {
            headless: false,
            defaultViewport: null,
            slowMo: 10
        };


    const getCalendar = async (page) => {
        console.log('getCalendar function started')
        let htmls = [];
        let dates = [];
        let calendarSelector = '#mCSB_-1_container > ul > li';

        // #mCSB_4_container > ul > li:nth-child(1)

        try {
            await page.waitForSelector(calendarSelector, {timeout: 3000});
        } catch (e) {
            for (let i = 0; i < 100; i++) {
                try {
                    calendarSelector = '#mCSB_' + i + '_container > ul > li';
                    await page.waitForSelector(calendarSelector, {timeout: 100});
                    break;
                } catch (e) {
                    console.log('selector ' + calendarSelector + ' was tried');
                    calendarSelector = null;
                }
            }
        }
        if (!calendarSelector || calendarSelector == '#mCSB_-1_container') {
            throw new Error('Calendar is unavailable')
        }
        const getDateArray = async (page) => {
            console.log(calendarSelector)
            //#mCSB_8_container > ul > li:nth-child(1)
            htmls = await page.$$eval(calendarSelector, dates => {
                console.log(dates)
                return dates.map(date => date.outerHTML);
            });

            console.log(htmls);

            const dateExp = /\D{6,},\s(\D{3,}\s\d{1,2},\s\d{4})/;

            dates = htmls.map(html => dateExp.exec(html)[1]);

            console.log(dates);
        }

        const createDateAndSelectorObjectArray = (calendarSelector) => {
            let arr = [];
            for (let i = 0; i < dates.length; i++) {
                let dateAndSelectorObject = {
                    date: new Date(dates[i]),
                    selector: calendarSelector + ' > ul > li:nth-child(' + +(i + 1) + ') > button'
                };
                arr.push(dateAndSelectorObject);
            }
            return arr;
        }
        await getDateArray(page);
        let arr = createDateAndSelectorObjectArray(calendarSelector);
        return arr;


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
    for (let attempts = 0; attempts < 20 || !orderedFlag; attempts++) {
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
            await page.waitForTimeout(1500);
            await page.type('#searchInput', address);
            await page.waitForTimeout(3000);
            await page.click('#searchInput');
            await page.keyboard.press('Tab');
            await page.keyboard.press('Tab');
            await page.keyboard.press('Enter');
//#accordiongroup-155-3117-panel > div > div > div > div > div > ul > li
            let selector = 'button[ng-click="selectServicePage(i.serviceId);"]'
            // await page.waitForSelector(`#\\32 219תיאום\\ פגישה\\ לתיעוד\\ ביומטרי`); //
            // #\32 165תיאום\ פגישה\ לתיעוד\ ביומטרי
            await page.waitForSelector(selector);
            // await page.click(`#\\32 219תיאום\\ פגישה\\ לתיעוד\\ ביומטרי`);
            await page.click(selector);
            for (let attempts = 0; attempts < 20; attempts++) {
                try {
                    await page.waitForSelector(`#\\36 f2ffb58-b985-436c-a3f7-f5913299fa30`);
                    await page.click(`#\\36 f2ffb58-b985-436c-a3f7-f5913299fa30`);

                    console.log('goes to calendar page');
                    const datesWithSelectorsObj = await getCalendar(page);
                    datesEmitter.emit('calendarParsed', datesWithSelectorsObj)
                    calendarPassedFlag = true;
                } catch (e) {
                    console.log(e);
                    await page.reload();
                    await page.waitForTimeout(2000);
                }

                await page.setDefaultNavigationTimeout(0);
                await page.setDefaultTimeout(0);

                // const waitForEmitter = async (emitter, event) =>
                // {
                //     return new Promise((resolve, reject) =>
                //     {
                //         let dateSelector = (val)=>
                //         {
                //         datesEmitter.on('dateChosen', (dateSelectorFromClient) => {})
                //         }
                //     })
                //
                // }
                await page.click(dateSelector);

                // await page.evaluate(() => {
                //     location.reload();
                // })
            }

            // await page.waitForRequest('https://myvisit.com/#!/home/summary/');
            // await page.waitForSelector('#accordiongroup-2074-6541-panel > div > div > div:nth-child(2) > div:nth-child(1) > button');
            // await page.click('#accordiongroup-2074-6541-panel > div > div > div:nth-child(2) > div:nth-child(1) > button');

            // await page.tracing.stop();
            // await browser.close();
            orderedFlag = true;
        } catch (error) {
            console.log(error);
            await browser.close();
        }

    }
}

module.exports = lehazminTor;