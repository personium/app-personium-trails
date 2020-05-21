// Login
function(request){
    try {
        personium.validateRequestMethod(["POST"], request);
    
        personium.verifyOrigin(request);

        var params = personium.parseBodyAsQuery(request);
        // verify parameter information
        personium.setAllowedKeys(['p_target', 'refresh_token']);
        personium.setRequiredKeys(['p_target', 'refresh_token']);
        personium.validateKeys(params);

        var appToken = personium.getAppToken(params.p_target);
        var token = personium.refreshProtectedBoxAccessToken(params, appToken.access_token);
        return personium.createResponse(200, token);
    } catch (e) {
        return personium.createErrorResponse(e);
    }
}

var personium = require("personium").personium;
