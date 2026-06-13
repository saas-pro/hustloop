import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

const ideaSchema = z.object({
  startup_name: z.string().min(2, "Startup name is required"),
  industry_sector: z.string().min(2, "Industry sector is required"),
  problem_statement: z.string().min(10, "Problem statement must be at least 10 characters"),
  solution: z.string().min(10, "Solution must be at least 10 characters"),
  target_market: z.string().min(10, "Target market is required"),
  competitors: z.string().min(10, "Competitors information is required"),
  business_model: z.string().min(10, "Business model is required"),
  traction: z.string().optional(),
  team_background: z.string().min(10, "Team background is required"),
  ask_amount: z.string().optional(),
});

type IdeaFormValues = z.infer<typeof ideaSchema>;

const STEPS = [
  { id: "basic", title: "Basic Info", fields: ["startup_name", "industry_sector"] },
  { id: "problem", title: "Problem & Solution", fields: ["problem_statement", "solution"] },
  { id: "market", title: "Market & Competition", fields: ["target_market", "competitors"] },
  { id: "business", title: "Business & Traction", fields: ["business_model", "traction"] },
  { id: "team", title: "Team & Ask", fields: ["team_background", "ask_amount"] },
];

interface FounderIdeaSubmissionProps {
  incubatorId?: string;
}

export function FounderIdeaSubmission({ incubatorId }: FounderIdeaSubmissionProps = {}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<IdeaFormValues>({
    resolver: zodResolver(ideaSchema),
    defaultValues: {
      startup_name: "",
      industry_sector: "",
      problem_statement: "",
      solution: "",
      target_market: "",
      competitors: "",
      business_model: "",
      traction: "",
      team_background: "",
      ask_amount: "",
    },
    mode: "onChange"
  });

  const nextStep = async () => {
    const fields = STEPS[currentStep].fields as Array<keyof IdeaFormValues>;
    const isValid = await form.trigger(fields);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = async (data: IdeaFormValues) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/founder-ideas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          assigned_incubator_id: incubatorId || null
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit idea");
      }

      toast({
        title: "Success",
        description: "Your idea has been submitted successfully!",
      });
      form.reset();
      setCurrentStep(0);
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem submitting your idea.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Submit Your Startup Idea</CardTitle>
        <CardDescription>
          Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].title}
        </CardDescription>
        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
          <div 
            className="bg-primary h-full transition-all" 
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {currentStep === 0 && (
              <>
                <FormField
                  control={form.control}
                  name="startup_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Startup Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="industry_sector"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry Sector</FormLabel>
                      <FormControl><Input {...field} placeholder="e.g., FinTech, HealthTech" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {currentStep === 1 && (
              <>
                <FormField
                  control={form.control}
                  name="problem_statement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Problem Statement</FormLabel>
                      <FormControl><Textarea rows={4} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="solution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Solution</FormLabel>
                      <FormControl><Textarea rows={4} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {currentStep === 2 && (
              <>
                <FormField
                  control={form.control}
                  name="target_market"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Market</FormLabel>
                      <FormControl><Textarea rows={3} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="competitors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Competitors</FormLabel>
                      <FormControl><Textarea rows={3} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {currentStep === 3 && (
              <>
                <FormField
                  control={form.control}
                  name="business_model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Model</FormLabel>
                      <FormControl><Textarea rows={3} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="traction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Traction (Optional)</FormLabel>
                      <FormControl><Textarea rows={3} {...field} placeholder="Any current metrics or milestones" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {currentStep === 4 && (
              <>
                <FormField
                  control={form.control}
                  name="team_background"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Background</FormLabel>
                      <FormControl><Textarea rows={4} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ask_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>The Ask (Optional)</FormLabel>
                      <FormControl><Input {...field} placeholder="e.g., $500,000 for 10% equity" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
            <CardFooter className="flex justify-between px-0 pt-4 border-t mt-6">
              <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 0 || isSubmitting}>
                Back
              </Button>
              {currentStep < STEPS.length - 1 ? (
                <Button type="button" onClick={nextStep}>Next</Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Submit Idea
                </Button>
              )}
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
