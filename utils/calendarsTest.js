const calendarsTest = () => {
    return [[{
        date: new Date('01.03.2024'),
        selector: 'li:nth-child(1) > button',
        location: 'Haifa'
    }, {
        date: new Date('02.03.2024'),
        selector: 'li:nth-child(2) > button',
        location: 'Haifa'
    }], [{
        date: new Date('03.03.2024'),
        selector: 'li:nth-child(1) > button',
        location: 'London'
    }, {
        date: new Date('04.03.2024'),
        selector: 'li:nth-child(2) > button',
        location: 'London'
    }]]
}

module.exports = calendarsTest;