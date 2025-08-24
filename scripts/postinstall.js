const fs = require('fs');
const path = require('path');
const up = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(up)) fs.mkdirSync(up, { recursive: true });
