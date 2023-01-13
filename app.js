
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const express = require("express")
const socketIO = require("socket.io")
const qrcode = require("qrcode")
const http = require("http")
const fileUpload = require('express-fileupload')
const cors=require('cors')

const fs = require("fs");
const { response } = require("express");
const app = express()
const server = http.createServer(app)
const io = socketIO(server)

app.use(cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(fileUpload({
    debug: true
}))

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname })
})
// const SESSION_FILE_PATH = 'session.json'
let sessionCfg

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "client-one-sos"
    }),
    puppeteer: {
        headless: true,
    }
});


client.on('message', message => {
    if (message.body === '!ping') {
        message.reply('pong');
    }
});

client.initialize();

//socket IO
io.on('connection', function (socket) {
    socket.emit('message', 'comnecting...')
    client.on('qr', (qr) => {
        console.log('QR RECEIVED', qr);
        qrcode.toDataURL(qr, (err, url) => {
            socket.emit('qr', url)
            socket.emit('message', 'QR diterima silahkan scan')
        })
    });
    client.on('ready', () => {
        console.log('Client is ready!');
        socket.emit('ready', 'Client is ready')
        socket.emit('message', 'Client is ready')
    });

    client.on('authenticated', () => {
        socket.emit('authenticated', 'Client is ready')
        socket.emit('message', 'Client is ready')

        console.log('AUTHENTICATED OK deh');
    });

})

//send message

app.post('/send-message', (req, res) => {
    const number = req.body.number;
    const message = req.body.message;


    client.sendMessage(number, message).then(response => {
        res.status(200).json({
            status: true,
            response: response
        })
    }).catch(err => {
        res.status(500).json({
            status: false,
            response: err
        })

    })

})

app.post('/send-media', (req, res) => {

    const number = req.body.number;
    const caption = req.body.caption;
    const media = MessageMedia.fromFilePath('./gambar.png')

    // const file = req.files.file

    // con st media = new MessageMedia(file.mimetype, file.data.toString('base64'), file.name)
    // console.log(file)

    // return
    client.sendMessage(number, media, { caption: caption }).then(response => {
        res.status(200).json({
            status: true,
            response: response
        })
    }).catch(err => {
        res.status(500).json({
            status: false,
            response: err
        })

    })

})
app.post('/send-media-url', async (req, res) => {

    const number = req.body.number;
    const caption = req.body.caption;
    const media = await MessageMedia.fromUrl('https://rumahquranblora.org/wp-content/uploads/2022/02/cropped-cropped-Logo-RQAB.png')

    // const file = req.files.file

    // con st media = new MessageMedia(file.mimetype, file.data.toString('base64'), file.name)
    console.log(media)

    // return
    client.sendMessage(number, media, { caption: caption }).then(response => {
        res.status(200).json({
            status: true,
            response: response
        })
    }).catch(err => {
        res.status(500).json({
            status: false,
            response: err
        })

    })

})
app.post('/send-media-upload', (req, res) => {
    const number = req.body.number;
    const caption = req.body.caption;

    const file = req.files.file

    const media = new MessageMedia(file.mimetype, file.data.toString('base64'), file.name)

    // return
    client.sendMessage(number, media, { caption: caption }).then(response => {
        res.status(200).json({
            status: true,
            response: response
        })
    }).catch(err => {
        res.status(500).json({
            status: false,
            response: err
        })

    })

})
server.listen(8000, function () {
    console.log("APpr running in 8000")
})