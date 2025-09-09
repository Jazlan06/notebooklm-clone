import { useState } from 'react';
import axios from 'axios';
import PDFViewer from './components/PDFViewer';
import ChatBox from './components/ChatBox';

function App() {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [messages, setMessages] = useState([]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setPdfFile(file);
    const formData = new FormData();
    formData.append('pdf', file);

    const res = await axios.post('http://localhost:5000/upload', formData);
    console.log(res.data);
    setPdfUrl(URL.createObjectURL(file));
  };

  const handleSend = async (msg) => {
    const res = await axios.post('http://localhost:5000/chat', { question: msg });
    setMessages([...messages, { role: 'user', content: msg }, { role: 'bot', content: res.data.answer, citations: res.data.citations }]);
  };

  return (
    <div className="p-4">
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      {pdfUrl && <PDFViewer url={pdfUrl} />}
      <ChatBox messages={messages} onSend={handleSend} />
    </div>
  );
}

export default App;
