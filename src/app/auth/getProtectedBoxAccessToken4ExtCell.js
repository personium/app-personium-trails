// Login
function(request){
    try {
        personium.validateRequestMethod(["POST"], request);
    
        personium.verifyOrigin(request);

        var params = personium.parseBodyAsQuery(request);
        // verify parameter information
        personium.setAllowedKeys(['user_url', 'p_target', 'refresh_token']);
        personium.setRequiredKeys(['user_url', 'p_target', 'refresh_token']);
        personium.validateKeys(params);

        var appTokenUser = personium.getAppToken(params.user_url); // User
        var transcellToken = personium.getTranscellToken(params, appTokenUser.access_token);
        
        var extUrl = params.p_target;
        var appTokenExt = personium.getAppToken(params.p_target); // External cell (cell to be accessed)
        var token = personium.getProtectedBoxAccessToken4ExtCell(extUrl, transcellToken.access_token, appTokenExt.access_token)
        
        return personium.createResponse(200, token);
    } catch (e) {
        return personium.createErrorResponse(e);
    }
}

var personium = require("personium").personium;
