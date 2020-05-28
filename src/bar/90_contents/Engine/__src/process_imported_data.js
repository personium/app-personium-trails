function(request) {
    try {
        // Support the following methods
        // Cell owner - POST, PUT, GET
        // AttributesViewer - GET
        personium.validateRequestMethod(["POST"], request);
               
        var results;
        switch(request.method) {
            case "GET":// Get attributes if permitted
                // var query = personium.parseQuery(request);
                // var fileList = _getFileList(query);

                // // Get readable attributes
                // var attributes = getAttributes(fileList);
                // results = {
                    // fileList : fileList,
                    // contents: attributes
                // }
                // break;
            case "POST":
                // Create attributes
                var params = personium.parseBodyAsJSON(request);

                // Validate parameters          
                personium.setAllowedKeys(["target"]);
                personium.validateKeys(params);                
                
                var timelineObjects = _getTimelineObjects(params.target);
                results = _processData(timelineObjects);
                break;
            // case "DELETE":
                // // Validate query in URL
                // var query = personium.parseQuery(request);
                // personium.setAllowedKeys(["username"]);
                // personium.setRequiredKeys(["username"]);
                // personium.validateKeys(query);
                
                // // Return empty body response
                // return {
                    // status : 204,
                    // headers : {"Content-Type":"application/json"},
                    // body: []
                // };
                // break;
        }
        
        return personium.createResponse(200, results);
    } catch(e) {
        return personium.createErrorResponse(e);
    }
};

var _getTimelineObjects = function (targetFile) {
    var box = _p.localbox();
    var jsonStr = box.getString('imported/'+ targetFile);
    
    var timelineObjects = JSON.parse(jsonStr).timelineObjects;
    
    return timelineObjects;
};

var _processData = function (timelineObjects) {
    var s_list = _.chain(timelineObjects).filter("placeVisit").map(function(item){
            return item.placeVisit;
        }).value();
    var m_list = _.chain(timelineObjects).filter("activitySegment").map(function(item){
            return item.activitySegment;
        }).value();
    var data = s_list[0] || m_list[0]; // todo default year
    var box = _p.localbox();
    var col = box.col("exported");
    var colYear = _createYearFolder(col, parseInt(data.duration.startTimestampMs));
    var results = {
        status: "success",
        counts: {
            total: s_list.length + m_list.length,
            stay: s_list.length,
            move: m_list.length,
        },
    };
    _.each(s_list, function(item){
        var timestampMs = parseInt(item.duration.startTimestampMs);
        _createMMDDFolder(colYear, timestampMs);
        var path = "exported/" + moment.tz(timestampMs, "Europe/London").format("YYYY/MMDD") + "/s_" + timestampMs + ".json";
        _p.localbox().put({
            path: path,
            data: JSON.stringify(item),
            contentType: "application/json",
            charset: "utf-8",
            etag: "*"
        });
        var newData = _toStayJSON(item);
        _register('Stay', newData);
    });
    
    _.each(m_list, function(item){
        var timestampMs = parseInt(item.duration.startTimestampMs);
        _createMMDDFolder(colYear, timestampMs);
        var path = "exported/" + moment.tz(timestampMs, "Europe/London").format("YYYY/MMDD") + "/m_" + timestampMs + ".json";
        _p.localbox().put({
            path: path,
            data: JSON.stringify(item),
            contentType: "application/json",
            charset: "utf-8",
            etag: "*"
        });
        var newData = _toMoveJSON(item);
        _register('Move', newData);
    });

    return results;
};

var _createYearFolder = function (col, timestampMs) {
    var t = moment.tz(timestampMs, "Europe/London");
    return _createFolder(col, t.format("YYYY"));
};

var _createMMDDFolder = function (col, timestampMs) {
    var t = moment.tz(timestampMs, "Europe/London");
    return _createFolder(col, t.format("MMDD"));
};

var _createFolder = function (col, name) {
    if (!_.contains(col.getColList(), col.getPath() + "/" + name)) {
        col.mkCol(name);
    }
    
    return col.col(name);
};

var _getTable = function (tableName) {
    return _p.localbox().odata('current').entitySet(tableName);
};

