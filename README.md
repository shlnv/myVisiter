# myVisiter

The bot orders a queue to receive teudat zehut.

To run use <i>node src/backend/server.js</i>
Then run html-file at "frontend" folder in any browser.
The file connects to server on port 5000 via web socket.

The bot solves repacha, parses free dates all over Israel and offers to choose the most convenient one.

I was using 2captcha-plugin for puppeteer to connect with service https://2captcha.com/ but it no longer solving captcha on this site. To use bot, you can change the plugin or disable automatic recaptcha solving (comment line <i>await solveRecaptcha(page);</i> at main.js in backend folder).

And you should always enter your valid id-number.
