const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const app = express();

const CHANNEL_SECRET = process.env.CHANNEL_SECRET; // ← 環境変数にセットしておく

// 生のリクエストボディ保存用
app.use(bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// 署名検証ミドルウェア
function validateSignature(req, res, next) {
  const signature = req.headers['x-line-signature'];
  const hash = crypto
    .createHmac('SHA256', CHANNEL_SECRET)
    .update(req.rawBody)
    .digest('base64');

  if (signature === hash) {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
}

app.post('/webhook', validateSignature, (req, res) => {
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
