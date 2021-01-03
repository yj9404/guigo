var getday =  () =>{
    var day = new Date();
    var year = day.getFullYear()
    var month = day.getMonth()
    var date = day.getDate();
    month = month * 1;
    month = month + 1;
    date = date * 1;
    if (month < 10) month = '0' + month
    if (date < 10) date = '0' + date
    var fulltoday = year + '-' + month + '-' + date;
    return fulltoday;
}

module.exports = getday;