const solveRecaptcha = async (page, url) => {
    for (let attempts = 0; attempts <= 10; attempts++) {
        try {
            console.log('solveRecaptcha function is running')
            // await page.waitForSelector('textarea[id="g-recaptcha-response"]')
            await page.waitForSelector('iframe[title="reCAPTCHA"]')
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
            break;
        } catch (e) {
            console.log('recaptcha solving error: ' + e)
        }
    }
}

module.exports = solveRecaptcha;