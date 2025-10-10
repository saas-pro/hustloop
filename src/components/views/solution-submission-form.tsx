import { useState, useId } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '../../hooks/use-toast';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';

interface SolutionSubmissionFormProps {
    challengeId: number;
    onSubmissionSuccess: () => void;
    onCancel: () => void;
}

export function SolutionSubmissionForm({
    challengeId,
    onSubmissionSuccess,
    onCancel,
}: SolutionSubmissionFormProps) {
    const [solutionTitle, setSolutionTitle] = useState('');
    const [solutionDescription, setSolutionDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const fileInputId = useId();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            alert('Please upload a PDF file.');
            return;
        }
        setLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            toast({ title: 'Solution submitted successfully!' });
            onSubmissionSuccess();
        } catch (error) {
            console.error('Submission error:', error);
            toast({ variant: 'destructive', title: 'Failed to submit solution. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type !== 'application/pdf') {
            alert('Only PDF files are allowed.');
            return;
        }
        setFile(selectedFile || null);
    };

    return (
        <div className="p-6" data-color-mode="light">
            <h2 className="text-2xl font-bold mb-6 font-headline">Submit Your Solution</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Label htmlFor="solutionTitle" className="mb-2 block">Solution Title</Label>
                    <Input
                        id="solutionTitle"
                        value={solutionTitle}
                        onChange={(e) => setSolutionTitle(e.target.value)}
                        placeholder="A concise title for your solution"
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="solutionDescription" className="mb-2 block">Solution Description (Markdown supported)</Label>

                    <MDEditor
                        value={solutionDescription}
                        onChange={(val) => setSolutionDescription(val ?? '')}
                        height={300}
                    />

                </div>

                <div>
                    <Label htmlFor={fileInputId} className="mb-2 block">Upload PDF</Label>
                    <Input
                        id={fileInputId}
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        required
                    />
                </div>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Solution'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
