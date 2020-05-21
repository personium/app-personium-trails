exports.accInfo = (function() {
    /*
     * Begin of your Personium app configurations
     */
    var appCellUrl = 'https://app-personium-trails.appdev.personium.io/'; // for example: https://stg-demo.personium.io/appCellName/ or https://appCellName.stg-demo.personium.io/
    var appUserId = '***';
    var appUserPass = '***';
    /*
     * End of your Personium app configurations
     */


    /*
     * Don't modify anything from here on
     */
    var accInfo = {};
    accInfo.APP_CELL_URL = appCellUrl;
    accInfo.APP_CELL_ADMIN_INFO = {
        cellUrl: appCellUrl,
        userId: appUserId,
        password: appUserPass 
    };      

    return accInfo;
}());
