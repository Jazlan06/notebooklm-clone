const { OpenAI } = require('openai');
const { ChromaClient } = require('chromadb');
const client = new ChromaClient();
const collectionName = 'pdf-chunks';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function embedChunksAndStore(text) {
  const chunks = splitText(text);
  const collection = await client.getOrCreateCollection({ name: collectionName });

  for (let i = 0; i < chunks.length; i++) {
    const embedding = await getEmbedding(chunks[i].text);
    await collection.add({
      ids: [String(i)],
      documents: [chunks[i].text],
      embeddings: [embedding],
      metadata: [{ page: chunks[i].page }],
    });
  }
}

function splitText(text) {
  const chunkSize = 500;
  const overlap = 100;
  const pages = text.split('\f');
  const chunks = [];

  pages.forEach((pageText, pageIndex) => {
    for (let i = 0; i < pageText.length; i += chunkSize - overlap) {
      const chunk = pageText.slice(i, i + chunkSize);
      chunks.push({ text: chunk, page: pageIndex + 1 });
    }
  });

  return chunks;
}

async function getEmbedding(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

module.exports = { embedChunksAndStore, getEmbedding };
