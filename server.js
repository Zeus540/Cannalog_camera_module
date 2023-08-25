const WiFiControl = require('wifi-control');
const express = require('express');
const bodyParser = require('body-parser');
const __dirname = require('body-__dirname');
const path = require('path');
const app = express();
const port = 80;

const wifiConfigPath = path.join(__dirname, 'wifi_config.json');

app.use(bodyParser.urlencoded({ extended: true }));

// Initialize WiFiControl
WiFiControl.init({
    debug: true
});


// Check if WiFi credentials are saved, and if so, auto-connect on startup
if (fs.existsSync(wifiConfigPath)) {
    const wifiConfig = JSON.parse(fs.readFileSync(wifiConfigPath, 'utf8'));

    WiFiControl.connectToAP(wifiConfig, (error, response) => {
        if (error) {
            console.error('Error connecting to saved WiFi:', error);
        } else {
            console.log('Connected to saved WiFi:', response);
        }
    });
}else{

 // Configure hostapd and dnsmasq
 const hostapdConfig = `
 interface=wlan0
 ssid="Cannalog_camera_v1"
 passphrase=${password}
`;

const dnsmasqConfig = `
 interface=wlan0
 dhcp-range=192.168.4.2,192.168.4.20,255.255.255.0,24h
`;

exec('sudo systemctl stop hostapd', (error) => {
 if (error) {
     console.error('Error stopping hostapd:', error);
     return res.send('WiFi configuration failed.');
 }

 exec(`sudo echo "${hostapdConfig}" > /etc/hostapd/hostapd.conf`, (error) => {
     if (error) {
         console.error('Error writing hostapd config:', error);
         return res.send('WiFi configuration failed.');
     }

     exec(`sudo systemctl start hostapd`, (error) => {
         if (error) {
             console.error('Error starting hostapd:', error);
             return res.send('WiFi configuration failed.');
         }

         exec(`sudo echo "${dnsmasqConfig}" > /etc/dnsmasq.conf`, (error) => {
             if (error) {
                 console.error('Error writing dnsmasq config:', error);
                 return res.send('WiFi configuration failed.');
             }

             exec('sudo systemctl start dnsmasq', (error) => {
                 if (error) {
                     console.error('Error starting dnsmasq:', error);
                     return res.send('WiFi configuration failed.');
                 }

                 res.send('WiFi configured successfully! Access Point started.');
             });
         });
     });
 });
});
}


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

            // Save the WiFi details to a JSON file
            const wifiConfig = {
                ssid: ssid,
                password: password
            };
            fs.writeFileSync(wifiConfigPath, JSON.stringify(wifiConfig));

            res.send('WiFi configured successfully! Credentials saved.');
        }
    });
});

app.listen(port, () => {
    console.log(`Web server running on port ${port}`);
});
