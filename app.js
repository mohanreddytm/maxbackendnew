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

app.get('/search-ebay-products', async (req, res) => {

  try {
      const accessToken = "v^1.1#i^1#f^0#p^1#r^0#I^3#t^H4sIAAAAAAAA/+VYe2wURRi/6wtLKSTIK4U/jgVRqLu3e3d7j4W7cqWFHtAH3FFpQ23mdufabffFzpztIcTSEELBB8YoRgmpGB+Bpv5h8JEoahqJr0AUFTUm4isQE4iJgiaa6Oy2lGslgPQSm3jJZTMz33zz+/3m+2a+XbanqHjZ7prdv5U6p+T197A9eU4nV8IWFxWWT8/PKyt0sFkGzv6exT0FvfnnVyCgKoawESJD1xB0dauKhgS7M0ylTU3QAZKRoAEVIgGLQjxau17wMKxgmDrWRV2hXLGqMBXkfX7WF0ql+GAwCJKA9GpXfCb0MOX1e0I+jpP8fMgbAjwZRigNYxrCQMNhysN6eJrlaQ+fYHnBwwpenglwgWbK1QhNJOsaMWFYKmKjFey5ZhbU6yMFCEETEydUJBZdHa+Pxqqq6xIr3Fm+IiMyxDHAaTS2tUqXoKsRKGl4/WWQbS3E06IIEaLckeEVxjoVolfA3AJ8W2kOSlJA8npDnIcN8cncSLlaN1WAr4/D6pElOmWbClDDMs7cSFGiRrIDinikVUdcxKpc1mNDGihySoZmmKqujDZFGxqoSK3eDkjUSLSaUUG3rkE6XrmZDoAACwNS0E9zKW8gAP2ekYWGvY3IPG6lVbomyZZoyFWn40pIUMPx2nBZ2hCjeq3ejKawhSjbLjCqoafZ2tThXUzjds3aV6gSIVx288Y7MDobY1NOpjEc9TB+wJYoTAHDkCVq/KAdiyPh043CVDvGhuB2d3V1MV1eRjfb3B6W5dyba9fHxXaoklwktlau2/byjSfQsk1FhGQmkgWcMQiWbhKrBIDWRkV8Pj4Q5EZ0HwsrMr73Hx1ZnN1jMyJXGQIASAalACeKftHjE0EuMiQyEqRuCwdMggytArMTYkMBIqRFEmdpFZqyRHylPN5gCtKSP5SirRORTvKSFbsQshAmk2Io+H9KlJsN9TgUTYhzE+u5ivOOpPee1e6mrpAZbzC0jk3+jFbnrvWH4saa0MaOtdWGVq+2J1AGlqPwzWbDNcmvUmSiTIKsnxMBrFzPmQg1OsJQmhC9uKgbsEFXZDEzuTbYa0oNwMSZynSGtONQUchjQlSjhhHL0YmdK5L/8rC4Nd45vKn+m1vqmqyQFbiTi5U1HxEHwJAZ6x6ycp0RddWtA1KEWN2tNuoJ8ZZJ/TqpWBOCNltGloYLT8amy6D7RMaESE+bpOZm6q06LKF3Qo3catjUFQWajROLACufVTWNQVKBky2xcxDgMphkVy4X8AU5nvV5+QnxEu0LtXWyHUkTPIoL1k+kuHaPfdOPOOwf1+v8gO11nshzOtkqlubK2aVF+ZsK8qdRSMaQQUCTkno3I4MUg+Q2jbzJmpDphBkDyGbe7Y5Pf9ofb/p43WtPHN+2dSdTccJRnPXBob+FnTf6yaE4nyvJ+v7ALrg6UsjNmFvq4Vne/rNevplddHW0gJtTMGvf0r6d8mdTV7xanQqsnXcwNaO9dDlbOmrkdBY6CnqdjsotlemvuraezZOe7dt+sXLaPHpPjfTD6Z8F9OtL1S9fXhdRmkoynz/95Tvbj9SUDczYUfvh6aFdf24baJiZqGl/pMG3ZMG+N1R8atvFB84//txdQyf3zK44u1N5aDbXO23qnMYnT5fufvTAt2XSIdT6Qtv8LU+1rrs7PP/ywL5lxx21jftbUv1fNy/v/P7tRW92DbV8MnDsI+H5uWfUc3/9eFD1bV5z4veKsnsHv+BbT1VwK5MLHQc2LBl8a0rgkuDdoX737mPn3nvGf/6VkqOHhk4eRpHWXQ9eaP3lwh7zjurB2OIjd5bv7Zu1uOk216D6uvBHy5lvjKJL7x9/ceY5/tRSbvpCfPThvsP3H9u7cnhP/wazIt/sChIAAA==";
      

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