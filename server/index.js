import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.static(path.join(__dirname, '..', 'dist')));

app.listen(PORT, () => {
  console.log('Server started on port 3000. Open http://localhost:3000');
});
