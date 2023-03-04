const request = require('supertest');
const moment = require('moment');
const mongoose = require('mongoose');
const { Rental } = require('../../models/rental');
const { User } = require('../../models/user');
const { Movie } = require('../../models/movie');


describe('/api/returns', () => {
    let server;
    let customerId;
    let movieId;
    let rental;
    let token;
    let movie;

    beforeEach(async() => {
        token = new User().generateAuthToken();
        server = require('../../index');
        customerId = mongoose.Types.ObjectId(); 
        movieId = mongoose.Types.ObjectId(); 

        movie = new Movie({
            _id: movieId,
            title: '12345',
            dailyRentalRate: 2,
            genre: { name: '12345' },
            numberInStock:10
        });
        await movie.save();

        rental = new Rental({
            customer: {
                _id: customerId,
                name: 'Tavo',
                phone: 12345
            },
            movie: {
                _id: movieId,
                title: '123',
                dailyRentalRate: 2                
            }
        });
        await rental.save();
    });

    afterEach(async() => { 
        await Rental.deleteMany({});
        await Movie.deleteMany({});
        await server.close();
    });

    const exec = () => {
        return request(server)
            .post('/api/returns')
            .set('x-auth-token', token)
            .send({customerId, movieId});
    }

    it('should return 401 if client is not logged in', async() =>{
        token = '';

        res =  await exec();
                
        expect(res.status).toBe(401);
    });

    it('should return 400 if customer id is not provided', async() =>{
        customerId = '';

        res =  await exec();
                
        expect(res.status).toBe(400);
    });

    it('should return 400 if movie id is not provided', async() =>{
        movieId = '';
        
        res =  await exec();
                
        expect(res.status).toBe(400);
    });

    it('should return 404 if no rental found with customer and movie id', async() => {
        customerId = mongoose.Types.ObjectId();
        movieId = mongoose.Types.ObjectId();

        res = await exec();

        expect(res.status).toBe(404);
    });

    it('should return 400 if rental already processed', async() => {
        rental.dateReturned = new Date();
        await rental.save();
 
        res = await exec();

        expect(res.status).toBe(400);
    });

    it('should return 200 if valid request', async() => {
        res = await exec();

        expect(res.status).toBe(200);
    });

    it('should have return date if valid request', async() => {
        await exec();
        
        const modRental = await Rental.findById(rental._id);

        const diff = new Date - modRental.dateReturned;
        expect(diff).toBeLessThan(10 * 1000);
    });

    it('should set rentalFee if valid request', async() => {
        rental.dateOut = moment().add(-7, 'days').toDate();
        await rental.save();

        await exec();

        const modRental = await Rental.findById(rental._id);
        const fee = rental.dateOut.getDay() * rental.movie.dailyRentalRate;

        expect(modRental.rentalFee).toBe(14);
    });

    it('should increase the movie stock if valid request', async() => {
        await exec();

        const movieInDb = await Movie.findById(movieId);

        expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
    });

    it('should return the rental if all valid', async() => {
        res = await exec();
        
        expect(Object.keys(res.body)).toEqual(
            expect.arrayContaining(['dateOut','dateReturned','rentalFee','customer','movie']));
    });
});