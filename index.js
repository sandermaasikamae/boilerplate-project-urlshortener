require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('node:dns');

// Basic Configuration
const port = process.env.PORT || 3000;

//In a real scenario a DB should be used but for this example a simple array will suffice
let urls = [];

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use('/api/shorturl', bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function(req,res){
  let url;
  try {
    url = new URL(req.body.url);  //interestingly 'ftp:/john-doe.invalidTLD' is automagically corrected to 'ftp://john-doe.invalidtld/' which causes freeCodeCamp tests to fail unless we change the error description down below. I think new URL() should still be preferrable to writing regex, since the project doesn't have any specification for what URLs are or aren't allowed and identifying the incorrect separator with regex isn't worth the complexity the regex needs to have to capture all sorts of URLs.
  }
  catch (err) {
    res.json({ error: 'invalid url' });
  }
  dns.lookup(url.hostname, function(err){
    if (err) {
      res.json({ error: 'invalid url' }); //Is actually 'invalid Hostname' but needs to return 'invalid url' to pass the test because the previously corrected url and gets captured here because the address itself doesn't exist.
    }
    else{
      let urlObject = {
        original_url: url.href,
        short_url: urls.length+1
      }
      urls.push(urlObject);
      res.json(urlObject);
    }
  })
});

app.get('/api/shorturl/:id', function(req,res){
  let short_url = parseInt(req.params.id);
  if (short_url < 0 || short_url > urls.length){
    res.json({"error": "No short URL found for the given input"});
  }
  else {
    res.redirect(urls.find(url => url.short_url === short_url).original_url);
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
