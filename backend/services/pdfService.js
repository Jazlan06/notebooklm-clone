const fs = require('fs');
const pdfParse = require('pdf-parse');
const { embedChunksAndStore } = require('../utils/embedUtils');

const handlePDFUpload = async (req, res) => {
  const pdfPath = req.file.path;

  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;

    await embedChunksAndStore(text);

    res.json({ message: 'PDF processed successfully' });
  } catch (error) {
    console.error('PDF upload error:', error);
    res.status(500).json({ error: 'Failed to process PDF' });
  }
};

module.exports = { handlePDFUpload };
