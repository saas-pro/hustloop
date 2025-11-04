import { toast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/api';
import React, { useCallback, useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Check, Info, Paperclip } from 'lucide-react';
import { MarkdownViewer } from './ui/markdownViewer';
import Image from 'next/image';


interface TechTransferViewProps {
  techId: String;
  onClose: () => void;
}

interface IPDetails {
  firstName: string;
  lastName: string;
  id: string;
  ipTitle: string;
  describetheTech: string;
  summary: string;
  approvalStatus: string;
  name: string;
  organization: string;
  supportingFileUrl: string;
}

const TechTransfer = ({ techId, onClose }: TechTransferViewProps) => {
  const [ipDetails, setIpDetails] = useState<IPDetails | null>(null);
  const [isFetchingIpDetails, setIsFetchingIpDetails] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(true);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    onClose();
  }, [onClose]);


  useEffect(() => {
    const fetchIpDetails = async () => {
      setIsFetchingIpDetails(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/getTechTransfer?id=${techId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setIpDetails(data.ips[0]);
        } else {
          toast({
            title: 'Failed to load IP details',
            description: 'Unknown error occurred',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Something went wrong while loading IP details.',
          variant: 'destructive',
        });
      } finally {
        setIsFetchingIpDetails(false);
      }
    };
    fetchIpDetails();
  }, [techId]);


  const renderFileAttachment = (fileURL: string, fileName: string) => (
    <a
      href={fileURL}
      rel="noopener noreferrer"
      className="flex items-center gap-2 p-2 mt-2 border border-dashed rounded-md bg-accent/30 hover:bg-accent transition-colors"
    >
      <Paperclip className="h-4 w-4 text-primary" />
      <span className="font-medium text-sm text-primary truncate">
        {fileName || 'Attached File'}
      </span>
      <span className="text-xs text-muted-foreground ml-auto">
        (Click to View)
      </span>
    </a>
  );


  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => {
      if (!open) {
        handleCloseDialog();
      }
      setIsDialogOpen(open);
    }} >
      <DialogContent
        className={`
                    flex flex-col border bg-background transition-all duration-500 p-0 w-[90vw] max-w-[90vw] shadow-lg text-base fixed h-[90vh] rounded-lg top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                `} >
        <div className="flex justify-between items-center p-4 pr-14 rounded-t-lg border-b bg-muted/50 dark:bg-muted/20 flex-shrink-0">
          <DialogTitle className="text-xl font-bold">
            {ipDetails?.ipTitle}
          </DialogTitle>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {ipDetails && (
            <Card className="mb-0 border-primary/50 bg-primary-foreground/20">
              <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg font-extrabold text-primary flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  {ipDetails.ipTitle}
                </CardTitle>
                {ipDetails?.approvalStatus === "approved" && (
                  <span className="flex items-center justify-center w-6 h-6  rounded-full">
                    <Image src="/bluetick.png" alt="bluetick" height={20} width={20} />
                  </span>
                )}
              </CardHeader>
              <CardContent className="p-4 pt-0 text-sm">
                <div className='py-2 '>
                  <h1 className='text-lg'>
                    Summary:
                  </h1>
                  <div className='p-2'>
                    <p>{ipDetails.summary} </p>
                  </div>
                </div>

                <h1 className='text-lg'>
                  Described About the Technology:
                </h1>
                <div className='p-2'>
                  <MarkdownViewer content={ipDetails.describetheTech} />
                </div>
                <p className="mt-1 text-muted-foreground">Submitted By: <span className="font-semibold">{ipDetails.firstName} {ipDetails.lastName}</span> from <span className="italic">{ipDetails.organization}</span></p>

                {ipDetails.supportingFileUrl && (
                  <div className="mt-4 border-t pt-3">
                    <p className="font-medium text-primary-dark mb-2">Attached Submission File:</p>
                    {renderFileAttachment(ipDetails.supportingFileUrl, ipDetails.ipTitle)}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TechTransfer