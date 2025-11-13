import React from "react";
import DOMPurify from "dompurify";

interface QAItemViewerProps {
  html: string; 
}

const QAItemViewer: React.FC<QAItemViewerProps> = ({ html }) => {
  return (
    <div
      className="text-sm text-foreground ml-2 prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
    />
  );
};

export default QAItemViewer;
