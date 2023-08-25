const AccessPoint = require('node-ap');
const WiFiControl = require('wifi-control');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

// Initialize WiFiControl
WiFiControl.init({
    debug: true
});

// Create an instance of the AccessPoint class
const ap = new AccessPoint({
    ssid: 'YourAPSSID',
    password: 'YourAPPassword',
    channel: 6
});

// Start the access point
ap.start().then(() => {
    console.log('Access Point started');
}).catch((error) => {
    console.error('Error starting Access Point:', error);
});

app.get('/', (req, res) => {
    res.send(`
        <form action="/configure" method="post">
            WiFi SSID: <input type="text" name="ssid"><br>
            WiFi Password: <input type="password" name="password"><br>
            <input type="submit" value="Configure WiFi">
        </form>
    `);
});

app.post('/configure', (req, res) => {
    const { ssid, password } = req.body;

    // Switch to client mode and connect to the provided WiFi
    WiFiControl.connectToAP({
        ssid: ssid,
        password: password
    }, (error, response) => {
        if (error) {
            console.error('Error configuring WiFi:', error);
            res.send('WiFi configuration failed.');
        } else {
            console.log('Connected to WiFi:', response);
            res.send('WiFi configured successfully!');
        }
    });
});

app.listen(port, () => {
    console.log(`Web server running on port ${port}`);
});
