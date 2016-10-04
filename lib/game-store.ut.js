const chai = require('chai');
chai.use(require('sinon-chai'));
const expect = chai.expect;
const sinon = require('sinon');
const GameStore = require('./game-store');

describe('gameStore', () => {

    let gameStore = null

    beforeEach(() => {
        gameStore = new GameStore()
    })

    it('should add some points', () => {
        gameStore.awardPoints('user', 10)
        expect(gameStore.getPoints('user')).to.equal(10)
    });

    it('should add some more points', () => {
        gameStore.awardPoints('user', 10)
        gameStore.awardPoints('user', 10)
        expect(gameStore.getPoints('user')).to.equal(20)
    })

    it('should have correct log entries', () => {
        gameStore.awardPoints('user', 1)
        gameStore.awardPoints('user1', 2)
        const log = gameStore.getAwardLog()
        expect(log.length).to.equal(2)
        expect(log[0].user).to.equal('user')
        expect(log[0].points).to.equal(1)
        expect(log[1].user).to.equal('user1')
        expect(log[1].points).to.equal(2)
    })

    it('should have a ladder', () => {
        gameStore.awardPoints('user', 1)
        gameStore.awardPoints('user1', 2)
        gameStore.awardPoints('user2', 1)
        const log = gameStore.getLadder()
        expect(log.length).to.equal(3)
        expect(log[0].user).to.equal('user1')
        expect(log[0].position).to.equal(1)
        expect(log[1].user).to.equal('user')
        expect(log[1].position).to.equal(2)
        expect(log[2].user).to.equal('user2')
        expect(log[2].position).to.equal(2)
    })

});
