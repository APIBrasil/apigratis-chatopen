const socket = require('socket.io');
const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const app = express();
const bodyParser = require('body-parser');

//middleware required 
const JWTCheck = require('./middleware/JWTCheck');

dotenv.config();
const env = process.env;

const PORT = env.PORT || 3000;
const JWT_SECRET = env.JWT_SECRET || '';
const JWT_ALGORITHMS = ['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512'];

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const io = socket(server);

app.use(express.static('public'));
app.use(bodyParser.json({ limit: '50mb' }));

io.use((socket, next) => {
    if (socket.handshake.query && socket.handshake.query.bearer) {
        
        const JWT_TOKEN = socket.handshake.query.bearer;

        if (!JWT_SECRET) {
            console.error('Erro de configuração: JWT_SECRET não fornecido');
            return next(new Error('Erro de configuração'));
        }

        jwt.verify(JWT_TOKEN, JWT_SECRET, { algorithms: JWT_ALGORITHMS }, (err, decoded) => {
            
            if (err) {
                console.error('Erro de autenticação: token de autenticação inválido');
                return next(new Error('Token de autenticação inválido'));
            }

            // console.log('Decoded:', decoded);
            socket.decoded = decoded;
            next();

        });

    } else {
        console.error('Erro de autenticação: token de autenticação não fornecido');
        next(new Error('Token de autenticação não fornecido'));
    }
});

io.on('connection', (socket) => {

    let defaultChannel = socket.handshake?.query?.channelName;

    socket.join(defaultChannel);
    socket.emit('chat', 'Bem-vindo ao chat');
    // socket.broadcast.emit('chat', 'Um novo usuário entrou no chat');
    console.log('canal-sessao', defaultChannel);

    // Inscreve o socket em um canal
    socket.on('subscribe', function(channel) {
        socket.leave(defaultChannel);
        socket.join(channel);
        console.log(`Usuário ${socket.id} inscrito em: ${channel}`);
    });

    socket.on('chat-received', (message) => {
        console.log('Mensagem recebida:', message);
        socket.emit('chat-received', message);
    });

    socket.on('chat-send', (message) => {
        //socket.broadcast.emit('message', message);
        console.log('Mensagem enviada:', message);
        
        socket.emit('chat-send', message);

        let data = JSON.stringify({
            "number": defaultChannel,
            "text": `${message}`,
        });

        let config = {
            method: 'POST',
            maxBodyLength: Infinity,
            url: `${env.APP_API}/v1/whatsapp/sendText`,
            headers: { 
                "Content-Type": "application/json", 
                "SecretKey": env.SecretKey,
                "PublicToken": env.PublicToken, 
                "DeviceToken": env.DeviceToken,
                "Authorization": `Bearer ${env.Authorization}`
            },
            data : data
        };

        axios(config)
        .then(function (response) {
            console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {
            console.log(error);
        });


    });

    socket.on('typing', (data) => {
        console.log('Usuário digitando:', data);
        socket.broadcast.emit('typing', data);
    });
    
    socket.on('disconnect', () => {
        socket.broadcast.emit('chat', 'Um usuário saiu do chat');
    });

});

io.on('error', (err) => {
    console.error('Erro no socket:', err);
});

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

app.get('/api/profile/:number', JWTCheck, (req, res) => {

    console.log('number', req.params.number);

    let config = {
        method: 'POST',
        maxBodyLength: Infinity,
        url: `${env.APP_API}/v1/whatsapp/getHostDevice`,
        headers:  { 
            "Content-Type": "application/json", 
            "SecretKey": env.SecretKey,
            "PublicToken": env.PublicToken, 
            "DeviceToken": env.DeviceToken,
            "Authorization": `Bearer ${env.Authorization}`
        },
        data : JSON.stringify({
            "number": req.params.number,
        })
    };

    console.log('number', req.params.number);

    axios(config)
    .then(function (response) {
        
        console.log(JSON.stringify(response.data));

        res.send(response.data);

    })
    .catch(function (error) {

        console.log(error?.response?.data?.message);


        res.send(error);
    });

});

app.get('/api/chat/:defaultChannel', JWTCheck, (req, res) => {

    let config = {
        method: 'POST',
        maxBodyLength: Infinity,
        url: `${env.APP_API}/v1/whatsapp/getMessagesChat`,
        headers:  { 
            "Content-Type": "application/json", 
            "SecretKey": env.SecretKey,
            "PublicToken": env.PublicToken, 
            "DeviceToken": env.DeviceToken,
            "Authorization": `Bearer ${env.Authorization}`
        },
        data : JSON.stringify({
            "number": req.params.defaultChannel,
            "count": 100
        })
    };

    axios(config)
    .then(function (response) {
        res.send(response.data);
    })
    .catch(function (error) {
        res.send(error);
    });

});

app.get('/api/chats/:defaultChannel', JWTCheck, (req, res) => {

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${env.APP_API}/v1/whatsapp/getAllChats`,
        headers:  { 
            "Content-Type": "application/json", 
            "SecretKey": env.SecretKey,
            "PublicToken": env.PublicToken, 
            "DeviceToken": env.DeviceToken,
            "Authorization": `Bearer ${env.Authorization}`
        }
    };

    axios(config)
    .then(function (response) {
        res.send(response.data);
    })
    .catch(function (error) {
        res.send(error);
    });

});

app.post('/api/webhook/:defaultChannel', (req, res) => {
    
    let defaultChannel = req.params.defaultChannel;
    const body = req.body;

    content = body?.data?.body;

    console.log('defaultChannel:', defaultChannel);

    if(body?.data?.isGroupMsg == false){
        io.to(defaultChannel).emit('chat-received', body);
    }
    
    res.send('ok');

})
