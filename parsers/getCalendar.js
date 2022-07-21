const getCalendar = async (page) => {
    console.log('getCalendar function started')
    let htmls = [];
    let dates = [];
    const calendarSelector = 'main > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > div > ul > li > div > div > div > div > div > div > ul';
    // 'body > div > div:nth-child(1) > div > div > main > div > div > div > div > div:nth-child(1) > div > div:nth-child(2) > div > div > div > div > div:nth-child(2) > div > div > div > div > div > div > div:nth-child(1) > div:nth-child(3) > div > div:nth-child(1) > ul > li:nth-child(2) > div:nth-child(2) > div > div > div > div > div:nth-child(1) > ul'

    const location = await page.$eval('span[ng-bind="locationData.location.LocationName"]', (elem) => elem.innerHTML)

    const getDateArray = async () => {
        for (let i = 0; i < 10; i++) {
            try {
                htmls = await page.$$eval(`${calendarSelector} > li > button`, dates => {
                    return dates.map(date => date.outerHTML)
                });
                if (htmls == []) {
                    await getDateArray();
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