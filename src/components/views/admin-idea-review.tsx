import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Download, Eye } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type StartupIdeaStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'REJECTED' | 'ACCEPTED' | 'FUNDED';

interface StartupSubmission {
  id: string;
  startup_name: string;
  industry_sector: string;
  problem_statement: string;
  solution: string;
  target_market: string;
  competitors: string;
  business_model: string;
  traction: string;
  team_background: string;
  ask_amount: string;
  status: StartupIdeaStatus;
  created_at: string;
  recommended_incubators?: any[];
}

export function AdminIdeaReview() {
  const [ideas, setIdeas] = useState<StartupSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdea, setSelectedIdea] = useState<StartupSubmission | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const { toast } = useToast();

  const fetchIdeas = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/founder-ideas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIdeas(data);
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to fetch ideas", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  const downloadPdf = async (id: string, name: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/founder-ideas/${id}/download-pdf`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${name.replace(/\s+/g, '_')}_Pitch_Deck.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        toast({ title: "Error", description: "Could not download PDF.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Could not download PDF.", variant: "destructive" });
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setStatusUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/founder-ideas/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const updatedIdea = await res.json();
        setIdeas(ideas.map(i => i.id === id ? updatedIdea : i));
        setSelectedIdea(updatedIdea);
        toast({ title: "Success", description: "Status updated successfully." });
      } else {
        toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
  }

  return (
    <div className="grid gap-6">
      <h2 className="text-2xl font-bold">Startup Submissions</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ideas.map((idea) => (
          <Card key={idea.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline">{idea.industry_sector}</Badge>
                <Badge>{idea.status.replace('_', ' ')}</Badge>
              </div>
              <CardTitle>{idea.startup_name}</CardTitle>
              <CardDescription>Submitted on {new Date(idea.created_at).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="line-clamp-3 text-sm text-muted-foreground">{idea.problem_statement}</p>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 border-t bg-muted/20 pt-4">
              <div className="flex w-full gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="secondary" className="w-1/2" onClick={() => setSelectedIdea(idea)}>
                      <Eye className="w-4 h-4 mr-2" /> View
                    </Button>
                  </DialogTrigger>
                  {selectedIdea && selectedIdea.id === idea.id && (
                    <DialogContent className="max-w-3xl h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{selectedIdea.startup_name} Details</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 text-sm mt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div><span className="font-semibold">Industry:</span> {selectedIdea.industry_sector}</div>
                          <div><span className="font-semibold">Ask:</span> {selectedIdea.ask_amount || 'N/A'}</div>
                        </div>
                        <div><span className="font-semibold block mb-1">Problem:</span> <p className="bg-muted p-2 rounded">{selectedIdea.problem_statement}</p></div>
                        <div><span className="font-semibold block mb-1">Solution:</span> <p className="bg-muted p-2 rounded">{selectedIdea.solution}</p></div>
                        <div><span className="font-semibold block mb-1">Target Market:</span> <p className="bg-muted p-2 rounded">{selectedIdea.target_market}</p></div>
                        <div><span className="font-semibold block mb-1">Business Model:</span> <p className="bg-muted p-2 rounded">{selectedIdea.business_model}</p></div>

                        <div className="flex items-center gap-4 pt-4 border-t">
                          <span className="font-semibold">Update Status:</span>
                          <Select disabled={statusUpdating} value={selectedIdea.status} onValueChange={(val) => updateStatus(selectedIdea.id, val)}>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SUBMITTED">Submitted</SelectItem>
                              <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                              <SelectItem value="REJECTED">Rejected</SelectItem>
                              <SelectItem value="ACCEPTED">Accepted</SelectItem>
                            </SelectContent>
                          </Select>
                          {statusUpdating && <Loader2 className="animate-spin w-4 h-4" />}
                        </div>
                      </div>
                    </DialogContent>
                  )}
                </Dialog>
                <Button variant="outline" className="w-1/2" onClick={() => downloadPdf(idea.id, idea.startup_name)}>
                  <Download className="w-4 h-4 mr-2" /> PDF
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
