const dotenv = require('dotenv');
dotenv.config();

const enterZehutAndPhone = async (page, teudatZehutNumber, phoneNumber) => {
    for (let attempts = 0; attempts < process.env.ATTEMPTS_AT_EVERY_STEP; attempts++) try {
        await page.type('input[ng-change="inputChange(questionnaireForm)"]', teudatZehutNumber);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000)
        await page.waitForSelector('#PHONE_KEYPAD', {timeout: 4000});
        await page.type('input[ng-change="inputChange(questionnaireForm)"]', phoneNumber);
        await page.keyboard.press('Enter');
        break;
    } catch (e) {
        console.log(e)
    }
}

module.exports = enterZehutAndPhone;