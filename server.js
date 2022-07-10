const express = require('express');
const app = express();
const WSserver = require('express-ws')(app);
const eventEmitter = require('node:events');
const datesEmitter = new eventEmitter();
const lehazminTor = require("./puppet");
// app.use(express.json());
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('Server started on port ' + PORT);
})

app.ws('/', (ws, req) => {
    console.log('Client with IP ' + req.socket.remoteAddress + ' connected');

    datesEmitter.on('calendarParsed', (datesWithSelectorsObj) => {
        console.log(datesWithSelectorsObj)
        ws.send(JSON.stringify(datesWithSelectorsObj));
    })

    ws.on('message', (data) => {
        data = JSON.parse(data);
        if (data instanceof Object) {
            const teudat = data.teudat;
            const phone = data.phone;
            const address = data.address;
            lehazminTor(teudat, phone, address, datesEmitter)
        } else if (data instanceof String) {
            datesEmitter.emit('dateChosen', data)
        }
    })
});

