const socket = require('socket.io');
const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const app = express();
const bodyParser = require('body-parser');

const LocalStorage = require('node-localstorage').LocalStorage;
const localStorage = new LocalStorage('./localStorage');

//middleware required 
const JWTCheck = require('./middleware/JWTCheck');

dotenv.config();
const env = process.env;

const PORT = env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

//cors *
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

app.use(express.static('public'));
app.use(bodyParser.json({ limit: '50mb' }));

app.get('/', (req, res) => {
    res.redirect('/chat');
});

app.get('/chat', JWTCheck, (req, res) => {
    res.sendFile(__dirname + '/public/pages/chat/index.html');
});

app.get('/auth', (req, res) => {
    res.sendFile(__dirname + '/public/pages/auth/index.html');
});

app.post('/api/auth', (req, res) => {

    const { email, password } = req.body;

    console.log('email', email);

    let config = {
        method: 'POST',
        maxBodyLength: Infinity,
        url: `${env.APP_API}/v1/login`,
        headers: {
            'Content-Type': 'application/json'
        },
        data : JSON.stringify({
            "email": email,
            "password": password
        })
    };
    axios(config)
    .then(function (response) {

        console.log(JSON.stringify(response));

        //locastorage user?.device
        localStorage.setItem('device', JSON.stringify(response.data?.user.devices));
        localStorage.setItem('user', JSON.stringify(response.data?.user));

        res.cookie('token', response?.data?.authorization?.token, { maxAge: response?.data?.authorization?.expires_in * 1000, httpOnly: true });
        res.send(response.data);
    })
    .catch(function (error) {
        console.log(error);

        res.send(JSON.stringify({
            "error": true,
            "message": error?.response?.data?.message
        }), 401);

    });

});