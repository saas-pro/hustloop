"use client";

import { useRef, useState } from "react";
import { Editor } from "@tiptap/react";
import { FloatingMenu } from "@tiptap/react/menus";
import { Image as ImageIcon, Heading1, Heading2, List, Quote } from "lucide-react";

interface EditorFloatingMenuProps {
    editor: Editor | null;
    onImageUploaded?: (url: string) => void;
}

function Btn({
    onClick,
    title,
    children,
    disabled
}: {
    onClick: () => void;
    title: string;
    children: React.ReactNode;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            title={title}
            onMouseDown={(e) => {
                e.preventDefault();
                if (!disabled) onClick();
            }}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "none",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.5 : 1,
                background: "transparent",
                color: "#e5e7eb",
                transition: "background 120ms, color 120ms",
                flexShrink: 0,
            }}
            onMouseEnter={(e) => {
                if (!disabled) {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.15)";
                }
            }}
            onMouseLeave={(e) => {
                if (!disabled) {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }
            }}
        >
            {children}
        </button>
    );
}

export default function EditorFloatingMenu({ editor, onImageUploaded }: EditorFloatingMenuProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    if (!editor) return null;

    const triggerImageUpload = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!editor) return;
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("image", file);
            const token = localStorage.getItem("token");
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

            const res = await fetch(`${apiUrl}/blogs/upload-image`, {
                method: "POST",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: formData,
            });
            const data = await res.json();
            if (res.ok && data.success && data.url) {
                editor.chain().focus().setImage({ src: data.url }).run();
                onImageUploaded?.(data.url);
            } else {
                alert(data.message || "Failed to upload image.");
            }
        } catch (error) {
            console.error("Image upload failed", error);
            alert("Failed to upload image.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <FloatingMenu editor={editor} options={{ placement: "left" }}>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "4px",
                    borderRadius: 12,
                    background: "rgba(22, 22, 26, 0.97)",
                    backdropFilter: "blur(14px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",
                }}
            >
                <Btn title="Heading 1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                    <Heading1 size={16} />
                </Btn>
                <Btn title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                    <Heading2 size={16} />
                </Btn>
                <Btn title="Bullet List" onClick={() => editor.chain().focus().toggleBulletList().run()}>
                    <List size={16} />
                </Btn>
                <Btn title="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()}>
                    <Quote size={16} />
                </Btn>
                
                <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.2)", margin: "0 4px" }} />
                
                <Btn title={isUploading ? "Uploading..." : "Insert Image"} onClick={triggerImageUpload} disabled={isUploading}>
                    <ImageIcon size={16} />
                </Btn>

                <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                />
            </div>
        </FloatingMenu>
    );
}
