import React, { useState } from "react";
import { UseFormReturn, Path } from "react-hook-form";
import { MarkdownViewer } from "./markdownViewer";
import { Edit3, Eye } from "lucide-react";
import { Textarea } from "./textarea";


interface MarkdownEditorProps<T extends { describetheTech: string }> {
    ttForm: UseFormReturn<T>;
}

function MarkdownEditor<T extends { describetheTech: string }>({ ttForm }: MarkdownEditorProps<T>) {
    const [isPreview, setIsPreview] = useState(false);
    const describetheTech = "describetheTech" as Path<T>;
    const errorMessage = ttForm.formState.errors.describetheTech?.message as string | undefined;

    return (
        <div>
            <div className="mb-2 flex flex-wrap max-w-full">
                <button
                    type="button"
                    className={`flex items-center gap-2 px-3 py-1 rounded-md border transition-colors ${!isPreview
                        ? "bg-accent text-white border-accent"
                        : "bg-white text-current border-gray-300 hover:bg-gray-50"
                        }`}
                    onClick={() => setIsPreview(false)}
                >
                    <Edit3 size={16} />
                    Edit
                </button>

                <button
                    type="button"
                    className={`ml-2 flex items-center gap-2 px-3 py-1 rounded-md border transition-colors ${isPreview
                        ? "bg-accent text-white border-accent"
                        : "bg-white text-current border-gray-300 hover:bg-gray-50"
                        }`}
                    onClick={() => setIsPreview(true)}
                >
                    <Eye size={16} />
                    Preview
                </button>
            </div>
            {/* Edit Mode */}
            {!isPreview && (
                <div className="relative">
                    <Textarea
                        rows={6}
                        placeholder="Explain how your technology works. You can use Markdown for formatting (e.g., **bold**, lists, links)."
                        {...ttForm.register(describetheTech, {
                            onChange: (e) => {
                                const value = e.target.value.slice(0, 5000); // hard limit
                                ttForm.setValue(describetheTech, value);
                            },
                        })}
                        value={ttForm.watch(describetheTech) || ""}
                        
                    />

                    <div
                        className={`text-right text-xs mt-1 ${(ttForm.watch(describetheTech)?.length || 0) >= 5000
                                ? "text-red-500"
                                : "text-gray-500"
                            }`}
                    >
                        {(ttForm.watch(describetheTech)?.length || 0)} / 5000 characters
                    </div>

                </div>
            )}


            {isPreview && (
                <div className="p-2 border rounded bg-gray-50">
                    <MarkdownViewer
                        content={
                            (ttForm.getValues(describetheTech) as string) ||
                            "Nothing to preview"
                        }
                    />
                </div>
            )}
            {errorMessage && (
                <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
            )}
        </div>
    );
}

export default MarkdownEditor;
