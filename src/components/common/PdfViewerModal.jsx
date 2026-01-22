// src/components/common/PdfViewerModal.jsx

import React from "react";
import "./PdfViewerModal.css";

export default function PdfViewerModal({ pdfUrl, onClose }) {
  if (!pdfUrl) return null;

  return (
    <div className="pdf-modal-overlay">
      <div className="pdf-modal-card">
        {/* Header */}
        <div className="pdf-modal-header">
          <strong>Invoice Preview</strong>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Body */}
        <div className="pdf-modal-body">
          <iframe src={pdfUrl} title="Invoice PDF" frameBorder="0" />
        </div>

        {/* Footer */}
        <div className="pdf-modal-footer">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="secondary-btn"
          >
            Open in New Tab
          </a>
        </div>
      </div>
    </div>
  );
}
