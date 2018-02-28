const express = require('express');
const path = require('path');
const serveStatic = require('serve-static');

const app = express();
app.use(serveStatic(path.join(__dirname, '../client/dist')));

// app.get('/', (req, res) => {
//   res.send({message: 'Hello world'});
// });

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log('Server running on port', port);
});