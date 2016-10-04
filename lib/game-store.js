class Award {
    constructor(user, points, grantedBy) {
        this.user = user
        this.points = points
        this.grantedBy = grantedBy
    }
}

class GameStore {
    constructor() {
        this.store = {}
    }

    awardPoints(user, points) {

    }

    getPoints(user) {

    }

    getAwardLog() {
        return [
            { timestamp: null, user: 'user', points: 0, grantedBy: '' }
        ]
    }

    getLadder() {
        return [
            { user: 'user', points: 0 }
        ]
    }
}

module.exports = GameStore
