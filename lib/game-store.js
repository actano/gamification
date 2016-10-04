class Award {
    constructor(user, points, grantedBy) {
        this.user = user
        this.points = points
        this.grantedBy = grantedBy
    }
}

class GameStore {
    constructor() {
        this.store = {
            log: [],
            userAwards: {}
        }
    }

    awardPoints(user, points, grantedBy) {
        const award = new Award(user, points, grantedBy)
        this.store.log.push(award)
        let awards = this.store.userAwards[user]
        if (!awards) {
            awards = []
            this.store.userAwards[user] = awards
        }
        awards.push(award)
    }

    getPoints(user) {
        const awards = this.store.userAwards[user]
        if (!awards) {
            return 0
        }
        let points = 0
        for (const award of awards) {
            points += award.points
        }
        return points
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
