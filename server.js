const express = require('express');
const puppeteer = require('puppeteer-extra');
const recaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
const path = require('path');
const lehazminTor = require("./puppet");
const PORT = 5000;
const app = express();

app.listen(PORT, () => {
    console.log('Server started');
})

app.use(express.json())

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'index.html'))
})
app.post('/', (req, res) => {
    const data = req.body;
    const teudat = data.teudat;
    const phone = data.phone;
    const address = data.address;
    lehazminTor(teudat, phone, address)
});