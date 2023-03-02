const request = require('supertest');
const {Genre} = require('../../models/genre');
const {User} = require('../../models/user');
const mongoose = require('mongoose');

let server;

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

            expect(res.status).toBe(404);
        });

        it('should return 404 if no genre with the given id exists', async() => {
            const id = new mongoose.Types.ObjectId();
            const res = await request(server).get(`/api/genres/`+ id);

            expect(res.status).toBe(400);
        });
    });

    describe('POST /', () => {
        let token;
        let name; 
        
        const exec = () => {
            return request(server)
                .post('/api/genres')
                .set('x-auth-token', token)
                .send({ name });
        }

        beforeEach(() => {
            token = new User().generateAuthToken()
            name = 'genre1';
        })

        it('should return 401 if client is not logged in', async() => {
            token = '';

            const res = await exec();
                
            expect(res.status).toBe(401);
        });

        it('should return 400 if genre is less than 3 characters', async() => {
            name = '12';

            const res = await exec();
            
            expect(res.status).toBe(400);
        });

        it('should return 400 if genre is greater than 15 characters', async() => {
            name = new Array(17).join('a');

            const res = await exec();
            
            expect(res.status).toBe(400);
        });

        it('should save the genre if it is valid', async() => {
            await exec();
            
            const genre = await Genre.find({ name: 'genre1' });

            expect(genre).not.toBeNull();
        });

        it('should have the genre if valid', async() => {
            const res = await exec();

            expect(res.body).toHaveProperty('name', 'genre1');
        });
    });

    describe('PUT /:id', () => {
        let token;
        let newName; 
        let id;

        const exec = async() => {
            return await request(server)
                .put('/api/genres/' + id)
                .set('x-auth-token', token)
                .send({ name: newName });
        }

        beforeEach(async() => {
            token = new User().generateAuthToken()
            newName = 'updated';

            genre = new Genre({ name: 'genre1' });
            await genre.save();     
            id = genre._id; 
        })

        it('should return 404 if name is less than 3 characters', async() => {
            newName = '1'; 

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 404 if name is greater than 15 characters', async() => {
            newName = new Array(17).join('a'); 

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 404 if name is not a string', async() => {
            newName = 1; 

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 404 if id is not valid', async() => { 
            id = 1;

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 404 if id is not found', async() => { 
            id = mongoose.Types.ObjectId();

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 401 if user is not logged in', async() => { 
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return the modified genre if valid', async() => { 
            const res = await exec();

            expect(res.body).toMatchObject({ _id: id.toHexString(), name: newName});
        });
    });

    describe('DELETE /:id', () => {
        let id;
        
        const exec = async() => {
            return await request(server)
                .delete('/api/genres/' + id)
                .set('x-auth-token', token);
        }

        beforeEach(async() => {
            token = new User({ isAdmin: true }).generateAuthToken();

            genre = new Genre({ name: 'genre1' });
            await genre.save();     
            id = genre._id; 
        })

        it('should return 401 if user is not logged in', async() => {
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 403 if not admin', async() => {
            token = new User({ isAdmin: false }).generateAuthToken();

            const res = await exec();

            expect(res.status).toBe(403);
        });

        it('should delete the genre given a valid id', async() => {
            const res = await exec();

            expect(res.body).toMatchObject({ _id: id.toHexString(), name: 'genre1'});
        });

        it('should return 400 if id is not found', async() => {
            id = mongoose.Types.ObjectId();

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 404 if id is not valid', async() => {
            id = 1;

            const res = await exec();

            expect(res.status).toBe(404);
        });


    });
});