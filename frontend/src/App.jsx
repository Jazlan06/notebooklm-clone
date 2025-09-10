import React, { useState, useRef } from 'react';
import RateLimitModal from './components/RateLimitModal';
import { Document, Page, pdfjs } from 'react-pdf';
import axios from 'axios';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function App() {
  const [pdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [uploading, setUploading] = useState(false);

  const docRef = useRef();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const res = await axios.post('http://localhost:4000/upload-pdf', formData);
      setPdfFile(URL.createObjectURL(file));
      setNumPages(res.data.pages);
      setPageNumber(1);
      setChatMessages([{ role: 'system', content: 'PDF uploaded. Ask me anything about it!' }]);
    } catch (err) {
      if (err.response?.status === 429) {
        setShowRateLimitModal(true);
      } else {
        alert('Upload failed');
      }
    }
    setUploading(false);
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleAsk = async () => {
    if (!question.trim()) return;

    setChatMessages((msgs) => [...msgs, { role: 'user', content: question }]);
    setLoadingAnswer(true);

    try {
      const res = await axios.post('http://localhost:4000/chat', { question });
      setChatMessages((msgs) => [
        ...msgs,
        { role: 'assistant', content: res.data.answer, citationPage: res.data.citationPage },
      ]);
      setQuestion('');
    } catch (err) {
      if (err.response?.status === 429) {
        setShowRateLimitModal(true);
      } else {
        alert('Chat error');
      }
    } finally {
      setLoadingAnswer(false);
    }
  };

  const handleCitationClick = (page) => {
    setPageNumber(page);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen p-4 gap-4">
      <h1 className="text-2xl font-bold text-center mb-4">📄 NotebookLM Clone</h1>

      <div className="md:w-1/2 border rounded p-4 flex flex-col">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleUpload}
          disabled={uploading}
        />
        {uploading && <p className="text-blue-500">Uploading and processing PDF...</p>}

        {pdfFile && (
          <div className="flex-grow overflow-auto border mt-4">
            <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess} ref={docRef}>
              <Page pageNumber={pageNumber} />
            </Document>

            <div className="flex justify-center gap-2 mt-2">
              <button
                onClick={() => setPageNumber((p) => Math.max(p - 1, 1))}
                className="px-3 py-1 bg-gray-300 rounded"
              >
                Prev
              </button>
              <span>
                Page {pageNumber} of {numPages}
              </span>
              <button
                onClick={() => setPageNumber((p) => Math.min(p + 1, numPages))}
                className="px-3 py-1 bg-gray-300 rounded"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="md:w-1/2 flex flex-col border rounded p-4">
        <div className="flex-grow overflow-auto mb-4 space-y-3">
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded ${
                msg.role === 'user' ? 'bg-blue-100 self-end' : 'bg-gray-100 self-start'
              } max-w-[80%]`}
            >
              <p>{msg.content}</p>
              {msg.citationPage && (
                <button
                  onClick={() => handleCitationClick(msg.citationPage)}
                  className="mt-2 text-sm text-blue-600 underline"
                >
                  Go to Page {msg.citationPage}
                </button>
              )}
            </div>
          ))}
          {loadingAnswer && (
            <p className="text-blue-500 text-sm mb-2">Thinking...</p>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            className="flex-grow border rounded px-3 py-2"
            placeholder="Ask about the PDF..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            disabled={loadingAnswer}
          />
          <button
            onClick={handleAsk}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-blue-300"
            disabled={!question.trim() || loadingAnswer}
          >
            Ask
          </button>
        </div>
      </div>

      <RateLimitModal
        isOpen={showRateLimitModal}
        onClose={() => setShowRateLimitModal(false)}
      />
    </div>
  );
}
