var Sql = require('sequelize');
var uuid = require('node-uuid');

var settings = require('../settings');

var s = new Sql(settings.db_url);

var Event = s.define('Event', {
    name: {
        type: Sql.STRING,
        unique: true,
        allowNull: false
    },
    display_name: {
        type: Sql.STRING,
        allowNull: false
    },
    message_template: {
        type: Sql.TEXT,
        allowNull: false,
        defaultValue: ''
    },
    tagline: {
        type: Sql.STRING(1024),
        allowNull: false,
        defaultValue: ''
    }
});

var Subscription = s.define('Subscription', {
    subscription_data: {
        type: Sql.TEXT,
        isJson: function(value) {
            JSON.parse(value);
        }
    },
    uuid: {
        type: Sql.UUID,
        primaryKey: true
    },
    service: {
        type: Sql.STRING,
        allowNull: false
    }
});

var User = s.define('User', {
    uuid: {
        type: Sql.UUID,
        primaryKey: true
    },
    name: {
        type: Sql.STRING,
        unique: true
    }
});

Subscription.belongsTo(Event);
Subscription.belongsTo(User);

// Synchronize models
s.sync().then(function() {
    Event.create({
        name: 'user:new_repo',
        display_name: 'New user repository',
        message_template: 'User {{subscription_data.username}} created ' +
            'repository {{notification.repo_name}}',
        tagline: 'New repo by {{subscription_data.username}}'
    });
    Event.create({
        name: 'repo:push',
        display_name: 'Repository push',
        message_template: 'User {{notification.username}} pushed to ' +
            '{{subscription_data.repository}}',
        tagline: 'Pushed to {{subscription_data.repository}}'
    });
    User.create({
        name: 'joffrey',
        uuid: 'fb8dc1b7-3705-48ba-8cbf-1d7477b71816'
    });
});


module.exports = {
    Event: Event,
    Subscription: Subscription,
    User: User,
    sql: s
}