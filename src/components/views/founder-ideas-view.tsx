import { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, CheckCircle, Clock, XCircle, Search, MessageCircle, Filter, ArrowUpDown, ChevronDown, Save } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { io, Socket } from "socket.io-client";
import { IdeaChatModal } from "./idea-chat-modal";
import { useAuth } from "@/providers/AuthContext";

export type StartupIdeaStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'REJECTED' | 'ACCEPTED';

export interface StartupSubmission {
  id: string;
  startup_name: string;
  industry_sector: string;
  status: StartupIdeaStatus;
  created_at: string;
  description?: string;
  contactName?: string;
  recommended_incubators?: any[];
  founder_name?: string;
  incubator_name?: string;
}

export function FounderIdeasView() {
  const [ideas, setIdeas] = useState<StartupSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const socketRef = useRef<Socket | null>(null);

  // SPA Modal state
  const [selectedIdea, setSelectedIdea] = useState<StartupSubmission | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  // Filters & Sorting state
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterSector, setFilterSector] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("NEWEST");

  // Admin status update state
  const [statusUpdates, setStatusUpdates] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});

  const { user, userRole } = useAuth();
  const role = userRole;
  const getUserId = () => {
    return user?.userId || 'unknown';
  };

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

    socketRef.current = io(API_BASE_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling']
    });

    socketRef.current.on('idea_status_updated', (updatedIdea: StartupSubmission) => {
      setIdeas(prev => prev.map(idea => idea.id === updatedIdea.id ? updatedIdea : idea));
      toast({ title: "Status Updated", description: `${updatedIdea.startup_name} is now ${updatedIdea.status}` });

      // Update selectedIdea if it's currently open
      if (selectedIdea && selectedIdea.id === updatedIdea.id) {
        setSelectedIdea(updatedIdea);
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIdea, toast]);

  const handleStatusChange = (id: string, newStatus: string) => {
    if (socketRef.current) {
      socketRef.current.emit('update_idea_status', {
        submissionId: id,
        status: newStatus,
        actorId: getUserId()
      });
    } else {
      toast({ title: "Error", description: "Not connected to server", variant: "destructive" });
    }
  };

  const handleActionClick = (id: string, status: string) => {
    setStatusUpdates((prev) => ({ ...prev, [id]: status }));
  };

  const handleUpdateStatusPending = (id: string) => {
    const newStatus = statusUpdates[id];
    if (!newStatus) return;

    setIsUpdating((prev) => ({ ...prev, [id]: true }));
    handleStatusChange(id, newStatus);

    setTimeout(() => {
      setStatusUpdates((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
      setIsUpdating((prev) => ({ ...prev, [id]: false }));
    }, 500); // Small delay to show loader
  };

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Clock className="w-3 h-3 mr-1" /> {status.replace('_', ' ')}</Badge>;
      case 'ACCEPTED':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" /> {status}</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-500 hover:bg-red-600"><XCircle className="w-3 h-3 mr-1" /> {status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Derived state for filters
  const uniqueSectors = useMemo(() => {
    const sectors = new Set(ideas.map(i => i.industry_sector).filter(Boolean));
    return Array.from(sectors);
  }, [ideas]);

  const filteredAndSortedIdeas = useMemo(() => {
    let result = [...ideas];

    // Filter
    if (filterStatus !== "ALL") {
      result = result.filter(i => i.status === filterStatus);
    }
    if (filterSector !== "ALL") {
      result = result.filter(i => i.industry_sector === filterSector);
    }

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortBy === "NEWEST" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [ideas, filterStatus, filterSector, sortBy]);

  // Group by Incubator Name
  const groupedIdeas = useMemo(() => {
    const groups: Record<string, StartupSubmission[]> = {};
    filteredAndSortedIdeas.forEach(idea => {
      const incubator = idea.incubator_name || 'Unassigned';
      if (!groups[incubator]) groups[incubator] = [];
      groups[incubator].push(idea);
    });
    return groups;
  }, [filteredAndSortedIdeas]);

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
  }

  if (ideas.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            <Search className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Ideas Submitted Yet</h3>
          <p className="text-muted-foreground max-w-md">
            You haven&apos;t submitted any innovative ideas for review yet. Go to the submission form to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full items-start">

      {/* Top Horizontal Filters */}
      <Card className="w-full shadow-sm border bg-muted/10">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center">
                <ArrowUpDown className="w-3 h-3 mr-1" /> Sort:
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px] bg-background">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEWEST">Newest First</SelectItem>
                  <SelectItem value="OLDEST">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center">
                <Filter className="w-3 h-3 mr-1" /> Status:
              </label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px] bg-background">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                  <SelectItem value="ACCEPTED">Accepted</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sector Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-muted-foreground">Sector:</label>
              <Select value={filterSector} onValueChange={setFilterSector}>
                <SelectTrigger className="w-[140px] bg-background">
                  <SelectValue placeholder="All Sectors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  {uniqueSectors.map(sector => (
                    <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={() => { setFilterStatus("ALL"); setFilterSector("ALL"); setSortBy("NEWEST"); }}
          >
            Reset Filters
          </Button>
        </CardContent>
      </Card>

      {/* Main Content Area - Grouped by Incubator */}
      <div className="w-full">
        {Object.keys(groupedIdeas).length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/10">
            <Filter className="w-8 h-8 mx-auto mb-3 opacity-50" />
            No ideas match your current filters.
          </div>
        ) : (
          <Accordion type="multiple" className="w-full space-y-4">
            {Object.keys(groupedIdeas).map((incubatorName) => (
              <AccordionItem key={incubatorName} value={incubatorName} className="bg-card border rounded-lg shadow-sm">

                <AccordionTrigger className="hover:no-underline py-4 px-6 hover:bg-muted/50 transition-colors rounded-t-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-lg">{incubatorName}</span>
                    <Badge variant="secondary" className="font-normal">{groupedIdeas[incubatorName].length} Ideas</Badge>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="p-4 border-t bg-muted/10 space-y-4">
                  {groupedIdeas[incubatorName].map((idea) => (

                    <Card key={idea.id} className="p-4 shadow-sm bg-background border-border/50">
                      <div className="flex flex-col space-y-4">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                          <div>
                            <h4 className="font-bold text-lg text-foreground">{idea.startup_name}</h4>
                            <p className="text-sm text-muted-foreground">Founder: <span className="font-medium text-foreground">{idea.founder_name || 'Unknown'}</span></p>
                          </div>
                          <div className="flex flex-col md:items-end gap-1">
                            {getStatusBadge(idea.status)}
                            <span className="text-xs text-muted-foreground">Submitted: {new Date(idea.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-normal bg-background">{idea.industry_sector}</Badge>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Your submission is currently <strong>{idea.status.replace('_', ' ').toLowerCase()}</strong>.
                          </p>
                          {idea.status === 'REJECTED' && idea.recommended_incubators && idea.recommended_incubators.length > 0 && (
                            <div className="bg-muted p-4 rounded-md text-sm mt-4 border border-border/50">
                              <p className="font-semibold mb-2 text-primary">AI Recommended Incubators:</p>
                              <ul className="list-disc pl-5 space-y-1">
                                {idea.recommended_incubators.map((inc, i) => (
                                  <li key={i}>{inc.name} ({inc.compatibility_score}% Match)</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 pt-2">
                          <Button variant="outline" size="sm" onClick={() => downloadPdf(idea.id, idea.startup_name)}>
                            <Download className="w-4 h-4 mr-2" /> Pitch Deck
                          </Button>

                          <Button size="sm" onClick={() => {
                            setSelectedIdea(idea);
                            setChatOpen(true);
                          }}>
                            <MessageCircle className="w-4 h-4 mr-2" /> Chat
                          </Button>

                          {role === 'admin' && (
                            <div className="ml-auto flex items-center gap-2">
                              {statusUpdates[idea.id] && (
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateStatusPending(idea.id);
                                  }}
                                  disabled={isUpdating[idea.id]}
                                >
                                  {isUpdating[idea.id] ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <Save className="mr-2 h-4 w-4" />
                                  )}
                                  Update Status
                                </Button>
                              )}

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Actions
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleActionClick(idea.id, "SUBMITTED"); }}>
                                    <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                                    <span>Submitted</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleActionClick(idea.id, "UNDER_REVIEW"); }}>
                                    <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                                    <span>Under Review</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleActionClick(idea.id, "ACCEPTED"); }}>
                                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                    <span>Accepted</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleActionClick(idea.id, "REJECTED"); }} className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
                                    <XCircle className="mr-2 h-4 w-4" />
                                    <span>Rejected</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      {/* SPA Idea Chat Modal */}
      {selectedIdea && (
        <IdeaChatModal
          submission={selectedIdea}
          onOpenChange={(open) => {
            setChatOpen(open);
            if (!open) {
              setSelectedIdea(null);
            }
          }}
        />
      )}
    </div>
  );
}
