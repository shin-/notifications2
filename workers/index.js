var swig = require('swig');
var https = require('https');
var urlparser = require('url');
var qs = require('querystring');

var services = require('../servicemgr');

var templaters = {
    'mail': function(svc, data) {
        var opts = {locals: data};
        return {
            'recipients': swig.render(svc.action.recipients, opts),
            'subject': swig.render(svc.action.subject, opts),
            'message': swig.render(svc.action.message, opts)
        };
    },
    'http': function(svc, data) {
        var opts = {locals: data};
        return {
            'url': swig.render(svc.action.url, opts),
            'body': swig.render(svc.action.body, opts),
            'method': svc.action.method
        };
    }
};

function dispatch_action(type, data) {
    if (type == 'email') {
        console.log('To: ' + data.recipients);
        console.log('Subject: ' + data.subject);
        console.log(data.message);
    } else if (type == 'http') {
        var opts = urlparser.parse(data.url);
        opts.method = data.method;

        var req = https.request(opts, function(res) {
            res.setEncoding('utf8');
            res.on('data', function(d) { console.log(d); });
        });
        req.write(data.body);
        req.end();
    }
}

function generate_job(event, sub_data, notification_data, svc, user) {
    var data = {
        user: user,
        subscription_data: sub_data,
        event: event,
        notification: notification_data
    }
    data.event_message = swig.render(event.message_template, { locals: data });
    data.template = swig.render(svc.template, { locals: data });

    var action_data = templaters[svc.action.type](svc, data);
    console.log(action_data);
    dispatch_action(svc.action.type, action_data);
}

function dispatch(subs, event, notification_data) {
    // FIXME: use queue / workers system.
    subs.forEach(function(sub) {
        setTimeout(function() {
            var sub_data = JSON.parse(sub.subscription_data);
            generate_job(
                event, sub_data, notification_data,
                services.get(sub.service), sub.getUser()
            );
        }, 0);
    });
}

module.exports = {
    dispatch: dispatch
};
