const request = require('supertest');
const {User} = require('../../models/user');

const app = require('../../index');

describe('auth middleware', () => {
    beforeEach(() => { server = require('../../index'); });
    afterEach(async() => { server.close(); });
    
    let token;

    const exec = () => {
        return request(app)
            .post('/api/genres')
            .set('x-auth-token', token)
            .send({ name: 'genre1' });
    }

    beforeEach(() => {
        token = new User().generateAuthToken();
    });

    it('should return 401 if no token provided', async() => {
        token = '';

        const res = await exec();

        expect(res.status).toBe(401);
    });
});