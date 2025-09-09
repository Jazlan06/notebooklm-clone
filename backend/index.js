require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { handlePDFUpload } = require('./services/pdfService');
const { chatWithPDF } = require('./services/chatService');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('pdf'), handlePDFUpload);
app.post('/chat', chatWithPDF);

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
