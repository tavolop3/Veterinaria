const request = require('supertest');
let server;
const {Genre} = require('../../models/genre');
const mongoose = require('mongoose');

describe('/api/genres', () => {
    beforeEach(() => { server = require('../../index'); });
    afterEach(async() => { 
        await Genre.deleteMany({});
        server.close();
    });

    describe('GET /', () => {
        it('should return all genres', async() => {
            await Genre.collection.insertMany([
                { name: 'genre1' },
                { name: 'genre2'}
            ]);

            const res = await request(server).get('/api/genres');
            
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some(g => g.name == 'genre1')).toBeTruthy();
            expect(res.body.some(g => g.name == 'genre2')).toBeTruthy();
        });
    });

    describe('GET /:id', () => {
        it('should return the genre if valid id is passed', async() => {
            var id = new mongoose.Types.ObjectId();
            await Genre.collection.insertOne({ _id: id, name: 'genre1' });
            
            const res = await request(server).get(`/api/genres/${id}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', 'genre1');
        });
        
        it('should return 404 if invalid id is passed', async() => {
            const res = await request(server).get(`/api/genres/1`);

            expect(res.status).toBe(400);
        });
    });

});