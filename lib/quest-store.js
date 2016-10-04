const yaml = require('node-yaml');
let cache = null

module.exports = function() {
    if (!cache) {
        cache = yaml.readSync('../quests.yml')
    }
    return cache.quests
}
