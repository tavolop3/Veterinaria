const mongoose = require('mongoose');
const Joi = require('joi');
const express = require('express');
const router = express.Router();

const Genre = mongoose.model('Genre', new mongoose.Schema({
    name:{
        type: String,
        required: true,
        minlength: 3,
        maxlength: 15
    }
}));

router.get('/', async (req,res) => {
    const genres = await Genre.find().sort('name');
    res.send(genres);
});

router.post('/', async (req,res) => {
    const { error } = validateGenre(req.body.name);  
    if(error) return res.status(400).send(error.details[0].message);

    let genre = new Genre({ name: req.body.name });
    genre = await genre.save();
    res.send(genre);
});

router.put('/:id', async (req,res) => {
    const {error} = validateGenre(req.body.name);
    if(error) return res.status(400).send(error.details[0].message);

    const genre = await Genre.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });
    if(!genre) return res.status(404).send('The genre with the given ID was not found.'); 
    
    res.send(genre);
});

router.delete('/:id', async (req,res) => {
    const genre = await Genre.findByIdAndRemove(req.params.id);
    if(!genre) return res.status(400).send('Element not found.');

    res.send('Deleted succesfully from database.');
});

router.get('/:id', async (req,res) => {
    const genre = await Genre.findById(req.params.id);
    if(!genre) return res.status(400).send('Element not found.');

    res.send(genre);
});

function validateGenre(genre){
    const schema = Joi.string().min(3).max(15).required();
    return schema.validate(genre);
}

module.exports = router;