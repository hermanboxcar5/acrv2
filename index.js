let pages = {}
pages.home = `<h1>ACR.js - by Hermanboxcar5</h1>
      This is an automatic coin redeemer built for RBR. We will encrypt your passwords using a cryptotographically secure algorithm and store them in a database. We will also provide you with a unique code that you can use to delete your account. We are not liable if any of our data leaks exposing users' usernames and passwords, although we will try to keep it as safe as possible.<br>
      To conserve on resources, we only collect per 30 min, starting with the moment you add yourself to the queue. Please be patient if this appears to be delayed for a bit (contact us if its more than an hour)
      <br><br><br>
      Enter new account:
      <form method='post' action='/'>
        <label for='user'>Username:</label><input type='text' name='user' required>
        <br>
        <label for='pass'>Password:</label><input type='text' name='pass' required>
        <br>
        <input type='submit'>
      </form>
      <br><br>
      Enter account key to delete:
      <form method='post' action='/'>
        <label for='key'>Enter key:</label><input type='text' name='key' required>
        <br>
        <input type='submit'>
      </form>`
const crypto = require('crypto');
const axios = require('axios');
let timeouts = {}
// Encrypt function
function encrypt(data) {
  const key = Buffer.from(process.env['key'], 'hex'); // Assuming the key is stored in hexadecimal format in the environment variable

  const cipher = crypto.createCipheriv('aes-256-cbc', key, Buffer.alloc(16)); // Use 'aes-256-cbc' or another appropriate algorithm

  let encrypted = cipher.update(data, 'utf-8', 'hex');
  encrypted += cipher.final('hex');

  return encrypted;
}

// Decrypt function
function decrypt(encryptedData) {
  const key = Buffer.from(process.env['key'], 'hex'); // Assuming the key is stored in hexadecimal format in the environment variable

  const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.alloc(16)); // Use 'aes-256-cbc' or another appropriate algorithm

  let decrypted = decipher.update(encryptedData, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');

  return decrypted;
}






const jsonBinUrl = 'https://api.jsonbin.io/v3/b/659ed6b0266cfc3fde75527a';
const secretKey = process.env['jsonbin']; // Optional, only if you want to update or delete
async function get() {
  const response = await axios.get(`${jsonBinUrl}/latest`, {headers: { 'X-Master-Key':process.env['jsonbin']}});
  return response.data;
}

async function set(data) {
  if(typeof data=='object'){
    data=JSON.stringify(data)
  }
  const response = await axios.put(`${jsonBinUrl}`, data, {
    headers: { 'X-Master-Key': secretKey, 'Content-Type':'application/json' },
  });
  return response.data;
}

function randkey(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}


















const express = require('express');
async function main(){
  let users = {}
  let keys = {}
  let data = await get()
  if(data.record){
    users = data.record.users
    keys = data.record.keys
  }
  Array.from(Object.keys(users)).map(a=>{
    autoClaim(a, users[a])
  })











  
  let lastpinged=new Date()
  const bodyParser = require('body-parser')
  const app = express();
  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }))

  // parse application/json
  app.use(bodyParser.json())
  
  app.get('/', (req, res)=>{
    res.send(`
      ${pages.home}
    `)
  })
  app.post('/', async (req, res)=>{
    if(req.body.key){
      if(keys[req.body.key]){
        delete users[keys[req.body.key]]
        delete keys[req.body.key]
        await set({users:users, keys:keys})
        delete timeouts[keys[req.body.key]]
        req.send(pages.home+`<script>window.alert('Account deleted.')</script>`)
      } else {
        req.send(pages.home+`<script>window.alert('Account not found')</script>`)
      }
    } else {
      users[req.body.user]=encrypt(req.body.pass)
      let newkey = randkey()
      keys[newkey]=req.body.user
      await set({users:users, keys:keys})
      autoClaim(req.body.user, req.body.pass)
      req.send(pages.home+`<script>window.alert('Account added to queue')</script>`)
    }
  })










  const authenticate = async (username, password) => {
      try {
          const response = await axios.post(
              "https://dev-nakama.winterpixel.io/v2/account/authenticate/email?create=false",
              {
                  email: username,
                  password: password,
                  vars: {
                      client_version: "99999"
                  }
              },
              {
                  headers: {
                      authorization: "Basic OTAyaXViZGFmOWgyZTlocXBldzBmYjlhZWIzOTo="
                  }
              }
          );

          const token = response.data.token;
          return token;
      } catch (error) {
          console.error("Authentication failed:", error.message);
          throw error;
      }
  };

  const collectTimedBonus = async (token) => {
      try {
          const payload = '"{}"';
          const response = await axios.post(
              "https://dev-nakama.winterpixel.io/v2/rpc/collect_timed_bonus",
              payload,
              {
                  headers: {
                      authorization: `Bearer ${token}`
                  }
              }
          );

          console.log(response.data);
      } catch (error) {
          console.error("Failed to collect timed bonus:", error.message);
      }
  };

  const autoClaim = async (username, password) => {
      while (true) {
          try {
              const token = await authenticate(username, password);
              await collectTimedBonus(token);
              await new Promise(resolve => timeouts[username]=setTimeout(resolve, 1801000)); // Sleep for 1801 seconds
          } catch (error) {
              console.error("Auto claim failed:", error.message);
          }
      }
  };
  
  








  
  app.listen(3000, ()=>{console.log( `server up`)})
}
main()
