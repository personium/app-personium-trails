exports.personium = (function() {
    var personium = personium || {};
    var _allowedKeys = [];
    var _requiredKeys = [];
    
    var _ = require("underscore")._;
    var accInfo = require("acc_info").accInfo;
    var _appCellAdminInfo = accInfo.APP_CELL_ADMIN_INFO;
    var _refererList = [accInfo.APP_CELL_URL];

    personium.getAppCellUrl = function() {
        return accInfo.APP_CELL_URL;
    };

    personium.setAppCellAdminInfo = function(tempInfo) {
        _appCellAdminInfo = tempInfo;
    };

    personium.getAppCellAdminInfo = function() {
        return _appCellAdminInfo;
    };

    personium.getAppToken = function(p_target) {
        var ret;
        var appCell = _p.as(_appCellAdminInfo).cell(p_target);
        ret = appCell.getToken();
        return ret;
    };

    personium.getAppAuthUserToken = function(query, token) {
        var cellUrl = query.cellUrl;
        var url = [
            cellUrl,
            "__token"
        ].join("");
        var headers = {
            "Accept": "application/json"
        };
        var contentType = "application/x-www-form-urlencoded";
        var body = [
            "grant_type=authorization_code",
            "code=" + query.code,
            "client_id=" + personium.getAppCellUrl(),
            "client_secret=" + token
        ].join('&');
        var httpCodeExpected = 200;
        
        return personium.httpPOSTMethod(url, headers, contentType, body, httpCodeExpected);
    };
    
    personium.refreshProtectedBoxAccessToken = function(params, appToken) {
        var cellUrl = params.p_target;
        var url = [
            cellUrl,
            "__token"
        ].join("");
        var headers = {
            "Accept": "application/json"
        };
        var contentType = "application/x-www-form-urlencoded";
        var body = [
            "grant_type=refresh_token",
            "refresh_token=" + params.refresh_token,
            "client_id=" + personium.getAppCellUrl(),
            "client_secret=" + appToken
        ].join('&');
        var httpCodeExpected = 200;
        
        return personium.httpPOSTMethod(url, headers, contentType, body, httpCodeExpected);
    };
    
    personium.getTranscellToken = function(params, appToken) {
        var cellUrl = params.user_url;
        var url = [
            cellUrl,
            "__token"
        ].join("");
        var headers = {
            "Accept": "application/json"
        };
        var contentType = "application/x-www-form-urlencoded";
        var body = [
            "grant_type=refresh_token",
            "refresh_token=" + params.refresh_token,
            "p_target=" + params.p_target,
            "client_id=" + personium.getAppCellUrl(),
            "client_secret=" + appToken
        ].join('&');
        var httpCodeExpected = 200;
        
        return personium.httpPOSTMethod(url, headers, contentType, body, httpCodeExpected);
    };
    
    personium.getProtectedBoxAccessToken4ExtCell = function(cellUrl, transcellToken, appToken) {
        var url = [
            cellUrl,
            "__token"
        ].join("");
        var headers = {
            "Accept": "application/json"
        };
        var contentType = "application/x-www-form-urlencoded";
        var body = [
            "grant_type=urn:ietf:params:oauth:grant-type:saml2-bearer",
            "assertion=" + transcellToken,
            "client_id=" + personium.getAppCellUrl(),
            "client_secret=" + appToken
        ].join('&');
        var httpCodeExpected = 200;
        
        return personium.httpPOSTMethod(url, headers, contentType, body, httpCodeExpected);
    };

    personium.getUserCell = function(accInfo, cellname) {
        return _p.as(accInfo).cell(cellname);
    };

    personium.getUserCellMainBox = function(accInfo, cellname){
        return _p.as(accInfo).cell(cellname).box("__");
    };

    personium.validateRequestMethod = function(supportedMethods, request) {
        if (_.contains(supportedMethods, request.method)) {
            return true;
        } else {
            var err = [
                "io.personium.client.DaoException: 405,",
                JSON.stringify({
                    "code": "PR405-MC-0001",
                    "message": {
                        "lang": "en",
                        "value": "Method not allowed."
                    }
                })
            ].join("");
            throw new _p.PersoniumException(err);
        }
    };

    personium.verifyOrigin = function(request) {
        var refererUrl = request["headers"]["referer"];
        /*
         * Usually only your App's URL is enough.
         * However, if you can allow other Apps to call your function to get Authentication Token.
         */
        var refererUrlList = _refererList;
        var urlAllowed = false;
        for (i = 0; i < refererUrlList.length; i++) {
            if (refererUrl && refererUrl.indexOf(refererUrlList[i]) == 0) {
                urlAllowed = true;
                break;
            }
        }
        if (!urlAllowed) {
            var err = [
                "io.personium.client.DaoException: 400,",
                JSON.stringify({
                    //"code": "400",
                    "message": {
                        "lang": "en",
                        "value": "Cross-domain request not allowed."
                    }
                })
            ].join("");
            throw new _p.PersoniumException(err);
        }
    };

    personium.parseQuery = function(request) {
        var queryString = request.queryString;
        var query = _p.util.queryParse(queryString);
        return query;
    };

    personium.parseBodyAsJSON = function(request) {
        var bodyAsString = personium.parseBody(request);
        return JSON.parse(bodyAsString);
    };

    personium.parseBodyAsQuery = function(request) {
        var bodyAsString = personium.parseBody(request);
        return _p.util.queryParse(bodyAsString);
    };

    personium.parseBody = function(request) {
        var bodyAsString = request["input"].readAll();
        if (_.isEmpty(bodyAsString)) {
            var err = [
                "io.personium.client.DaoException: 400,",
                JSON.stringify({
                    "code": "PR400-OD-0006",
                    "message": {
                        "lang": "en",
                        "value": "Request body is empty."
                    }
                })
            ].join("");
            throw new _p.PersoniumException(err);
        }
        return bodyAsString;
    };
    
    personium.setAllowedKeys = function(tempArray) {
        _allowedKeys = tempArray;
    };
    
    personium.getAllowedKeys = function() {
        return _allowedKeys;
    };
    
    personium.setRequiredKeys = function(tempArray) {
        _requiredKeys = tempArray;
    };
    
    personium.getRequiredKeys = function() {
        return _requiredKeys;
    };
    
    /* 
     * Validate all keys according to the following rules.
     * 1. whether it is included in params
     * 2. whether its value is undefined
     * 3. whether its value is null
     */
    personium.validateKeys = function(params) {
        var invalidParams = _.omit(params, _allowedKeys);
        if (_.isEmpty(invalidParams)) {
            // if _requiredKeys is empty, hasRequiredInfo will be true.
            var hasRequiredInfo = _.every(
                _requiredKeys,
                function(element, index, list){
                    return _.has(params, element) && !_.isEmpty(params[element]) && params[element] !== "undefined";
                }
            );
            
            if (hasRequiredInfo) {
                return true;
            } else {
                var err = [
                    "io.personium.client.DaoException: 400,",
                    JSON.stringify({
                        "code": "PR400-CM-0001",
                        "message": {
                            "lang": "en",
                            "value": "Required key missing or value is null."
                        }
                    })
                ].join("");
                throw new _p.PersoniumException(err);
            }
        } else {
            var invalidKeys = _.keys(invalidParams);
            var err = [
                "io.personium.client.DaoException: 400,",
                JSON.stringify({
                    "code": "PR400-OD-0014",
                    "message": {
                        "lang": "en",
                        "value": "Unknown property was appointed."
                    },
                    "data": invalidKeys
                })
            ].join("");
            throw new _p.PersoniumException(err);
        }
    };

    personium.httpPOSTMethod = function (url, headers, contentType, body, httpCodeExpected) {
        var httpClient = new _p.extension.HttpClient();
        var response = null;
        var httpCode;
        try {
            response = httpClient.post(url, headers, contentType, body);
            httpCode = parseInt(response.status);
        } catch(e) {
            // Sometimes SSL certificate issue raises exception
            httpCode = 500;
        }
        if (httpCode === 500) {
            // retry
            var ignoreVerification = {"IgnoreHostnameVerification": true};
            httpClient = new _p.extension.HttpClient(ignoreVerification);
            response = httpClient.post(url, headers, contentType, body);
            httpCode = parseInt(response.status);
        }
        if (httpCode !== httpCodeExpected) {
            // Personium exception
            var err = [
                "io.personium.client.DaoException: ",
                httpCode,
                ",",
                response.body
            ].join("");
            throw new _p.PersoniumException(err);
        }
        return JSON.parse(response.body);
    };

    /*
     * There is no way to differentiate system error or Personium Exception.
     * Therefore, we try to check if e.message is JSON (Personium Exception) or not.
     */
    personium.createErrorResponse = function(e) {
        var tempErrorCode = e.code;
        // System error
        if (_.isError(e)) {
            return personium.createResponse(500, e);
        }

        var tempErrorMessage = e.message;
        try {
            // Convert to JSON so that response header can be properly configured ("Content-Type":"application/json").
            tempErrorMessage = JSON.parse(e.message);
        } catch(e) {
            tempErrorMessage = "Fail to parse JSON. " + tempErrorMessage;
        }
        if (_.isUndefined(tempErrorCode) || _.isNull(tempErrorCode) || tempErrorCode == 0) {
            return personium.createResponse(500, tempErrorMessage);
        }
        
        return personium.createResponse(tempErrorCode, tempErrorMessage);
    };
    
    personium.createResponse = function(tempCode, tempBody) {
        var isString = typeof tempBody == "string";
        var tempHeaders = isString ? {"Content-Type":"text/plain"} : {"Content-Type":"application/json"};
        return {
            status: tempCode,
            headers: tempHeaders,
            body: [isString ? tempBody : JSON.stringify(tempBody)]
        };
    };
    
    return personium;
}());
