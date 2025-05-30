const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const app = express();

const CHANNEL_SECRET = process.env.CHANNEL_SECRET;

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
    console.log('✅ 署名検証成功');
    next();
  } else {
    console.log('❌ 署名検証失敗');
    res.status(401).send('Unauthorized');
  }
}

// Webhook受信エンドポイント
app.post('/webhook', validateSignature, (req, res) => {
  console.log('📩 Webhook受信:', JSON.stringify(req.body, null, 2));

  const events = req.body.events;
  if (!events || events.length === 0) {
    console.log('⚠️ イベントが空です');
    return res.status(200).send('NO EVENTS');
  }

  const source = events[0].source;

  if (source.type === 'group') {
    console.log('✅ グループID:', source.groupId);
  } else if (source.type === 'user') {
    console.log('✅ ユーザーID:', source.userId);
  } else if (source.type === 'room') {
    console.log('✅ ルームID:', source.roomId);
  } else {
    console.log('❓ 不明なsourceタイプ:', source);
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
