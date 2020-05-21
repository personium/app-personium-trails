// Login
function(request){
    try {
        personium.validateRequestMethod(["GET"], request);
        personium.verifyOrigin(request);
        
        var query = personium.parseQuery(request);

        // verify query information
        personium.setAllowedKeys(['cellUrl', 'code', 'state']);
        personium.setRequiredKeys(['cellUrl', 'code', 'state']);
        personium.validateKeys(query);

        // cross-check cookie & state
        verifyState(request);

        var cellUrl = query.cellUrl;
        var appToken = personium.getAppToken(cellUrl);
        var token = personium.getAppAuthUserToken(query, appToken.access_token);

        return personium.createResponse(200, token);
    } catch(e) {
        return personium.createErrorResponse(e);
    }
}

function verifyState(request) {
    var cookie = getStateFromCookie(request);
    var state = personium.parseQuery(request).state;
    var shaObj = new jsSHA(state, "ASCII");
    var hash = shaObj.getHash("SHA-512", "HEX");

    if (cookie != hash) {
        // raise exception
        // Personium exception
        var err = [
            "io.personium.client.DaoException: 401,",
            JSON.stringify({
                "code": "PR401-AU-0010",
                "message": {
                    "lang": "en",
                    "value": "Authentication failed."
                }
            })
        ].join("");
        throw new _p.PersoniumException(err);
    }
};

function getStateFromCookie(request) {
    var cookie = request.headers["cookie"]
    var state;
    if (cookie) {
        var list = cookie.split(';');
        state = _.find(list, function(item) {
            var tempStr = item.trim();
            return (tempStr.startsWith('personium='));
        });
    }
    if (state) {
        return state.split('=')[1];
    } else {
        return "";
    }
};

var personium = require("personium").personium;
var jsSHA = require("sha_dev2").jsSHA;
var moment = require("moment").moment;
var _ = require("underscore")._;
