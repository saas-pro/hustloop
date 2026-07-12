"use client";

import { useEffect, useRef, useState } from "react";
import { Editor } from "@tiptap/react";
import {
    Bold, Italic, List, ListOrdered, Quote, Heading1, Heading2,
    Undo, Redo, Link as LinkIcon, Image as ImageIcon,
    AlignLeft, AlignCenter, AlignRight, ListTodo,
} from "lucide-react";

interface EditorBubbleMenuProps {
    editor: Editor | null;
    onImageUploaded?: (url: string) => void;
}

function Sep() {
    return <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.2)", margin: "0 2px", flexShrink: 0 }} />;
}

function Btn({
    onClick,
    active,
    disabled,
    title,
    children,
}: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
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
                width: 28,
                height: 28,
                borderRadius: 6,
                border: "none",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.3 : 1,
                background: active ? "rgba(255,255,255,0.9)" : "transparent",
                color: active ? "#111" : "#e5e7eb",
                transition: "background 120ms, color 120ms",
                flexShrink: 0,
            }}
            onMouseEnter={(e) => {
                if (!active && !disabled) {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.15)";
                }
            }}
            onMouseLeave={(e) => {
                if (!active) {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }
            }}
        >
            {children}
        </button>
    );
}

export default function EditorBubbleMenu({ editor, onImageUploaded }: EditorBubbleMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });
    // Tick forces re-render on selection/transaction changes so active states update
    const [, setTick] = useState(0);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (!editor) return;

        const update = () => {
            setTick(t => t + 1);

            const { from, to, empty } = editor.state.selection;
            const isNodeEmpty = editor.state.selection.$anchor.parent.content.size === 0;

            if (empty && !isNodeEmpty) {
                setVisible(false);
                return;
            }

            const menuEl = menuRef.current;
            const menuH = menuEl?.offsetHeight ?? 46;
            const menuW = menuEl?.offsetWidth ?? 600;

            if (empty && isNodeEmpty) {
                // Use tiptap's view to get coords for the empty cursor
                const coords = editor.view.coordsAtPos(from);
                let left = coords.left - (menuW / 2) + 20; // approximate center
                left = Math.max(8, Math.min(left, window.innerWidth - menuW - 8));
                const top = coords.top - menuH - 10;
                setPos({ top, left });
                setVisible(true);
                return;
            }

            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) {
                setVisible(false);
                return;
            }

            const range = sel.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            if (!rect.width && !rect.height) {
                setVisible(false);
                return;
            }

            let left = rect.left + rect.width / 2 - menuW / 2;
            left = Math.max(8, Math.min(left, window.innerWidth - menuW - 8));

            const top = rect.top - menuH - 10;

            setPos({ top, left });
            setVisible(true);
        };

        editor.on("selectionUpdate", update);
        editor.on("transaction", update);

        return () => {
            editor.off("selectionUpdate", update);
            editor.off("transaction", update);
        };
    }, [editor]);

    const setLink = () => {
        if (!editor) return;
        const previousUrl = editor.getAttributes("link").href;

        // Unset link if it already exists
        if (previousUrl) {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }

        const selectedText = editor.state.doc.textBetween(
            editor.state.selection.from,
            editor.state.selection.to,
            " "
        ).trim();

        if (selectedText === "") return;

        // Set new link
        const defaultUrl = selectedText.startsWith('http') ? selectedText : `https://${selectedText}`;
        editor.chain().focus().extendMarkRange("link").setLink({ href: defaultUrl }).run();
    };

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

    const menuStyle: React.CSSProperties = {
        position: "fixed",
        top: pos.top,
        left: pos.left,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 2,
        padding: "4px 6px",
        borderRadius: 12,
        background: "rgba(22, 22, 26, 0.97)",
        backdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transform: visible ? "translateY(0) scale(1)" : "translateY(5px) scale(0.97)",
        transition: "opacity 130ms ease, transform 130ms ease",
        userSelect: "none",
        whiteSpace: "nowrap",
    };

    if (!editor) return null;

    return (
        <div ref={menuRef} style={menuStyle}>
            <Btn title="Bold (⌘B)" active={editor.isActive("bold")}
                onClick={() => editor.chain().focus().toggleBold().run()}>
                <Bold size={14} strokeWidth={2.5} />
            </Btn>
            <Btn title="Italic (⌘I)" active={editor.isActive("italic")}
                onClick={() => editor.chain().focus().toggleItalic().run()}>
                <Italic size={14} strokeWidth={2.5} />
            </Btn>

            <Sep />

            <Btn title="Heading 1" active={editor.isActive("heading", { level: 1 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                <Heading1 size={14} />
            </Btn>
            <Btn title="Heading 2" active={editor.isActive("heading", { level: 2 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                <Heading2 size={14} />
            </Btn>

            <Sep />

            <Btn title="Bullet List" active={editor.isActive("bulletList")}
                onClick={() => editor.chain().focus().toggleBulletList().run()}>
                <List size={14} />
            </Btn>
            <Btn title="Ordered List" active={editor.isActive("orderedList")}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                <ListOrdered size={14} />
            </Btn>

            <Sep />

            <Btn title="Blockquote" active={editor.isActive("blockquote")}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}>
                <Quote size={14} />
            </Btn>

            <Sep />

            <Btn title="Link" active={editor.isActive("link")} onClick={setLink}>
                <LinkIcon size={14} />
            </Btn>
            <Btn title={isUploading ? "Uploading..." : "Insert Image"} onClick={triggerImageUpload} disabled={isUploading}>
                <ImageIcon size={14} />
            </Btn>

            <Sep />

            <Btn title="Align Left" active={editor.isActive({ textAlign: "left" })}
                onClick={() => editor.isActive({ textAlign: "left" }) ? editor.chain().focus().unsetTextAlign().run() : editor.chain().focus().setTextAlign("left").run()}>
                <AlignLeft size={14} />
            </Btn>
            <Btn title="Align Center" active={editor.isActive({ textAlign: "center" })}
                onClick={() => editor.isActive({ textAlign: "center" }) ? editor.chain().focus().unsetTextAlign().run() : editor.chain().focus().setTextAlign("center").run()}>
                <AlignCenter size={14} />
            </Btn>
            <Btn title="Align Right" active={editor.isActive({ textAlign: "right" })}
                onClick={() => editor.isActive({ textAlign: "right" }) ? editor.chain().focus().unsetTextAlign().run() : editor.chain().focus().setTextAlign("right").run()}>
                <AlignRight size={14} />
            </Btn>

            <Sep />

            <Btn title="Undo (⌘Z)" disabled={!editor.can().undo()}
                onClick={() => editor.chain().focus().undo().run()}>
                <Undo size={14} />
            </Btn>
            <Btn title="Redo (⌘⇧Z)" disabled={!editor.can().redo()}
                onClick={() => editor.chain().focus().redo().run()}>
                <Redo size={14} />
            </Btn>

            {/* Hidden file input for inline image upload */}
            <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageChange}
            />
        </div>
    );
}
