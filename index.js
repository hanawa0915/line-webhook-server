const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
  const events = req.body.events;
  if (events && events.length > 0) {
    const source = events[0].source;
    if (source.type === 'group') {
      console.log('✅ グループID:', source.groupId);
    } else if (source.type === 'user') {
      console.log('✅ ユーザーID:', source.userId);
    }
  }
  res.status(200).send('OK');
});

app.get('/', (req, res) => {
  res.send('LINE Webhook Server is running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
