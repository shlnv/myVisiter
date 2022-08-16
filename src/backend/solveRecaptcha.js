const dotenv = require('dotenv');
dotenv.config();

const solveRecaptcha = async (page) => {
    for (let attempts = 0; attempts <= process.env.ATTEMPTS_AT_EVERY_STEP; attempts++) try {
        await page.waitForSelector('iframe[title="reCAPTCHA"]')
        await page.solveRecaptchas();
        await page.waitForSelector('a[data-i18n="ContinueWithoutSignIn"]')
        await page.click('a[data-i18n="ContinueWithoutSignIn"]');
        await page.waitForSelector('button[ng-click="continueAsAnonymous();"]')
        await page.click('button[ng-click="continueAsAnonymous();"]');
        await page.click('button[ng-click="continueAsAnonymous();"]');
        break;
    } catch (e) {
        console.log('recaptcha solving error: ' + e)
    }
}
module.exports = solveRecaptcha;