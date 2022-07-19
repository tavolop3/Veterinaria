const Joi = require('joi');
const express = require('express');
const app = express();

let genres = [
    {id:0, name:'comedy'},
    {id:1, name:'horror'},
    {id:2, name:'indie'}
];

app.use(express.json());

app.get('/api/genres', (req,res) => {
    res.send(genres);
});

app.post('/api/genres', (req,res) => {
    const { error } = validateGenre(req.body.name);  
    if(error) return res.status(400).send(error.details[0].message);
    genres.push({id:genres.length +1, name: req.body.name});
    res.send('Element succesfully added.');
});

app.put('/api/genres/:id', (req,res) => {
    const genre = genres.find(g => g.id == req.params.id);
    if(!genre) return res.status(400).send('Element not found.');
    
    const {error} = validateGenre(req.body.name);
    if(error) return res.status(400).send(error.details[0].message);
    
    genre.name = req.body.name;
    res.send(genre);
});

app.delete('/api/genres/:id', (req,res) => {
    const genre = genres.find(g => g.id == req.params.id);
    if(!genre) return res.status(400).send('Element not found.');

    const index = genres.indexOf(genre);
    const deleted = genres.splice(index,1);
    
    res.send(deleted);
});

app.get('/api/genres/:id', (req,res) => {
    const genre = genres.find(g => g.id == req.params.id);
    if(!genre) return res.status(400).send('Element not found.');

    res.send(genre);
});

function validateGenre(genre){
    const schema = Joi.string().min(3).max(15).required();
    return schema.validate(genre);
}

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});