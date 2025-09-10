require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

let pdfData = {
    textByPage: [],
    embeddings: [], 
    filePath: null,
};

app.post('/upload-pdf', upload.single('pdf'), async (req, res) => {
    try {
        const filePath = req.file.path;
        const dataBuffer = fs.readFileSync(filePath);

        const data = await pdfParse(dataBuffer);
        const fullText = data.text;

        const textByPage = fullText.split('\f').map(p => p.trim()).filter(Boolean);

        console.log('Pages found:', textByPage.length);

        pdfData = { textByPage, embeddings: [], filePath };

        for (let i = 0; i < textByPage.length; i++) {
            const pageText = textByPage[i];

            if (!pageText || pageText.trim() === '') {
                console.warn(`Skipping empty page ${i + 1}`);
                continue;
            }

            console.log(`Generating embedding for page ${i + 1}, text preview:`, JSON.stringify(pageText).slice(0, 100));

            const embeddingResponse = await openai.createEmbedding({
                model: 'text-embedding-ada-002',
                input: pageText,
            });

            pdfData.embeddings.push(embeddingResponse.data.data[0].embedding);
        }

        res.json({ message: 'PDF uploaded and processed', pages: textByPage.length });
    } catch (error) {
        console.error('❌ Error during /upload-pdf:', error?.response?.data || error.message);
        if (error.response?.data?.error?.code === 'insufficient_quota') {
            res.status(429).json({ error: 'Rate limit or quota exceeded' });
        } else {
            res.status(500).json({ error: 'Failed to process PDF' });
        }
    }
});

function cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
    const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magA * magB);
}

app.post('/chat', async (req, res) => {
    try {
        const { question } = req.body;
        if (!pdfData.textByPage.length) {
            return res.status(400).json({ error: 'No PDF uploaded yet' });
        }

        const embeddingResponse = await openai.createEmbedding({
            model: 'text-embedding-ada-002',
            input: question,
        });
        const questionEmbedding = embeddingResponse.data.data[0].embedding;

        let bestScore = -Infinity;
        let bestPageIndex = 0;
        for (let i = 0; i < pdfData.embeddings.length; i++) {
            const score = cosineSimilarity(questionEmbedding, pdfData.embeddings[i]);
            if (score > bestScore) {
                bestScore = score;
                bestPageIndex = i;
            }
        }

        const context = pdfData.textByPage[bestPageIndex];
        const prompt = `
You are an assistant that answers questions based on the following PDF content:

Context:
${context}

Question: ${question}

Answer with relevant info and provide a citation to the PDF page number in the format: [Page ${bestPageIndex + 1}].
    `;

        const completion = await openai.createChatCompletion({
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 500,
        });

        const answer = completion.data.choices[0].message.content;

        res.json({
            answer,
            citationPage: bestPageIndex + 1,
        });
    } catch (error) {
        console.error('❌ Error during /chat:', error?.response?.data || error.message);

        if (error.response?.data?.error?.code === 'insufficient_quota') {
            return res.status(429).json({ error: 'Rate limit or quota exceeded' });
        }

        res.status(500).json({ error: 'Chat failed' });
    }
});

app.use('/pdfs', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
