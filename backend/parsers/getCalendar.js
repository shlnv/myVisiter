const dotenv = require('dotenv');
dotenv.config();

const getCalendar = async (page) => {
    let dates = [];
    const calendarSelector = 'main > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > ul > li > div > div > div > div > div > div > ul';

    const location = await page.$eval('span[ng-bind="locationData.location.LocationName"]', (elem) => elem.innerHTML)

    const getDateArray = async () => {
        let htmls = [];
        for (let attempts = 0; attempts < process.env.ATTEMPTS_AT_EVERY_STEP; attempts++) try {
                htmls = await page.$$eval(`${calendarSelector} > li > button`, dates => {
                    return dates.map(date => date.outerHTML)
                });
                if (htmls == []) {
                    continue;
                }
            } catch (e) {
                console.log(e)
            }
        const dateExp = /\D{6,},\s(\D{3,}\s\d{1,2},\s\d{4})/;
        dates = htmls.map(html => dateExp.exec(html)[1]);
    }

    const createDateAndSelectorObjectArray = () => {
        let arr = [];
        for (let i = 0; i < dates.length; i++) {
            let dateSelectorAndLocationObject = {
                date: new Date(dates[i]),
                selector: calendarSelector + ' > li:nth-child(' + +(i + 1) + ') > button',
                location: location
            };
            arr.push(dateSelectorAndLocationObject);
        }
        return arr;
    }

    await page.waitForSelector(calendarSelector)
    await getDateArray();
    return createDateAndSelectorObjectArray();
}

module.exports = getCalendar;