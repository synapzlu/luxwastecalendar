module.exports.initDatetimestamp = function () {
    let today = new Date();
    let sToday = today.getDate().toString().padStart(2, '0');
    sToday += (today.getMonth() + 1).toString().padStart(2, '0');
    sToday += today.getFullYear().toString().substr(-2);
    sToday += today.getHours().toString().padStart(2, '0');
    sToday += today.getMinutes().toString().padStart(2, '0');
    sToday += today.getSeconds().toString().padStart(2, '0');
    return sToday;
}

module.exports.sortByDate = function (a, b) {
    const dateA = new Date(a);
    const dateB = new Date(b);

    let comparison = 0;
    if (dateA > dateB) {
        comparison = 1;
    } else if (dateA < dateB) {
        comparison = -1;
    }
    return comparison;
}