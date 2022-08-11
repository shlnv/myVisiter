const dotenv = require('dotenv');
dotenv.config();
const puppeteer = require('puppeteer-extra');
const recaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
const getTimes = require("./parsers/getTimes");
const getLocations = require("./parsers/getLocations");
const solveRecaptcha = require("./solveRecaptcha");
const enterZehutAndPhone = require("./enterZehutAndPhone");

const main = async (teudatZehutNumber, phoneNumber, calendarsEmitter, timeEmitter, readyEmitter) => {
    let calendars = [];
    let location;
    let dateSelector;

    const populationAndImmigrationAuthority = 'https://myvisit.com/#!/home/provider/56';

    const browserOptions =
        {
            headless: process.env.HEADLESS,
            slowMo: process.env.SLOWMO
        };

    puppeteer.use(
        recaptchaPlugin({
            provider: {
                id: process.env.RECAPTCHA_SOLVING_SOLUTION_ID,
                token: process.env.RECAPTCHA_SOLVING_SOLUTION_TOKEN
            },
        })
    );

    for (let attempts = 0; attempts < process.env.ATTEMPTS_GLOBAL; attempts++) try {
        var browser = await puppeteer.launch(browserOptions);
        console.log('browser started with option headless mode: ' + browserOptions.headless);
        let page = await browser.newPage();
        await page.setDefaultNavigationTimeout(process.env.DEFAULT_TIMEOUT);
        await page.setDefaultTimeout(process.env.DEFAULT_TIMEOUT);
        await page.goto(populationAndImmigrationAuthority);
        await solveRecaptcha(page);
        console.log('Recaptcha solved');
        await page.waitForSelector('input[ng-change="inputChange(questionnaireForm)"]');
        await enterZehutAndPhone(page, teudatZehutNumber, phoneNumber);
        await page.waitForTimeout(4000);
        await page.waitForSelector('li[data-ng-click="selectServiceType(serviceType)"]');
        await page.click('li[data-ng-click="selectServiceType(serviceType)"]');
        await page.waitForSelector('input[data-ng-change="updateparent({providersQuery: providersQuery})"]');
        calendars = await getLocations(page, teudatZehutNumber, phoneNumber);
        await page.setDefaultNavigationTimeout(process.env.TIMEOUT_WAIT_FOR_FRONTEND);
        await page.setDefaultTimeout(process.env.TIMEOUT_WAIT_FOR_FRONTEND);

        calendarsEmitter.emit('calendarsParsed', calendars);
        await new Promise((resolve, reject) => {
            calendarsEmitter.on('dateChosen', (locationAndSelectorObject) => {
                location = locationAndSelectorObject.location;
                dateSelector = locationAndSelectorObject.selector;
                resolve();
            })
            calendarsEmitter.on('error', reject);
        });

        await page.click('input[data-ng-change="updateparent({providersQuery: providersQuery})"]');
        await page.type('input[data-ng-change="updateparent({providersQuery: providersQuery})"]', location);
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);
        await page.waitForSelector('button[ng-click="selectServicePage(i.serviceId);"]');
        await page.click('button[ng-click="selectServicePage(i.serviceId);"]');

        let timesWithSelectorsObjs = []
        for (let attempts = 0; attempts < process.env.ATTEMPTS_AT_EVERY_STEP; attempts++) try {
            await page.click(dateSelector);
            await page.click(dateSelector);
            timesWithSelectorsObjs = await getTimes(page);
            if (timesWithSelectorsObjs === [] || !timesWithSelectorsObjs) {
                throw new Error('Time was not parsed')
            }
            break;
        } catch (e) {
            console.log(e)
        }

        timeEmitter.emit('timeParsed', timesWithSelectorsObjs)
        let timeSelector;
        await new Promise((resolve, reject) => {
            timeEmitter.on('timeChosen', (selector) => {
                timeSelector = selector;
                resolve();
            })
            timeEmitter.on('error', reject);
        })

        await page.setDefaultNavigationTimeout(process.env.DEFAULT_TIMEOUT);
        await page.setDefaultTimeout(process.env.DEFAULT_TIMEOUT);
        await page.click(timeSelector);
        await page.waitForSelector('button[data-ng-click="createAppointment()"]');
        await page.click('button[data-ng-click="createAppointment()"]');
        break;

    } catch
        (e) {
        console.log(e);
        await browser.close();
    }
    await browser.close();
    readyEmitter.emit('ready');
}

module.exports = main;