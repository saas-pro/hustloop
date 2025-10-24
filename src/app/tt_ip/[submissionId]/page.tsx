'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CommentSection } from '@/components/comment-section';
import { useToast } from '@/hooks/use-toast';

export default function SubmissionPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const submissionId = Array.isArray(params?.submissionId)
        ? params.submissionId[0]
        : params?.submissionId;



    const [highlightCommentId, setHighlightCommentId] = useState<string | undefined>(undefined);


    useEffect(() => {
        if (!submissionId) return;
        const commentParam = searchParams.get('comment');
        
        if (commentParam) {
            setHighlightCommentId(commentParam);
            toast({
                title: 'Jumping to comment',
                description: `Opening comment ID: ${commentParam}`,
            });

            const timeout = setTimeout(() => {
                router.replace(`/tt_ip/${submissionId}`);
            }, 500);

            return () => clearTimeout(timeout);
        }
    }, [searchParams, router, toast, submissionId]);
    if (!submissionId) return null;
    return (
        <div>
            <CommentSection
                submissionId={submissionId}
                highlightedComment={highlightCommentId}
                onClose={() => router.push('/')}
            />
        </div>

    );
}
