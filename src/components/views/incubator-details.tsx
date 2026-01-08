
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Incubator } from './incubators';
import {
  Users,
  Briefcase,
  Wrench,
  CircleDollarSign,
  Building,
  Workflow,
  Star,
  MapPin,
  BookOpen,
  Check,
  Globe,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MessageSquare,
  Send,
  CornerDownRight,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { LoadingButton } from '@/components/ui/loading-button';
import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { jwtDecode } from 'jwt-decode';

const serviceIcons: { [key: string]: React.ReactNode } = {
  Mentorship: <Users className="h-6 w-6 text-primary" />,
  'Business Development': <Briefcase className="h-6 w-6 text-primary" />,
  'Technical Support': <Wrench className="h-6 w-6 text-primary" />,
  'Funding Access': <CircleDollarSign className="h-6 w-6 text-primary" />,
  Workspace: <Building className="h-6 w-6 text-primary" />,
  'VC Network': <Workflow className="h-6 w-6 text-primary" />,
  'Angel Network': <Star className="h-6 w-6 text-primary" />,
  'Startup School': <BookOpen className="h-6 w-6 text-primary" />,
  'Clinical Mentorship': <Users className="h-6 w-6 text-primary" />,
  'Lab Access': <Wrench className="h-6 w-6 text-primary" />,
  'Regulatory Support': <BookOpen className="h-6 w-6 text-primary" />,
  'Hospital Network': <Building className="h-6 w-6 text-primary" />,
  'Bio Workspace': <Building className="h-6 w-6 text-primary" />,
  'Healthcare VC Network': <Workflow className="h-6 w-6 text-primary" />,
  'MedTech Angels': <Star className="h-6 w-6 text-primary" />,
  'BioTech Academy': <BookOpen className="h-6 w-6 text-primary" />,
  'Production Support': <Wrench className="h-6 w-6 text-primary" />,
  'Distribution Network': <Workflow className="h-6 w-6 text-primary" />,
  'Creative Mentorship': <Users className="h-6 w-6 text-primary" />,
  'Legal & IP Guidance': <BookOpen className="h-6 w-6 text-primary" />,
  'Co-working & Studio Space': <Building className="h-6 w-6 text-primary" />,
  'Investor Connections': <CircleDollarSign className="h-6 w-6 text-primary" />,
};

interface IncubatorDetailsProps {
  incubator: Incubator | null;
  onOpenChange: (isOpen: boolean) => void;
  isLoggedIn: boolean;
  hasSubscription: boolean;
}

interface IncubatorReview {
  id: string;
  user_id: string;
  userName: string;
  rating: number | null;
  comment: string;
  parent_id: string | null;
  created_at: string;
  replies: IncubatorReview[];
}

export default function IncubatorDetails({ incubator, onOpenChange, isLoggedIn, hasSubscription }: IncubatorDetailsProps) {
  const { user: firebaseUser } = useFirebaseAuth();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const [reviews, setReviews] = useState<IncubatorReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState<{ [key: string]: boolean }>({});
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'review' | 'reply' } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setCurrentUserId(decoded.user_id || decoded.uid || null);
      } catch (e) {
        console.error("Error decoding token:", e);
      }
    } else if (firebaseUser) {
      setCurrentUserId(firebaseUser.uid);
    }
  }, [firebaseUser]);

  const fetchReviews = useCallback(async () => {
    if (!incubator?.id) return;
    setIsLoadingReviews(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/incubators/${incubator.id}/reviews`);
      const data = await response.json();
      if (response.ok) {
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoadingReviews(false);
    }
  }, [incubator?.id]);

  useEffect(() => {
    if (incubator?.id) {
      fetchReviews();
    }
  }, [incubator?.id, fetchReviews]);



  const handleSubmitReview = async () => {
    if (!isLoggedIn) {
      toast({ title: "Login Required", description: "You must be logged in to leave a review.", variant: "destructive" });
      return;
    }
    if (newRating === 0) {
      toast({ title: "Rating Required", description: "Please select a star rating.", variant: "destructive" });
      return;
    }
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/incubators/${incubator?.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ rating: newRating, comment: newComment })
      });

      if (response.ok) {
        toast({ title: "Success", description: "Review submitted successfully!" });
        setNewComment('');
        setNewRating(0);
        fetchReviews();
      } else {
        const data = await response.json();
        toast({ title: "Error", description: data.error || "Failed to submit review.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentReviewId: string) => {
    const text = replyText[parentReviewId];
    if (!text?.trim()) return;

    setIsSubmittingReply(prev => ({ ...prev, [parentReviewId]: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews/${parentReviewId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ comment: text })
      });

      if (response.ok) {
        toast({ title: "Success", description: "Reply posted successfully!" });
        setReplyText(prev => ({ ...prev, [parentReviewId]: '' }));
        fetchReviews();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to post reply.", variant: "destructive" });
    } finally {
      setIsSubmittingReply(prev => ({ ...prev, [parentReviewId]: false }));
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews/${itemToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast({ title: "Success", description: `${itemToDelete.type === 'review' ? 'Review' : 'Reply'} deleted successfully!` });
        fetchReviews();
      } else {
        const data = await response.json();
        toast({ title: "Error", description: data.error || `Failed to delete ${itemToDelete.type}.`, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: `Failed to delete ${itemToDelete.type}.`, variant: "destructive" });
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleDeleteReview = (reviewId: string, type: 'review' | 'reply' = 'review') => {
    setItemToDelete({ id: reviewId, type });
    setDeleteDialogOpen(true);
  };

  if (!incubator) return null;

  const isDisabled = !isLoggedIn || !hasSubscription;
  let tooltipContent = null;
  if (!isLoggedIn) {
    tooltipContent = <p>Please login to apply for incubation</p>;
  } else if (!hasSubscription) {
    tooltipContent = <p>Subscribe to a plan to apply for an incubation</p>;
  }

  const applyButton = (
    <Button
      size="lg"
      className="bg-accent hover:bg-accent/90 text-accent-foreground"
      disabled={isDisabled}
    >
      Apply Now
    </Button>
  );

  return (
    <Dialog open={!!incubator} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold font-headline">{incubator.name}</DialogTitle>
          <DialogDescription>
            Detailed overview of the program, benefits, and eligibility.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-grow mt-4">
          <div className="space-y-12 px-4">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 text-primary">
                  {incubator.type?.map(t => <Badge key={t} variant="secondary" className="px-3 py-1 bg-accent/10 border-accent/20 text-accent">{t}</Badge>)}

                </div>

                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                  {incubator.contactEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-accent" />
                      <a href={`mailto:${incubator.contactEmail}`} className="hover:text-accent transition-colors">{incubator.contactEmail}</a>
                    </div>
                  )}
                  {incubator.contactPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-accent" />
                      <span>{incubator.contactPhone}</span>
                    </div>
                  )}
                  {incubator.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-accent" />
                      <span>{incubator.location}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 items-start">
                {incubator.socialLinks?.website && (
                  <Button variant="outline" size="icon" className="h-9 w-9 border-border/50 hover:border-accent/50 group" asChild>
                    <a href={incubator.socialLinks.website} target="_blank" rel="noreferrer"><Globe className="h-4 w-4 group-hover:text-accent transition-colors" /></a>
                  </Button>
                )}
                {incubator.socialLinks?.linkedin && (
                  <Button variant="outline" size="icon" className="h-9 w-9 border-border/50 hover:border-accent/50 group" asChild>
                    <a href={incubator.socialLinks.linkedin} target="_blank" rel="noreferrer"><Linkedin className="h-4 w-4 group-hover:text-accent transition-colors" /></a>
                  </Button>
                )}
                {incubator.socialLinks?.twitter && (
                  <Button variant="outline" size="icon" className="h-9 w-9 border-border/50 hover:border-accent/50 group" asChild>
                    <a href={incubator.socialLinks.twitter} target="_blank" rel="noreferrer"><Twitter className="h-4 w-4 group-hover:text-accent transition-colors" /></a>
                  </Button>
                )}
                {incubator.socialLinks?.facebook && (
                  <Button variant="outline" size="icon" className="h-9 w-9 border-border/50 hover:border-accent/50 group" asChild>
                    <a href={incubator.socialLinks.facebook} target="_blank" rel="noreferrer"><Facebook className="h-4 w-4 group-hover:text-accent transition-colors" /></a>
                  </Button>
                )}
                {incubator.socialLinks?.instagram && (
                  <Button variant="outline" size="icon" className="h-9 w-9 border-border/50 hover:border-accent/50 group" asChild>
                    <a href={incubator.socialLinks.instagram} target="_blank" rel="noreferrer"><Instagram className="h-4 w-4 group-hover:text-accent transition-colors" /></a>
                  </Button>
                )}
                {incubator.socialLinks?.youtube && (
                  <Button variant="outline" size="icon" className="h-9 w-9 border-border/50 hover:border-accent/50 group" asChild>
                    <a href={incubator.socialLinks.youtube} target="_blank" rel="noreferrer"><Youtube className="h-4 w-4 group-hover:text-accent transition-colors" /></a>
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{incubator.metrics.startupsSupported}</div>
                  <p className="text-xs text-muted-foreground mt-1 text-nowrap">Supported</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{incubator.metrics.fundedStartupsPercent}</div>
                  <p className="text-xs text-muted-foreground mt-1 text-nowrap">Funded (%)</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{incubator.metrics.startupsOutsideLocationPercent}</div>
                  <p className="text-xs text-muted-foreground mt-1 text-nowrap">Outside (%)</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{incubator.metrics.totalFundingRaised}</div>
                  <p className="text-xs text-muted-foreground mt-1 text-nowrap">Total Funding</p>
                </CardContent>
              </Card>
            </div>

            {incubator.description && (
              <div>
                <h3 className="text-2xl font-bold mb-4 font-headline">About {incubator.name}</h3>
                <p className="text-muted-foreground">{incubator.description}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2 text-current">
              <span className="font-semibold">Focus Areas:</span> {incubator.focus?.map(area => (
                <Badge key={area} variant="outline" className="px-3 py-1 border-blue-500/20 bg-blue-500/5 text-blue-500">
                  {area}
                </Badge>
              ))}
            </div>

            {incubator.details?.overview && (
              <div>
                <h3 className="text-2xl font-bold mb-4 font-headline">Program Overview</h3>
                <p className="text-muted-foreground">{incubator.details.overview}</p>
              </div>
            )}

            {incubator.details?.services && incubator.details.services.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-2xl font-bold mb-4 font-headline">Our Services</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {incubator.details.services.map((service) => (
                      <Card key={service.title} className="bg-card/50 backdrop-blur-sm border-border/50">
                        <CardHeader className="flex flex-row items-center gap-4">
                          {serviceIcons[service.title] || <Star className="h-6 w-6 text-primary" />}
                          <CardTitle className="text-lg">{service.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}

            {incubator.details?.benefits && incubator.details.benefits.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-2xl font-bold mb-4 font-headline">Program Benefits</h3>
                  <ul className="space-y-2">
                    {incubator.details.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 mt-1 shrink-0" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {incubator.details?.eligibility && (
              <>
                <Separator />
                <div>
                  <h3 className="text-2xl font-bold mb-4 font-headline">Eligibility Criteria</h3>
                  <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardContent className="p-6 space-y-4">
                      {incubator.details.eligibility.focusAreas && (
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Focus Areas</h4>
                          <p className="text-sm text-muted-foreground">{incubator.details.eligibility.focusAreas}</p>
                        </div>
                      )}
                      {incubator.details.eligibility.requirements && incubator.details.eligibility.requirements.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Key Requirements</h4>
                          <ul className="space-y-2">
                            {incubator.details.eligibility.requirements.map((item, index) => (
                              <li key={index} className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-green-500 mt-1 shrink-0" />
                                <span className="text-muted-foreground">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {incubator.details?.timeline && incubator.details.timeline.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-2xl font-bold mb-4 font-headline">Program Timeline</h3>
                  <div className="relative border-l border-border/50 pl-6 space-y-6">
                    {incubator.details.timeline.map((item, index) => (
                      <div key={index} className="relative">
                        <div className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full bg-primary ring-8 ring-background"></div>
                        <p className="font-semibold">{item.event}</p>
                        <p className="text-sm text-muted-foreground">{item.period}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {incubator.partners && incubator.partners.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-2xl font-bold mb-4 font-headline">Recognised and Funded by</h3>
                  <div className="flex flex-wrap gap-4">
                    {incubator.partners.map((partner, index) => (
                      <Badge key={index} variant="secondary" className="px-4 py-2 text-md">
                        {partner}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="text-center bg-card/50 rounded-lg my-12 py-10">
              <h2 className="text-3xl font-bold mb-4 font-headline">Ready to Accelerate Your Startup?</h2>
              <p className="max-w-2xl mx-auto text-muted-foreground mb-8">
                Join the next cohort of {incubator.name} and take your startup to the next level.
              </p>
              {isDisabled ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>{applyButton}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {tooltipContent}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                applyButton
              )}
            </div>

            <Separator />

            {/* Ratings & Reviews Section */}
            <div className="pb-12">
              <h3 className="text-2xl font-bold mb-6 font-headline flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                Ratings & Reviews ({reviews.length})
              </h3>

              {/* Add New Review */}
              {isLoggedIn ? (
                <Card className="mb-8 border-border">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">Your Rating:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setNewRating(star)}
                            className="focus:outline-none transition-transform hover:scale-110"
                          >
                            <Star className={`h-6 w-6 ${star <= newRating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <Textarea
                      placeholder="Share your experience with this incubator..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="bg-background/50"
                    />
                    <Button
                      onClick={handleSubmitReview}
                      disabled={isSubmitting || !newComment.trim()}
                      className="bg-accent text-white"
                    >
                      {isSubmitting ? "Submitting..." : "Post Review"}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="p-4 bg-muted/30 border border-dashed rounded-lg text-center mb-8">
                  <p className="text-sm text-muted-foreground">Please log in to share your review.</p>
                </div>
              )}

              {/* Review List */}
              <div className="space-y-6">
                {isLoadingReviews ? (
                  <div className="text-center py-8 text-muted-foreground">Loading reviews...</div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No reviews yet. Be the first to review!</div>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="space-y-4">
                      <Card className="relative bg-card/30 border-border/50">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold text-current">{review.userName}</p>
                              <div className="flex gap-0.5 mt-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`h-3 w-3 ${i < (review.rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                                {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).replace(',', '')}
                              </span>
                              {review.user_id === currentUserId && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      className="text-destructive focus:text-destructive cursor-pointer"
                                      onClick={() => handleDeleteReview(review.id)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete Review
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-foreground/90 leading-relaxed">{review.comment}</p>

                          {/* Reply Logic - Restricted to owner */}
                          {isLoggedIn && incubator.is_owner && (
                            <div className="mt-4 pt-4 border-t border-border/20">
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Reply to this review..."
                                  className="h-8 text-xs bg-background/50"
                                  value={replyText[review.id] || ''}
                                  onChange={(e) => setReplyText(prev => ({ ...prev, [review.id]: e.target.value }))}
                                />
                                <LoadingButton
                                  size="sm"
                                  variant="secondary"
                                  className="h-8 px-3 text-xs"
                                  onClick={() => handleSubmitReply(review.id)}
                                  isLoading={isSubmittingReply[review.id]}
                                >
                                  Reply
                                </LoadingButton>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Threaded Replies */}
                      {review.replies?.length > 0 && (
                        <div className="ml-8 space-y-4 border-l-2 border-accent/10 pl-6">
                          {review.replies.map((reply) => (
                            <div key={reply.id} className="flex gap-3">
                              <CornerDownRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-current">{incubator.name}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                                      {new Date(reply.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).replace(',', '')}
                                    </span>
                                  </div>
                                  {reply.user_id === currentUserId && (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                                          <MoreHorizontal className="h-3 w-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                          className="text-destructive focus:text-destructive cursor-pointer"
                                          onClick={() => handleDeleteReview(reply.id, 'reply')}
                                        >
                                          <Trash2 className="h-3 w-3 mr-2" />
                                          Delete Reply
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">{reply.comment}</p>

                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your {itemToDelete?.type}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}

const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);
