module.exports = {
    db_url: process.env.DB_URL || 'sqlite:///notifications.db',
    debug: true,
    services_dir: process.env.SERVICES_DIR || './data/services'
}