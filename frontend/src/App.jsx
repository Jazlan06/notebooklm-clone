import React, { useState, useRef } from 'react';
import RateLimitModal from './components/RateLimitModal';
import { Document, Page, pdfjs } from 'react-pdf';
import axios from 'axios';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function App() {
    const [pdfFile, setPdfFile] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [showRateLimitModal, setShowRateLimitModal] = useState(false); // Modal visibility state
    const [chatMessages, setChatMessages] = useState([]);
    const [question, setQuestion] = useState('');
    const [uploading, setUploading] = useState(false);

    const docRef = useRef();

    // Upload PDF handler with 429 check
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
                // Show rate limit modal if 429 error
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

    // Chat submit handler with 429 check
    const handleAsk = async () => {
        if (!question.trim()) return;

        setChatMessages((msgs) => [...msgs, { role: 'user', content: question }]);

        try {
            const res = await axios.post('http://localhost:4000/chat', { question });
            setChatMessages((msgs) => [
                ...msgs,
                { role: 'assistant', content: res.data.answer, citationPage: res.data.citationPage },
            ]);
            setQuestion('');
        } catch (err) {
            if (err.response?.status === 429) {
                // Show rate limit modal if 429 error
                setShowRateLimitModal(true);
            } else {
                alert('Chat error');
            }
        }
    };

    // Scroll PDF to citation page
    const handleCitationClick = (page) => {
        setPageNumber(page);
    };

    return (
        <div className="flex flex-col md:flex-row h-screen p-4 gap-4">
            {/* Left: PDF viewer + upload */}
            <div className="md:w-1/2 border rounded p-4 flex flex-col">
                <input type="file" accept="application/pdf" onChange={handleUpload} disabled={uploading} />
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

            {/* Right: Chat interface */}
            <div className="md:w-1/2 flex flex-col border rounded p-4">
                <div className="flex-grow overflow-auto mb-4 space-y-3">
                    {chatMessages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`p-3 rounded ${msg.role === 'user' ? 'bg-blue-100 self-end' : 'bg-gray-100 self-start'
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
                </div>

                <div className="flex gap-2">
                    <input
                        type="text"
                        className="flex-grow border rounded px-3 py-2"
                        placeholder="Ask about the PDF..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                    />
                    <button
                        onClick={handleAsk}
                        className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-blue-300"
                        disabled={!question.trim()}
                    >
                        Ask
                    </button>
                </div>
            </div>

            {/* Rate Limit Modal */}
            <RateLimitModal
                isOpen={showRateLimitModal}
                onClose={() => setShowRateLimitModal(false)}
            />
        </div>
    );
}
