var fs = require('fs');
var pathutils = require('path');

var uuid = require('node-uuid');
var yaml = require('js-yaml');

var models = require('../models');
var settings = require('../settings');
var utils = require('../utils');

var SERVICES_DIR = settings.services_dir;


function importDefinitions(cb) {
    if (!cb) {
        cb = function(err) {
            if (err) { throw err; }
        }
    }
    fs.readdir(SERVICES_DIR, function(err, files) {
        if (err) {
            return cb(err, null);
        }
        var callback = utils.forEachCallback(files.length, cb);
        files.forEach(function(name) {
            var path = pathutils.join(SERVICES_DIR, name);
            fs.readFile(path, function(err, data) {
                if (err) {
                    return callback(err);
                }
                ymlData = null;
                try {
                    ymlData = yaml.safeLoad(data);
                } catch (e) {
                    return callback(e);
                }
                module.exports.services[ymlData.name] = ymlData;
                callback(null, exports.services);
            });
        });

    });
}

validators = {
    'string': function(x) { return typeof x == 'string'; },
    'list:regex': function(x, field_desc) {
        r = RegExp(field_desc.regex);
        if (!Array.isArray(x)) {
            return false;
        }
        return x.reduce(function(prev, val) {
            return prev && r.test(val);
        }, true);
    }
}

function exists(name) {
    return !!this.services[name];
}

function get(name) {
    return this.services[name];
}

function subscribe(user, ev, service_name, sub_data, cb) {
    this.validate(service_name, sub_data);
    sub = models.Subscription.create({
        subscription_data: JSON.stringify(sub_data),
        uuid: uuid(),
        service: service_name
    }).then(function(sub) {
        sub.setUser(user);
        sub.setEvent(ev);
        cb(null, sub.uuid);
    }).catch(function(err) {
        throw err;
    });
}

function validate(service_name, sub_data) {
    var errors = [];
    var sdata_template = this.get(service_name).subscription_data;
    Object.keys(sdata_template).forEach(function(entry) {
        if (!sdata_template[entry].optional && !sub_data[entry]) {
            errors.push('Missing data for "' + entry + '" field');
        }
        var validate = validators[sdata_template[entry].type];
        if (!validate(sub_data[entry], sdata_template[entry])) {
            errors.push('Invalid data for "' + entry + '" field');
        }
    });
    if (errors.length > 0) {
        throw errors;
    }
}

module.exports = {
    importDefinitions: importDefinitions,
    services: {},
};

module.exports.get = get.bind(module.exports);
module.exports.exists = exists.bind(module.exports);
module.exports.validate = validate.bind(module.exports);
module.exports.subscribe = subscribe.bind(module.exports);
