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
                {!isPreview ? (
                    <div>
                        <Textarea
                            rows={12}
                            className="border-none rounded-none leading-relaxed h-[300px]"
                            value={ttForm.watch(description) || ""}
                            placeholder="Explain how your technology works. You can use Markdown for formatting (e.g., *bold*, lists, links)."
                            {...ttForm.register(description, {
                                onChange: (e) => {
                                    const value = e.target.value.slice(0, 15000);
                                    ttForm.setValue(description, value, { shouldValidate: true });
                                },
                            })}
                        />

                    </div>
                ) : (
                    <div className="p-3 h-[300px] overflow-y-auto">
                        <MarkdownViewer
                            content={
                                (ttForm.getValues(description) as string) || "Nothing to preview"
                            }
                        />
                    </div>
                )}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t px-2 py-2 gap-2">
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            type="button"
                            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-sm flex-1 sm:flex-none ${!isPreview ? "bg-accent font-medium" : "hover:bg-accent/20"
                                }`}
                            onClick={() => setIsPreview(false)}
                        >
                            Write
                        </button>
                        <button
                            type="button"
                            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-sm flex-1 sm:flex-none ${isPreview ? "bg-primary font-medium text-white" : "hover:bg-primary/20"
                                }`}
                            onClick={() => setIsPreview(true)}
                        >
                            Preview
                        </button>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto text-xs">

                        <div className="text-xs text-white flex justify-center bg-primary p-1 px-2 rounded-md items-center gap-1.5 sm:gap-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 640 512"
                                className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
                                fill="currentColor"
                            >
                                <path d="M593.8 59.1H46.2C20.7 59.1 0 79.8 0 105.2v301.5c0 25.5 20.7 46.2 46.2 46.2h547.7c25.5 0 46.2-20.7 46.1-46.1V105.2c0-25.4-20.7-46.1-46.2-46.1zM338.5 360.6H277v-120l-61.5 76.9-61.5-76.9v120H92.3V151.4h61.5l61.5 76.9 61.5-76.9h61.5v209.2zm135.3 3.1L381.5 256H443V151.4h61.5V256H566z" />
                            </svg>

                            <span className="whitespace-nowrap">
                                Parsed with <span className="font-medium">Markdown</span>
                            </span>
                        </div>
                        <span className="text-gray-500 whitespace-nowrap">
                            {(ttForm.watch(description)?.length || 0)} / 15000 characters
                        </span>
                    </div>
                </div>
            </div>
            {
                errorMessage && (
                    <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
                )
            }

        </div >
    );
}

export default ChallengeMarkdownEditor;