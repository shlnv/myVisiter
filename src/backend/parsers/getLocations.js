const dotenv = require('dotenv');
dotenv.config();
const getCalendar = require("./getCalendar");
const enterZehutAndPhone = require("../enterZehutAndPhone");
const getLocations = async (page, teudatZehutNumber, phoneNumber) => {
    const selector = 'main > div > div > div > div > div > div > div > uib-accordion > div > div > div > div > div > div > div > div > div > div > ul';
    let htmls = [];
    let calendars = [];

    const getLiNumber = async () => {
        for (let attempts = 0; attempts < process.env.ATTEMPTS_AT_EVERY_STEP; attempts++) try {
            await page.waitForSelector(`${selector} > li`);
            htmls = await page.$$eval(`${selector} > li`, locations => locations.map(location => location.outerHTML));
            if (htmls == []) {
                continue;
            }
            break;
        } catch (e) {
            console.log(e)
        }
    }

    const getCalendars = async () => {
        for (let attempts = 0; attempts < process.env.ATTEMPTS_AT_EVERY_STEP; attempts++) try {
            console.log('Found ' + htmls.length + 'places to provide selected service');
            console.log('checking available dates');
            for (let i = 0; i < htmls.length; i++) {
                console.log(`goes to calendar page ${i + 1}`);
                await page.waitForSelector(`${selector} li:nth-child(${i + 1}) > div > div > div[data-ng-click="selectLocation(location)"]`);
                await page.click(`${selector} li:nth-child(${i + 1}) > div > div > div[data-ng-click="selectLocation(location)"]`);
                await page.waitForTimeout(1000);
                for (let attempts = 0; attempts < process.env.ATTEMPTS_AT_EVERY_STEP; attempts++) try {
                    await page.waitForSelector('button[ng-click="selectServicePage(i.serviceId);"]');
                    await page.click('button[ng-click="selectServicePage(i.serviceId);"]');
                    await page.waitForSelector('row-answer > ul > li:nth-child(1)');
                    await page.click('row-answer > ul > li:nth-child(1)');
                    let cal = await getCalendar(page);
                    if (cal != []) {
                        calendars[i] = cal;
                    }
                    break;
                } catch (e) {
                    console.log(e);
                    await page.reload()
                    await enterZehutAndPhone(page, teudatZehutNumber, phoneNumber)
                }
                await page.goBack();
                await page.waitForTimeout(2000);
            }
            break;
        } catch
            (e) {
            console.log(e);
            await page.reload();
            await page.waitForTimeout(2000);
        }
    }

    await getLiNumber();
    await getCalendars();
    let calendarsFiltered = calendars.filter((el) => el != null);
    return calendarsFiltered;
}

module.exports = getLocations;