import { Document, Page, pdfjs } from 'react-pdf';
import { useState } from 'react';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PDFViewer = ({ url }) => {
    const [numPages, setNumPages] = useState(null);

    return (
        <div className="my-4">
            <Document file={url} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
                {Array.from(new Array(numPages), (el, index) => (
                    <Page key={`page_${index + 1}`} pageNumber={index + 1} />
                ))}
            </Document>
        </div>
    )
}
export default PDFViewer;