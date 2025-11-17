"use client";
import React, { useEffect, useRef } from "react";
import "quill/dist/quill.snow.css";

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

export default function QuillEditor({
  value,
  onChange,
  placeholder = "Type your message...",
  height = "180px",
}: QuillEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<any>(null);
  const hasInitRef = useRef(false); 

  useEffect(() => {
    async function init() {
      if (hasInitRef.current) return;
      hasInitRef.current = true;

      if (!editorRef.current) return;
      const Quill = (await import("quill")).default;

      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        placeholder,
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }],
            ["link", "image"],
            ["blockquote", "code-block"],
            [{ align: [] }],
            ["clean"],
          ],
        },
      });

      quillRef.current.on("text-change", () => {
        const html = quillRef.current.root.innerHTML;
        onChange(html === "<p><br></p>" ? "" : html);
      });

      if (value) {
        quillRef.current.clipboard.dangerouslyPasteHTML(value);
      }
    }

    init();
  }, [onChange,placeholder,value]);

  useEffect(() => {
    if (!quillRef.current) return;

    const editorHTML = quillRef.current.root.innerHTML;
    if (editorHTML !== value) {
      quillRef.current.clipboard.dangerouslyPasteHTML(value || "");
    }
  }, [value]);

  return (
    <div className="quill-wrapper flex flex-col w-full  rounded-md bg-background shadow-sm">
      <div
        ref={editorRef}
        className="rounded-b-md p-2 h-full"
        style={{ minHeight: height }}
      />
    </div>
  );
}
