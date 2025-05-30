const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const crypto = require('crypto');


const app = express();
const PORT = 5050;

const bcrypt = require('bcrypt');


app.use(cors());
app.use(express.json());

require("dotenv").config();

const {Pool} = require('pg');

const clientId = process.env.EBAY_CLIENT_ID;
const clientSecret = process.env.EBAY_CLIENT_SECRET;


const databaseUrl = process.env.DATABASE_URL ;

const pool = new Pool({
  connectionString: databaseUrl ,
});


app.get('/getUsers', async (req, res) => {
  try{
    const query = 'SELECT * FROM public."Users";';
    const response = await pool.query(query);
    if (response.rows.length === 0) {
      return res.status(404).json({ error: 'No users found' });
    }
    res.status(200).json(response.rows);
  }catch(err){
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/addUser', async (req, res) => {
  const { createdAt, updatedAt, firstname, lastname, password, profileImage, role, isActive, email, emailVerified } = req.body;
  const name = `${firstname} ${lastname}`;
  const username = `${firstname}_${lastname}`;
  const hashedPassword = await bcrypt.hash(password, 10);
  const query = 'INSERT INTO "Users" (created_at, last_login,username, full_name, password_hash, avatar_url, role, is_active, email, email_verified) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *';
  const values = [createdAt, updatedAt, username, name, hashedPassword, profileImage, role, isActive, email, emailVerified];
  try {
    const response = await pool.query(query, values);
    if (response.rows.length > 0) {
      res.status(201).json(response.rows[0]);
    } else {
      res.status(400).json({ error: 'Failed to add user' });
    }
  } catch (err) {
    console.error('Error adding user:', err);
    res.status(500).json({ error: 'Failed to add user' });
  }
});


const verificationToken = "mohanisthegreatestpersonofalltime"; // 32-80 chars, alphanumeric, _ and -

const endpointUrl = "https://maxbackendnew.onrender.com/api/ebay/account-deletion-notification"; // your exact public webhook URL

// GET for challenge verification
app.get('/api/ebay/account-deletion-notification', (req, res) => {
    const challengeCode = req.query.challenge_code;
    if (!challengeCode) {
        return res.status(400).send('Missing challenge_code');
    }

    // Hash challengeCode + verificationToken + endpointUrl
    const hash = crypto.createHash('sha256');
    hash.update(challengeCode);
    hash.update(verificationToken);
    hash.update(endpointUrl);
    const challengeResponse = hash.digest('hex');

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ challengeResponse });
});

// POST for receiving deletion notifications
app.post('/api/ebay/account-deletion-notification', (req, res) => {
    const notification = req.body;

    // TODO: optionally verify signature header here (not shown)
    // Log or process the deletion notification
    console.log("Received deletion notification:", notification);

    // Acknowledge the notification with a 200 OK (or 201, 202, 204)
    res.sendStatus(200);
});


app.get('/search-ebay-products', async (req, res) => {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const tokenResponse = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        scope: 'https://api.ebay.com/oauth/api_scope',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Token request failed with status ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error('Access token not found');
    }

    const productResponse = await fetch('https://api.ebay.com/buy/browse/v1/item_summary/search?q=trending', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!productResponse.ok) {
      throw new Error(`Product search failed with status ${productResponse.status}`);
    }

    const productData = await productResponse.json();
    res.json(productData);

  } catch (err) {
    console.error('eBay API error:', err.message || err);
    res.status(500).json({ error: 'Failed to fetch eBay products' });
  }
});






app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});