var _toStayJSON = function (item) {
    var converted = {
        startTime: _toDate(item.duration.startTimestampMs),
        endTime: _toDate(item.duration.endTimestampMs),
        latitudeE7: item.location.latitudeE7,
        longitudeE7: item.location.longitudeE7,
        name: item.location.name,
        placeId: item.location.placeId,
    };
    return converted;
}

var _toMoveJSON = function (item) {
    var converted = {
        startTime: _toDate(item.duration.startTimestampMs),
        endTime: _toDate(item.duration.endTimestampMs),
        sLatitudeE7: item.startLocation.latitudeE7 || 0,
        sLongitudeE7: item.startLocation.longitudeE7 || 0,
        eLatitudeE7: item.endLocation.latitudeE7 || 0,
        eLongitudeE7: item.endLocation.longitudeE7 || 0,
    };
    return converted;
}

var _toDate = function (time) {
    return "/Date(" + String(time) + ")/";
}

var _toUnixTimeStr = function (dateString) {
    return dateString.match(/[0-9]+/)[0];
}

var _register = function (tableName, data) {
    var table = _getTable(tableName);
    var existingData = table.query().filter("startTime eq " + _toUnixTimeStr(data.startTime)).run();
    if (existingData.d.results.length > 0) {
        var obj = existingData.d.results[0];
        table.merge(obj.__id, data, "*");
    } else {
        table.create(data);
    }
}

var registerReply = function(params) {
    var table = getTable('results');
    params.__id = params.email;
    var obj;
    try {
        obj = getReply(params);
        var newRawData = JSON.parse(params.rawData);
        var oldRawData = JSON.parse(obj.rawData);
        obj = table.merge(obj.__id, params, "*");
        obj = getReply(params);
        obj.point = calculatePoints(newRawData, oldRawData);
    } catch(e) {
        obj = table.create(params);
        obj.point = calculatePoints(JSON.parse(params.rawData), {})
    }
    return obj;
};

var modifyReply = function(params) {
    var table = getTable('results');
    return table.merge(params.email, params, "*");
};

var _getFileList = function(query) {
    return query.attributes ? _addExtension(query) : _getAllFiles(); // Need Read-Properties in ACL
};

var _addExtension = function(query) {
    var attributes = query.attributes.split(',');
    var results = _.map(attributes, function(item){
        return item.trim() + ".json";
    })
    return results;
};

var _getAllFiles = function() {
    var box = _p.localbox();
    var pathBox = box.getPath(); // "https://dixonsiu.appdev.personium.io/app-personium-trails"
    var col = box.col("imported");
    //var results = _.map(col.getFileList(), function(item){
    //    return item.split(pathBox + '/imported/')[1];
    //})
    
    var results = {};
    results.pathBox = pathBox;
    results.folderList = box.getColList();
    results.fileList = col.getFileList();
    return results;
};

var getAttributes = function(fileList) {
    return _.map(fileList, getAttributeByFilename);
};

var getAttributeByFilename = function (filename) {
    var box = _p.localbox();
    var canRead = false;
    var jsonStr = null;
    try {
        jsonStr = box.getString('attributes/'+ filename);
        canRead = true;
    } catch(e) {
        // Necessary privilege is lacking
        jsonStr = e.message;
    }
    
    var result = {
        filename: filename,
        hasPermission: canRead,
        contents: JSON.parse(jsonStr)
    }
    
    return result;
};

var updateAttributes = function(profile){
    return _.map(profile, updateAttributeByFilename);
};

var updateAttributeByFilename = function(contents, key){
    var filename = key + ".json";
    var path = "attributes/" + filename;
    var profile = {
        status: "failed"
    };
    
    if (_.isEmpty(contents)) {
        // Forced it to save as empty hash
        contents = {};
    }
    try {
        _p.localbox().put({
            path: path,
            data: JSON.stringify(contents),
            contentType: "application/json",
            charset: "utf-8",
            etag: "*"
        });

        profile.contents = getAttributeByFilename(filename);
        profile.status = "succeed";
    } catch(e) {
        // Necessary privilege is lacking
        profile.contents = {
            filename: filename,
            hasPermission: false,
            contents: JSON.parse(e.message)
        };
    }
    
    return profile;
};
/*
 * In order to use helpful functions, you need to "require" the library.
 */
var moment = require("moment").moment;
moment = require("moment_timezone_with_data").mtz;
var _ = require("underscore")._;
var personium = require("personium").personium;

/*
 * Variables
 */
