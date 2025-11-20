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

                <div className="flex items-center justify-between border-t px-2 py-1">
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
                    <div className="text-right text-xs my-1 mr-2 text-gray-500 rounded-t-sm flex gap-2">
                        {(solutionForm.watch(description)?.length || 0)} / 15000 characters
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 640 512"
                                className="w-4 h-4 text-primary"
                                fill="currentColor"
                            >
                                <path d="M593.8 59.1H46.2C20.7 59.1 0 79.8 0 105.2v301.5c0 25.5 20.7 46.2 46.2 46.2h547.7c25.5 0 46.2-20.7 46.1-46.1V105.2c0-25.4-20.7-46.1-46.2-46.1zM338.5 360.6H277v-120l-61.5 76.9-61.5-76.9v120H92.3V151.4h61.5l61.5 76.9 61.5-76.9h61.5v209.2zm135.3 3.1L381.5 256H443V151.4h61.5V256H566z" />
                            </svg>

                            <span>
                                Parsed with <span className="text-primary font-medium">Markdown</span>
                            </span>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default SolutionMarkdown;