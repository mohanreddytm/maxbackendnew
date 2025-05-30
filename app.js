const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 5050;

const bcrypt = require('bcrypt');


app.use(cors());
app.use(express.json());

require("dotenv").config();

const {Pool} = require('pg');

const databaseUrl = process.env.DATABASE_URL ;

const pool = new Pool({
  connectionString: databaseUrl ,
});

const clientId = process.env.EBAY_CLIENT_ID;
const clientSecret = process.env.EBAY_CLIENT_SECRET;

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

app.get('/get-ebay-token', async (req, res) => {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const response = await fetch('https://api.sandbox.ebay.com/identity/v1/oauth2/token', {
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

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Token fetch error:', err);
    res.status(500).json({ error: 'Failed to get token' });
  }
});

app.get('/search-ebay-products', async (req, res) => {

  try {
      const accessToken = "v^1.1#i^1#p^1#r^0#I^3#f^0#t^H4sIAAAAAAAA/+VYe2wURRi/V8ECFXnJIxrOLfigub3Z27vbu5W75vqAttCH3B3SJopzu7PttrcPdva4HhU9S4rBAGKixoACiZJIE1GIJMYg0SgNEEUxRBNjGpCg+EhMUCP/EN29HuVaCSB3iU3cfzYz8803v99vvm/m2wXZSeVLNjds/rPCOtm2NwuyNquVmgrKJ5VV3Wm3LSizgAID697soqyj335xKYZSUmVXIawqMkbOXikpYzbXGSJSmswqEIuYlaGEMKtzbDTSvJL1kIBVNUVXOCVJOBvrQkTQixjE+OhAgIGCX6CNXvmqz5gSIjhGQH5A+z20j6dRwhzHOIUaZaxDWQ8RHuDxuYDPRYMYoFk6yFIUGaS9HYRzNdKwqMiGCQmIcA4um5urFWC9MVSIMdJ0wwkRbowsi7ZGGuvqW2JL3QW+wnkdojrUU3hsq1bhkXM1TKbQjZfBOWs2muI4hDHhDo+sMNYpG7kK5jbg56RGFO2BNE9RQYaGXj9TEimXKZoE9RvjMHtE3iXkTFkk66KeuZmihhqJbsTp+VaL4aKxzmm+HknBpCiISAsR9TWR9khbGxFuVrqgETa8S8pIsFeRkStas8bFQAYghg/4XZRAMwzye/ILjXjLyzxupVpF5kVTNOxsUfQaZKBG47XxFGhjGLXKrVpE0E1EhXa+qxp6mA5zU0d2MaV3yea+IskQwplr3nwHRmfruiYmUjoa9TB+ICdRiICqKvLE+MFcLObDpxeHiC5dV1m3O51Ok2maVLROtwcAyr2meWWU60ISJAxbM9dH7MWbT3CJOSocMmZikdUzqoGl14hVA4DcSYS9Xh8ToPK6j4UVHt/7j44Czu6xGVGqDPFAwSsEKQoALxMEnLcUGRLOB6nbxIESMOOSoNaDdDUJOeTijDhLSUgTeZb2CR46ICAX7w8KLm9QEFwJH2/GLkIAoUSCCwb+T4lyq6EeRZyG9JLEesnivDtBP7rM3Z4OatE2Ve6O+zNyi7vZH4yqy4OrupvqVblV6orhDKrCoVvNhuuSr02KhjIxY/1SCGDmeulEaFCwjvii6EU5RUVtSlLkMhNrg2mNb4OanqlJZYx2FCWTxqsoqhFVbSzNiV0ykv/ysLg93qW7qf6jW+q6rLAZuBOLlTkfGw6gKpLGPWTmeobkFMmtQKMIMbvX5lAXxVs06tcJxdogaLLNkCI/UniSObokXs+RGsJKSjNqbrLVrMNiSg+SjVtN15RkEmmri4sAM58lKaXDRBJNtMQuQYCLcIJduRTjDfgYP+0rjheXu1DXTrQjqbij2NFcVHHtHvupH7bkHqrfehL0W4dsViuoAy6qCjw0yR532KcRWNQRiaHMJ5ReUoQCicVO2fiS1RDZgzIqFDXbLMuZn3ZE20+veO/loxvWPUNWD1nKC/447H0MzBv951Bup6YW/IAA91wbKaOmz63w+ICPBoCmjcq9A1ReG3VQdztmT7MMZJuP25sOnrVtiXz9zLoH/9q1H1SMGlmtZRZHv9Wy6Ts489WBhy/MObxx9xtLGgZr9zRNl6+89klldOPG3e+/ngF9xz+IT2k7sWLWafuBD6v2PUs56584PKN+XvCbynX3HttUF8+8/eX2bx2XQ1O/OjUcX7J/vrItu+fjOcPPX+o6dmj29skvsjOkkyuWVyxMvzs0PLj8ssOmh/dtm6n2HIx99vPxB4YHK6urUwteuFhl++PAlQ3nW/vSjuo35z6e+qLhx/uO3KU+deoI1dR3YfvOY0+2r2SEwTOb3mG1+7//iPh9CrP1h98Wckf7f+l9a9v8c+fuWP8rfX7Hrnin7bnA/Pph8tKJE9WvnH3606rJV2JbX+r+fPEstGoovmh4QFlc29FXc/TQwJYebefInv4NX6jVTAsSAAA=";
      

    const productResponse = await fetch('https://api.sandbox.ebay.com/buy/browse/v1/item_summary/search?q=shoes', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const productData = await productResponse.json();
    res.json(productData);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Failed to fetch eBay data' });
  }
});





app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});