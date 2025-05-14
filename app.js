const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 5050;

app.use(cors());
app.use(express.json());

require("dotenv").config();

const clientId = process.env.EBAY_CLIENT_ID;
const clientSecret = process.env.EBAY_CLIENT_SECRET;

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
  const token = 'v^1.1#i^1#f^0#I^3#p^1#r^0#t^H4sIAAAAAAAA/+VYe2wURRjvtVdKw0MFrIgknls0Wti93b277u2GO7w+gAP6sHcttAJ1H7N0y97usjPH9TAktRpMNA3ECAnRGESkiYkxoAhEwAhNFR8RE4P2PzQhGh5RQwyJBuPs9ijXSgDpJTZx/9nMzDfffL/f/L75ZpfunVJetW35tqszPGXFe3rp3mKPh5lGl08pXTizpHheaRGdZ+DZ07ug19tX8vNiKKZ0S2gB0DINCHw9Kd2AgtsZIdK2IZgi1KBgiCkABSQLiVjDKoGlaMGyTWTKpk744nURQgpJfFgJK2IwJIXCCsC9xnWfSTNC8IBhZIYOKxKryEGOweMQpkHcgEg0UIRgaTZE0iGSCSZpXmBZgeEoPhjqIHxtwIaaaWATiiaibriCO9fOi/XWoYoQAhthJ0Q0HluaaIrF6+obk4v9eb6iOR4SSERpOLZVayrA1ybqaXDrZaBrLSTSsgwgJPzRkRXGOhVi14O5i/BdqjlVBSGFCfJcgGWrgVwQKpeadkpEt47D6dEUUnVNBWAgDWVvxyhmQ+oGMsq1GrGLeJ3PeT2VFnVN1YAdIeprYu2x5mYi2mB2iVg2CpnKpsQe0wBkomYNyYkcDTglXE0yaoDjQDWbW2jEW47mcSvVmoaiOaRBX6OJagCOGoznhsnjBhs1GU12TEVORHl2DDPKId3hbOrILqZRl+HsK0hhInxu8/Y7MDobIVuT0giMehg/4FIUIUTL0hRi/KCrxZx8emCE6ELIEvz+TCZDZQKUaW/wszTN+Nc0rErIXSAlEtjWyfURe+32E0jNhSLjNMb2AspaOJYerFUcgLGBiAaDIS7M5HgfG1Z0fO8/OvIw+8dmRKEyhAnTEsfwqgx4hZHDdCEyJJoTqd+JA0hilkyJ9kaALF2UASljnaVTwNYUIRBS2UBYBaRSzatkkFdVUgopjnYBoAGQJJkP/58S5U6lngCyDVBBtF4wnXdLgdVL/e0Z3k40W0Z3a3XWaPQ3VPMJaxnf0r2i3jKaUl1JmAULYeROs+Gm4Gt1DTOTxOsXggAn1wtHwnITIqBMCF5CNi3QbOqanJ1cGxywlWbRRtmadBa3E0DX8WtCUGOWFS/MiV0wkP/ysLg73IWrVP9RlbopKugId3KhcuZD7EC0NArXISfXs5RspvymiC8hTnenG/WEcGv4/jqpUGOADtospSkjF0/KhUvBzTJlA2imbXznppqce1jS3AgMXNWQbeo6sNsmpgAnn1OpNBIlHUy2xC6AwDVxkpVchgtyLBMMBbgJ4ZLdgto52Y6kiR3F3oYJXa79Yz/1o0Xuw/R5Pqf7PEPFHg9dR5PMQvqJKSWt3pLpBNQQoKBoKJLZQ2miSkFtg4G/ZG1AbQRZS9Ts4tlF317YkWj/ZuWRXSe2bHqOWjJUVJ73x2HPOnru6D+H8hJmWt4PCHr+jZFS5p4HZrAhOsQEaZ5lGa6Drrwx6mUqvHMijw90/77mYrj5J3S07JkzZ7dPn11Jzxg18nhKi7x9nqK9tRXn+of97b6Tvw52ZB/+ZOuPm4/Vzz3+9gXE9H/57ImyTqvtu+1VyrvL7Dm77VmLrvjWRx48svsAf+laVVZ62Wcm9Wn3ccNTW57/+PBDV9OPUoe94pIB7x9VRPp05rXGHUPhoe4nf3ml4ui+zmPlV/af+upQv/TF+1MPwbXGupKPPni968OBr1+g/4xdunfXusTgI/IBYdbKhs8ykfLBa7XvbVf3XT534emBnfG/7v9Usckf5i165+CR/i0VK7ac/v7i2cHW4JubqFbuSttvJ04O73z1sZNrV8KtZ5atPz/z0OW9/TtX1L8x/8XKBXuLB4e3tVXym0n+TEv81KrgsdUvQZk/eHx/2VvnwyN7+jdwChXkCxIAAA==';

  try {
    const response = await fetch('https://api.sandbox.ebay.com/buy/browse/v1/item_summary/search?q=shoes', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Error fetching products from eBay' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});