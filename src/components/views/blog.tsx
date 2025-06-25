
"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import BlogPostDetails from "./blog-post-details";

export type BlogPost = {
  title: string;
  image: string;
  hint: string;
  excerpt: string;
  content: string;
};

const blogPosts: BlogPost[] = [
  {
    title: "The Future of Startups: Trends to Watch in 2024",
    image: "https://placehold.co/600x400.png",
    hint: "startup future",
    excerpt: "Discover the key trends shaping the startup ecosystem this year, from AI integration to sustainable business models...",
    content: "The startup world is in a constant state of flux, and 2024 is no exception. As we move further into the decade, several key trends are emerging that will define the next generation of successful companies.\n\nOne of the most significant trends is the deepening integration of Artificial Intelligence. It's no longer just about AI-powered features; it's about building companies with AI at their core. From generative AI creating content to predictive analytics driving business decisions, startups that leverage AI effectively will have a massive competitive edge.\n\nSustainability is another crucial factor. Consumers and investors alike are demanding more from businesses than just profits. Startups that incorporate sustainable practices into their business models, whether through green technology, circular economy principles, or social impact initiatives, are not only doing good but also building stronger, more resilient brands.\n\nFinally, the rise of remote work has permanently altered the landscape. This opens up a global talent pool but also presents new challenges in company culture and collaboration. Successful startups will be those that master the art of distributed teams, fostering a strong sense of community and purpose regardless of physical location."
  },
  {
    title: "How to Find the Perfect Mentor for Your Business",
    image: "https://placehold.co/600x400.png",
    hint: "business mentorship",
    excerpt: "A good mentor can be a game-changer. Here's our guide to finding one who aligns with your vision and goals.",
    content: "Finding the right mentor can be one of the most impactful decisions an entrepreneur makes. A great mentor provides not just advice, but also guidance, support, and a crucial sounding board for your ideas. But how do you find the one?\n\nFirst, define what you're looking for. Are you seeking expertise in a specific area like marketing or finance? Or are you looking for someone with general entrepreneurial experience who can guide your overall strategy? Be clear about your needs.\n\nSecond, leverage your network. Your existing connections are often the best starting point. Let colleagues, friends, and industry contacts know you're looking. Platforms like LinkedIn can also be a powerful tool for identifying potential mentors outside your immediate circle.\n\nThird, when you reach out, be specific and respectful of their time. Clearly articulate why you're interested in their guidance and what you hope to achieve. A well-thought-out request is much more likely to get a positive response than a generic one.\n\nRemember, a mentorship is a two-way street. Be prepared to be an engaged and proactive mentee. The more you put into the relationship, the more you'll get out of it."
  },
  {
    title: "Navigating the World of Venture Capital",
    image: "https://placehold.co/600x400.png",
    hint: "venture capital",
    excerpt: "Securing funding is a major milestone. Learn the ins and outs of pitching to venture capitalists and what they look for.",
    content: "The world of venture capital (VC) can seem intimidating from the outside, but with the right preparation, you can navigate it successfully. Securing VC funding is about more than just having a great idea; it's about proving you have a scalable business.\n\nBefore you even think about pitching, do your homework. Research VC firms that specialize in your industry and stage of business. A targeted approach is far more effective than a scattergun one.\n\nYour pitch deck is your key to opening doors. It should be clear, concise, and compelling. It needs to tell a story: what problem are you solving, what is your solution, who is your team, what is your market size, and how will you make money? Don't forget to include your financial projections and how much you're looking to raise.\n\nWhen you get a meeting, be prepared for tough questions. VCs want to see that you know your business and your market inside and out. They are investing in you as much as your idea. Show them you have the passion, resilience, and vision to lead your company to success."
  },
];

interface BlogViewProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function BlogView({ isOpen, onOpenChange }: BlogViewProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

 return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-5xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-center mb-4 font-headline">Our Blog</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-full">
 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
 {blogPosts.map((post, index) => (
                  <Card key={index} className="flex flex-col bg-card/50 backdrop-blur-sm border-border/50">
                      <CardHeader>
 <Image src={post.image} alt={post.title} width={600} height={400} className="rounded-t-lg" data-ai-hint={post.hint}/>
                      <CardTitle className="pt-4">{post.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow">
 <p className="text-muted-foreground">{post.excerpt}</p>
                      </CardContent>
                      <CardFooter>
 <Button variant="link" className="p-0" onClick={() => setSelectedPost(post)}>Read More →</Button>
                      </CardFooter>
                  </Card>
                  ))}
 </div>
 <div className="mt-12 p-4">
 <div className="grid md:grid-cols-2 gap-8">
                  <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        Event Registration
 <Badge variant="secondary">Coming Soon</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
 <p className="text-muted-foreground">Register for upcoming events and webinars directly from this portal.</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        Newsletter Subscription
 <Badge variant="secondary">Coming Soon</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
 <p className="text-muted-foreground">Stay updated with the latest news and insights. Subscribe to our newsletter!</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      <BlogPostDetails post={selectedPost} onOpenChange={(isOpen) => !isOpen && setSelectedPost(null)} />
    </>
  );
}
