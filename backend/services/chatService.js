const { getEmbedding } = require('../utils/embedUtils');
const { OpenAI } = require('openai');
const { ChromaClient } = require('chromadb');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const client = new ChromaClient();
const collectionName = 'pdf-chunks';

const chatWithPDF = async (req, res) => {
  const { question } = req.body;

  try {
    const embedding = await getEmbedding(question);
    const collection = await client.getCollection({ name: collectionName });

    const results = await collection.query({
      queryEmbeddings: [embedding],
      nResults: 5,
    });

    const relevantChunks = results.documents[0];
    const pages = results.metadatas[0].map(meta => meta.page);
    const context = relevantChunks.join('\n');

    const prompt = `You are reading a PDF. Answer the question based on the context below. Include page citations as [Page X].

Context:
${context}

Question: ${question}
`;

    const chat = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });

    const answer = chat.choices[0].message.content;

    res.json({ answer, citations: pages });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat' });
  }
};

module.exports = { chatWithPDF };
