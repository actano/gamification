class Award {
    constructor(user, points, grantedBy) {
        this.user = user
        this.points = points
        this.grantedBy = grantedBy
    }
}

class LadderResult {
    constructor(user) {
        this.user = user
        this.points = 0
        this.position = 1
    }

    compareTo(other) {
        if (this.points > other.points) return -1
        if (this.points < other.points) return 1
        if (this.user < other.user) return -1
        if (this.user > other.user) return 1
        return 0
    }
}

class GameStore {
    constructor() {
        this.store = {
            log: [],
            userAwards: {}
        }
    }

    awardPoints(user, points, grantedBy = 'anonymous') {
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
        return this.store.log
    }

    getLadder() {
        const ladder = []
        for (const user of Object.keys(this.store.userAwards)) {
            const result = new LadderResult(user)
            for (const award of this.store.userAwards[user]) {
                result.points += award.points
            }
            ladder.push(result)
        }
        ladder.sort((a, b) => a.compareTo(b))

        let position = 0
        let last = null
        for (const result of ladder) {
            position++
            if (last != null && last.points == result.points) {
                result.position = last.position
            } else {
                result.position = position
            }
            last = result
        }
        return ladder
    }
}

module.exports = GameStore
