const chai = require('chai');
chai.use(require('sinon-chai'));
const expect = chai.expect;
const sinon = require('sinon');
const GameStore = require('./game-store');

describe('gameStore', () => {

    let gameStore = new GameStore();

    it('should add some points', () => {
        gameStore.awardPoints('user', 10)
        expect(gameStore.getPoints('user')).to.equal(10)
    });

});
