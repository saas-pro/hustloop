"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, Send, ArrowLeft, User, ShieldCheck, MessageCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  id: string;
  submission_id: string;
  sender_id: string;
  message: string;
  sender_name?: string;
  sender_role?: string;
  created_at: string;
}

export default function IdeaChatPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { toast } = useToast();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Current user info
  const userId = typeof window !== 'undefined' ? localStorage.getItem("uid") || localStorage.getItem("userId") || "" : "";
  const userRole = typeof window !== 'undefined' ? localStorage.getItem("role") || "" : "";

  useEffect(() => {
    // 1. Fetch existing messages via REST API
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/founder-ideas/${id}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        } else {
          toast({ title: "Error", description: "Failed to load chat history", variant: "destructive" });
        }
      } catch (err) {
        toast({ title: "Error", description: "Failed to load chat history", variant: "destructive" });
      } finally {
        setLoading(false);
        scrollToBottom();
      }
    };

    fetchMessages();

    // 2. Setup Socket.IO connection
    socketRef.current = io(API_BASE_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling']
    });

    socketRef.current.on('connect', () => {
      socketRef.current?.emit('join_idea_chat', { submissionId: id });
    });

    socketRef.current.on('new_idea_message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
      scrollToBottom();
    });

    return () => {
      socketRef.current?.emit('leave_idea_chat', { submissionId: id });
      socketRef.current?.disconnect();
    };
  }, [id, toast]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current) return;

    setSending(true);
    socketRef.current.emit('send_idea_message', {
      submissionId: id,
      senderId: userId,
      message: newMessage.trim()
    });

    setNewMessage("");
    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 mx-auto h-[calc(100vh-80px)] flex flex-col">
      <Button
        variant="ghost"
        className="w-fit mb-4"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Ideas
      </Button>

      <Card className="flex-1 flex flex-col overflow-hidden shadow-md">
        <CardHeader className="bg-muted/30 border-b pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Discussion for Submission
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 p-0 overflow-hidden relative">
          <ScrollArea className="h-full w-full p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground italic">
                No messages yet. Be the first to start the conversation!
              </div>
            ) : (
              <div className="space-y-4 pb-4">
                {messages.map((msg) => {
                  const isMe = msg.sender_id === userId;
                  const isAdmin = msg.sender_role === 'admin';

                  return (
                    <div
                      key={msg.id}
                      className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-2 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                        <Avatar className="w-8 h-8 border">
                          <AvatarFallback className={isAdmin ? "bg-primary/20 text-primary" : "bg-muted"}>
                            {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
                          </AvatarFallback>
                        </Avatar>

                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-muted-foreground">
                              {isMe ? 'You' : msg.sender_name || 'User'} {isAdmin && !isMe && '(Admin)'}
                            </span>
                            <span className="text-[10px] text-muted-foreground/70">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div
                            className={`px-4 py-2 rounded-2xl text-sm ${isMe
                                ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                : 'bg-muted text-foreground rounded-tl-sm border border-border/50'
                              }`}
                          >
                            {msg.message}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>

        <CardFooter className="p-4 bg-muted/20 border-t mt-auto">
          <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message here..."
              className="flex-1"
              disabled={sending}
            />
            <Button type="submit" size="icon" disabled={!newMessage.trim() || sending}>
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
