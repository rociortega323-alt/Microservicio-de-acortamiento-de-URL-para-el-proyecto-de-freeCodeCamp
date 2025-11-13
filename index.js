require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const urlParser = require('url');
const app = express();

// 🔧 Configuración básica
const port = process.env.PORT || 3000;

// 🧩 Middlewares
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

// 📄 Ruta principal
app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// 🗃️ Base de datos temporal
let urlDatabase = [];
let idCounter = 1;

// 🔗 Endpoint POST /api/shorturl
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;
  const hostname = urlParser.parse(originalUrl).hostname;

  // Validación de formato de URL
  if (!/^https?:\/\/.+\..+/.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  // Verificación DNS
  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    // Crear nuevo short_url
    const shortUrl = idCounter++;
    urlDatabase.push({ original_url: originalUrl, short_url: shortUrl });

    res.json({
      original_url: originalUrl,
      short_url: shortUrl,
    });
  });
});

// 🚀 Endpoint GET /api/shorturl/:short_url
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = parseInt(req.params.short_url);
  const entry = urlDatabase.find((item) => item.short_url === shortUrl);

  if (!entry) {
    return res.json({ error: 'No short URL found for the given input' });
  }

  res.redirect(entry.original_url);
});

// 🧠 Endpoint de prueba (opcional)
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

// 🖥️ Servidor
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

