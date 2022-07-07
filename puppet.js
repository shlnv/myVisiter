const puppeteer = require('puppeteer-extra');
const recaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');

const lehazminTor = async (teudatZehutNumber, phoneNumber, address) => {
    const populationAndImmigrationAuthority = 'https://myvisit.com/#!/home/provider/56';
    const signInWithReCaptcha = 'https://myvisit.com/#!/home/signin/';

    const browserOptions = {
        headless: false,
        defaultViewport: null,
        slowMo: 10
    };

    const solveRecaptcha = async (page) => {
        try {
            await page.goto(signInWithReCaptcha);
            await page.solveRecaptchas();
        } catch (error) {
            await page.goto(signInWithReCaptcha);
            await page.solveRecaptchas();
        }

        await page.waitForSelector('#continueSkip > div.enter > div > a');
        await page.waitForTimeout(2000);
        await page.click('#continueSkip > div.enter > div > a');
        await page.waitForSelector('#continueSkip > div:nth-child(3) > div > div.highlighted.enter > button');
        await page.click('#continueSkip > div:nth-child(3) > div > div.highlighted.enter > button');
    }

    puppeteer.use(
        recaptchaPlugin({provider: {id: '2captcha', token: 'f6cc392481a659715f7ef3484387aeb4'}, visualFeedback: true})
    );
    const browser = await puppeteer.launch(browserOptions);

    let page = await browser.newPage();
    await page.setDefaultNavigationTimeout(120000);
    await page.setDefaultTimeout(120000);

    await solveRecaptcha(page)

    await page.goto(populationAndImmigrationAuthority);
    await page.waitForSelector('#ID_KEYPAD');
    await page.type('#ID_KEYPAD', teudatZehutNumber);
    await page.keyboard.press('Enter');
    await page.waitForSelector('#PHONE_KEYPAD');
    await page.type('#PHONE_KEYPAD', phoneNumber);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);
    await page.waitForSelector(`#\\31 56`);
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
    await page.waitForSelector('#mCSB_7_container > ul');
    // const arrayOfDates = await page.evaluate(() => {
    //     const freeDates = Array.from(
    //         document.querySelectorAll('#mCSB_7_container > ul'),
    //         element => element.innerHTML
    //     );
    //     return freeDates;
    // });
    // console.log(arrayOfDates)

    // await page.waitForRequest('https://myvisit.com/#!/home/summary/');
    // await page.waitForSelector('#accordiongroup-2074-6541-panel > div > div > div:nth-child(2) > div:nth-child(1) > button');
    // await page.click('#accordiongroup-2074-6541-panel > div > div > div:nth-child(2) > div:nth-child(1) > button');
}

module.exports = lehazminTor;