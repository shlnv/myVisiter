const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const ws = require('express-ws')(app);
const eventEmitter = require('node:events');
const calendarsEmitter = new eventEmitter();
const timeEmitter = new eventEmitter();
const readyEmitter = new eventEmitter();
const main = require('./main');


app.listen(process.env.PORT, () => {
    console.log('Server started on port ' + process.env.PORT);
})

app.ws('/', (ws, req) => {
    console.log('Client with IP ' + req.socket.remoteAddress + ' connected');

    calendarsEmitter.on('calendarsParsed', (calendars) => {
        ws.send(JSON.stringify({type: 'calendars', data: calendars}));
    });

    timeEmitter.on('timeParsed', (timesWithSelectorsObjs) => {
        ws.send((JSON.stringify(timesWithSelectorsObjs)));
    });

    readyEmitter.on('ready', () => {
        ws.send(JSON.stringify([{status: 'ready'}]));
    });

    ws.on('message', (data) => {
        data = JSON.parse(data);
        if (data.teudat) {
            const teudat = data.teudat;
            const phone = data.phone;
            main(teudat, phone, calendarsEmitter, timeEmitter, readyEmitter);
        } else if (data.type == 'date') {
            calendarsEmitter.emit('dateChosen', {location: data.location, selector: data.selector})
        } else if (data.type = 'time') {
            timeEmitter.emit('timeChosen', data.selector)
        }
    })
});

