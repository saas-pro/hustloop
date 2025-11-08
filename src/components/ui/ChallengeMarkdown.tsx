import React, { useEffect, useState } from "react";
import { UseFormReturn, Path } from "react-hook-form";
import { MarkdownViewer } from "./markdownViewer";
import { Edit3, Eye } from "lucide-react";
import { Textarea } from "./textarea";


interface ChallengeMarkdownEditorProps<T extends { description: string }> {
    ttForm: UseFormReturn<T>;
    defaultDescription: any;
}

function ChallengeMarkdownEditor<T extends { description: string }>({ ttForm, defaultDescription }: ChallengeMarkdownEditorProps<T>) {
    const [isPreview, setIsPreview] = useState(false);
    const description = "description" as Path<T>;
    const errorMessage = ttForm.formState.errors.description?.message as string | undefined;

    useEffect(() => {
        if (!ttForm.getValues(description) && defaultDescription) {
            ttForm.setValue(description, defaultDescription, { shouldDirty: false });
        }
    }, [defaultDescription, description, ttForm]);

    return (
        <div>
            <div className="border rounded-md overflow-hidden">
                {/* Textarea or Preview */}
                {!isPreview ? (
                    <div>
                        <Textarea
                            rows={12}
                            className="border-none rounded-none"
                            value={ttForm.watch(description) || ""}
                            placeholder="Explain how your technology works. You can use Markdown for formatting (e.g., *bold*, lists, links)."
                            {...ttForm.register(description, {
                                onChange: (e) => {
                                    const value = e.target.value.slice(0, 15000);
                                    ttForm.setValue(description, value, { shouldValidate: true });
                                },
                            })}
                        />
                        <div className="text-right text-xs my-1 mr-2 text-gray-500 rounded-t-sm">
                            {(ttForm.watch(description)?.length || 0)} / 15000 characters
                        </div>
                    </div>
                ) : (
                    <div className="p-3 min-h-[200px]">
                        <MarkdownViewer
                            content={
                                (ttForm.getValues(description) as string) || "Nothing to preview"
                            }
                        />
                    </div>
                )}

                {/* Tabs + Markdown label */}
                <div className="flex items-center justify-between border-t bg-white px-2">
                    <div className="flex">
                        <button
                            type="button"
                            className={`px-4 py-2 text-sm rounded-sm ${!isPreview ? "bg-accent font-medium" : "hover:bg-gray-100"
                                }`}
                            onClick={() => setIsPreview(false)}
                        >
                            Write
                        </button>
                        <button
                            type="button"
                            className={`px-4 py-2 text-sm rounded-sm ${isPreview ? "bg-accent font-medium" : "hover:bg-gray-100"
                                }`}
                            onClick={() => setIsPreview(true)}
                        >
                            Preview
                        </button>
                    </div>

                    <p className="text-xs text-gray-500">
                        Parsed with <span className="text-blue-600">Markdown</span>
                    </p>
                </div>
            </div>

            {/* Character count + error */}

            {errorMessage && (
                <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
            )}

        </div>
    );
}

export default ChallengeMarkdownEditor;