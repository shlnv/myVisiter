const getCalendar = require("./getCalendar");
const getLocations = async (page) => {
    console.log('getLocations function running')
    const selector = 'main > div > div > div > div > div > div > div > uib-accordion > div > div > div > div > div > div > div > div > div > div > ul';
    //'li:nth-child() > div > div > div[data-ng-click="selectLocation(location)"]'
    let htmls = [];
    let calendars = [];

    const getLiNumber = async () => {

        for (let i = 0; i < 10; i++) {
            try {
                htmls = await page.$$eval(`${selector} > li`, locations => {
                    return locations.map(location => location.outerHTML)
                });
                if (htmls == []) {
                    await getLiNumber();
                }
            } catch (e) {
                console.log(e)
            }
        }
    }


    await page.click(`${selector} li:nth-child(${i + 1}) > div > div > div[data-ng-click="selectLocation(location)"]`);
    await page.waitForTimeout(1000);
    await page.waitForSelector('button[ng-click="selectServicePage(i.serviceId);"]');
    await page.click('button[ng-click="selectServicePage(i.serviceId);"]');

    for (let attempts = 0; attempts < 10; attempts++) {
        try {
            await page.waitForSelector('ul[aria-labelledby="lblmultiorcheck"] > li:nth-child(1)')
            await page.click('ul[aria-labelledby="lblmultiorcheck"] > li:nth-child(1)');
            for (let i = 0; i++; i < htmls.length) {
                console.log(`goes to calendar page ${i + 1}`);
                calendars[i] = await getCalendar(page);
            }
            break;
        } catch (e) {
            console.log(e);
            await page.reload();
            await page.waitForTimeout(2000);
        }
    }
    return calendars;
}

module.exports = getLocations;