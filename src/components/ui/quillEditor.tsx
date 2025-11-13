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
  

  useEffect(() => {
    async function initQuill() {
      if (!editorRef.current) return;

      const Quill = (await import("quill")).default;

      if (!quillRef.current) {
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
      }
    }

    initQuill();
  }, [onChange, placeholder]);

  useEffect(() => {
    if (quillRef.current) {
      const currentContent = quillRef.current.root.innerHTML;
      if (currentContent !== value && value !== undefined) {
        if (value === "") {
          quillRef.current.setContents([], "silent");
        } else {
          const delta = quillRef.current.clipboard.convert(value);
          quillRef.current.setContents(delta, "silent");
        }
      }
    }
  }, [value])

  console.log(value);

  return (
    <div className="flex flex-col w-full rounded-md bg-background shadow-sm">
      <div
        ref={editorRef}
        className="rounded-b-md p-2"
        style={{ minHeight: height }}
      />
    </div>
  );
}
