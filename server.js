const express = require('express');
const app = express();
const ws = require('express-ws')(app);
const eventEmitter = require('node:events');
const dateEmitter = new eventEmitter();
const timeEmitter = new eventEmitter();
const readyEmitter = new eventEmitter();
const lehazminTor = require("./puppet");
const PORT = 5000;

app.listen(PORT, () => {
    console.log('Server started on port ' + PORT);
})

app.ws('/', (ws, req) => {
    console.log('Client with IP ' + req.socket.remoteAddress + ' connected');

    dateEmitter.on('calendarParsed', (datesWithSelectorsObj) => {
        console.log(datesWithSelectorsObj);
        ws.send(JSON.stringify(datesWithSelectorsObj));
    });

    timeEmitter.on('timeParsed', (timesWithSelectorsObjs) => {
        console.log(timesWithSelectorsObjs);
        ws.send((JSON.stringify(timesWithSelectorsObjs)));
    });

    readyEmitter.on('ready',()=>{
        console.log('The queue is ordered');
        ws.send(JSON.stringify([{status: 'ready'}]));
    });

    ws.on('message', (data) => {
        data = JSON.parse(data);
        console.log('received data: ' + data);
        if (data.teudat) {
            console.log('inside if(data instanceof Object) in websocket')
            const teudat = data.teudat;
            const phone = data.phone;
            const address = data.address;
            lehazminTor(teudat, phone, address, dateEmitter, timeEmitter, readyEmitter);
        } else if(data.type == 'date') {
            console.log('inside date if in websocket')
            console.log(data);
            dateEmitter.emit('dateChosen', data.selector)
        }
        else if(data.type = 'time') {
            console.log('inside time if in websocket')
            console.log(data)
            timeEmitter.emit('timeChosen', data.selector)
        }
    })
});

