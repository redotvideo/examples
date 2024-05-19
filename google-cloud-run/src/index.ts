import { renderVideo } from '@revideo/renderer';
import { v4 as uuidv4 } from 'uuid';
import * as express from 'express';
import * as fs from 'fs';
import * as path from 'path';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).send(`Hello World!`);
});

app.post('/render', async (req, res) => {
  try {
    const { variables } = req.body;
    const jobId = uuidv4();

    console.log("Rendering video...")
    await renderVideo("./vite.config.ts", variables, () => {}, { name: jobId, puppeteer: { args: ['--no-sandbox', '--disable-setuid-sandbox'] }});
    console.log("Finished rendering")

    const outputFilePath = path.join(process.cwd(), `./output/${jobId}.mp4`);
    
    if (fs.existsSync(outputFilePath)) {
      res.sendFile(outputFilePath); // alternatively (and recommended), upload file to a bucket
    } else {
      res.status(500).send('Rendered video not found');
    }
  } catch (err) {
    console.error('Error rendering video:', err);
    res.status(500).send('Error rendering video');
  }
});

const port = parseInt(process.env.PORT) || 8080;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});