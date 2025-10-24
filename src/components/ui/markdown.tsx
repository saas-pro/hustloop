import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { UseFormReturn, Path } from "react-hook-form";

interface MarkdownEditorProps<T extends { description: string }> {
    ttForm: UseFormReturn<T>;
}

function MarkdownEditor<T extends { description: string }>({ ttForm }: MarkdownEditorProps<T>) {
    const [isPreview, setIsPreview] = useState(false);
    const descriptionField = "description" as Path<T>;
    const errorMessage = ttForm.formState.errors.description?.message as string | undefined;

    const components = {
        code: ({ inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || "");
            if (!inline && match) {
                return (
                    <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                    >
                        {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                );
            }
            return (
                <code className={className} {...props}>
                    {children}
                </code>
            );
        },
    };

    return (
        <div>

            <div className="mb-2">
                <button
                    type="button"
                    className={`px-3 py-1 rounded-md border ${!isPreview ? "bg-accent text-white" : "bg-white text-current"
                        }`}
                    onClick={() => setIsPreview(false)}
                >
                    Edit
                </button>
                <button
                    type="button"
                    className={`ml-2 px-3 py-1 rounded-md border ${isPreview ? "bg-accent text-white" : "bg-white text-current"
                        }`}
                    onClick={() => setIsPreview(true)}
                >
                    Preview
                </button>
            </div>

            {/* Edit Mode */}
            {!isPreview && (
                <textarea
                    className="w-full p-2 border rounded"
                    rows={6}
                    {...ttForm.register(descriptionField)}
                />
            )}

            {isPreview && (
                <div className="p-2 border rounded bg-gray-50">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
                        {ttForm.getValues(descriptionField) as string || "Nothing to preview"}
                    </ReactMarkdown>
                </div>
            )}


            {errorMessage && (
                <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
            )}
        </div>
    );
}

export default MarkdownEditor;
