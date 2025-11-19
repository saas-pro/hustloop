import React, { useEffect, useState } from "react";
import { UseFormReturn, Path } from "react-hook-form";
import { MarkdownViewer } from "./markdownViewer";
import { Edit3, Eye } from "lucide-react";
import { Textarea } from "./textarea";


interface SolutionMarkdownProps<T extends { description: string }> {
    solutionForm: UseFormReturn<T>;
    defaultDescription: any;
}

function SolutionMarkdown<T extends { description: string }>({ solutionForm, defaultDescription }: SolutionMarkdownProps<T>) {
    const [isPreview, setIsPreview] = useState(false);
    const description = "description" as Path<T>;
    const errorMessage = solutionForm.formState.errors.description?.message as string | undefined;

    useEffect(() => {
        if (!solutionForm.getValues(description) && defaultDescription) {
            solutionForm.setValue(description, defaultDescription, { shouldDirty: false });
        }
    }, [defaultDescription, description, solutionForm]);

    return (
        <div>
            <div className="border rounded-md overflow-hidden">
                {!isPreview ? (
                    <div>
                        <Textarea
                            rows={12}
                            className="border-none rounded-none text-2xl leading-relaxed h-[300px]"
                            value={solutionForm.watch(description) || ""}
                            placeholder="Explain how your technology works. You can use Markdown for formatting (e.g., *bold*, lists, links)."
                            {...solutionForm.register(description, {
                                onChange: (e) => {
                                    const value = e.target.value.slice(0, 15000);
                                    solutionForm.setValue(description, value, { shouldValidate: true });
                                },
                            })}
                        />
                        <div className="text-right text-xs my-1 mr-2 text-gray-500 rounded-t-sm">
                            {(solutionForm.watch(description)?.length || 0)} / 15000 characters
                        </div>
                    </div>
                ) : (
                    <div className="p-3 h-[300px] overflow-y-auto">
                        <MarkdownViewer
                            content={
                                (solutionForm.getValues(description) as string) || "Nothing to preview"
                            }
                        />
                    </div>
                )}

                <div className="flex items-center justify-between border-t  px-2">
                    <div className="flex gap-2">
                        <button
                            type="button"
                            className={`px-4 py-2 text-sm rounded-sm ${!isPreview ? "bg-accent font-medium" : "hover:bg-accent/20"
                                }`}
                            onClick={() => setIsPreview(false)}
                        >
                            Write
                        </button>
                        <button
                            type="button"
                            className={`px-4 py-2 text-sm rounded-sm ${isPreview ? "bg-primary font-medium text-white" : "hover:bg-primary/20"
                                }`}
                            onClick={() => setIsPreview(true)}
                        >
                            Preview
                        </button>
                    </div>

                    <p className="text-xs text-gray-500">
                        Parsed with <span className="text-primary">Markdown</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SolutionMarkdown;