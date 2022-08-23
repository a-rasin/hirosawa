const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());

const port = 5000;

app.get('/', (_, res) => {
  res.json({success: true});
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

