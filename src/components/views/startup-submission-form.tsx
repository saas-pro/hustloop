"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api";
import { Check, ChevronRight, ChevronLeft, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const InputField = ({ label, name, required = false, type = "text", placeholder = "", maxLength = 100, formData, onChange }: any) => {
  const value = (formData as any)[name] || "";
  const isAtLimit = value.toString().length >= maxLength;
  return (
    <div className="space-y-2 w-full">
      <div className="flex justify-between items-center px-1">
        <Label className={required ? "after:content-['*'] after:ml-0.5 after:text-destructive" : ""}>{label}</Label>
        <span className={`text-xs ${isAtLimit ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>{value.toString().length}/{maxLength}</span>
      </div>
      <Input
        type={type} name={name} required={required} placeholder={placeholder} maxLength={maxLength}
        value={value} onChange={onChange}
        className={isAtLimit ? 'border-destructive focus-visible:ring-destructive' : ''}
      />
    </div>
  );
};

const TextAreaField = ({ label, name, required = false, rows = 3, placeholder = "", maxLength = 500, formData, onChange }: any) => {
  const value = (formData as any)[name] || "";
  const isAtLimit = value.toString().length >= maxLength;
  return (
    <div className="space-y-2 w-full">
      <div className="flex justify-between items-center px-1">
        <Label className={required ? "after:content-['*'] after:ml-0.5 after:text-destructive" : ""}>{label}</Label>
        <span className={`text-xs ${isAtLimit ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>{value.toString().length}/{maxLength}</span>
      </div>
      <Textarea
        name={name} required={required} rows={rows} placeholder={placeholder} maxLength={maxLength}
        value={value} onChange={onChange}
        className={isAtLimit ? 'border-destructive focus-visible:ring-destructive min-h-[80px]' : 'min-h-[80px]'}
      />
    </div>
  );
};

interface StartupSubmissionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIncubatorId?: string | null;
  onSuccess?: (incubatorId: string) => void;
}

export default function StartupSubmissionForm({ open, onOpenChange, selectedIncubatorId, onSuccess }: StartupSubmissionFormProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);

  useEffect(() => {
    if (currentStep === 3) {
      const timer = setTimeout(() => setCanSubmit(true), 500);
      return () => clearTimeout(timer);
    } else {
      setCanSubmit(false);
    }
  }, [currentStep]);

  const [formData, setFormData] = useState({
    startup_name: "",
    industry_sector: "",
    problem_statement: "",
    solution: "",
    team_background: "",
    mission: "",
    vision: "",
    target_market: "",
    market_analysis: "",
    pam: "",
    sam: "",
    som: "",
    usp: "",
    market_opportunity: "",
    competitors: "",
    competitor_analysis: "",
    bmc: "",
    revenue_model: "",
    go_to_market_strategy: "",
    traction: "",
    roadmap_first_6_months: "",
    cap_table: "",
    ask_amount: "",
  });

  const [prototypeFile, setPrototypeFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPrototypeFile(e.target.files[0]);
    }
  };

  const validateStep1 = () => {
    if (!formData.startup_name || !formData.industry_sector || !formData.problem_statement || !formData.solution || !formData.team_background) {
      toast({ title: "Required Fields Missing", description: "Please fill out all required fields marked with an asterisk (*).", variant: "destructive" });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.target_market || !formData.competitors) {
      toast({ title: "Required Fields Missing", description: "Please fill out all required fields marked with an asterisk (*).", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent Enter key from submitting the form prematurely
    if (currentStep < 3) {
      handleNext();
      return;
    }

    if (!validateStep1() || !validateStep2()) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const submitData = new FormData();

      // Append text fields
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });

      // Append file
      if (prototypeFile) {
        submitData.append("prototype_screenshot", prototypeFile);
      }

      if (selectedIncubatorId) {
        submitData.append("assigned_incubator_id", selectedIncubatorId);
      }

      const response = await fetch(`${API_BASE_URL}/api/founder-ideas`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: submitData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit idea");
      }

      toast({
        title: "Success",
        description: "Your startup idea has been submitted successfully. Our admin team will review it and, if approved, forward it to a suitable incubator."
      });

      if (selectedIncubatorId && onSuccess) {
        onSuccess(selectedIncubatorId);
      }

      onOpenChange(false);
      // Reset form
      setCurrentStep(1);
      setFormData({
        startup_name: "", industry_sector: "", problem_statement: "", solution: "", team_background: "", mission: "", vision: "",
        target_market: "", market_analysis: "", pam: "", sam: "", som: "", usp: "", market_opportunity: "", competitors: "", competitor_analysis: "",
        bmc: "", revenue_model: "", go_to_market_strategy: "", traction: "", roadmap_first_6_months: "", cap_table: "", ask_amount: ""
      });
      setPrototypeFile(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to submit your idea. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="w-[95vw] md:max-w-4xl max-h-[95vh] flex flex-col p-0 overflow-hidden bg-background rounded-xl">
        <DialogHeader className="p-4 md:p-6 pb-2 md:pb-4 border-b">
          <DialogTitle className="text-2xl font-bold">Submit Your Startup Idea</DialogTitle>
          <DialogDescription>
            Fill out the details below. Our admin team will review your submission and forward it to a suitable incubator.
          </DialogDescription>

          {/* Progress Indicator */}
          <div className="flex items-start justify-between mt-6 mb-4 max-w-lg mx-auto w-full relative">
            <div className="absolute left-0 top-4 -translate-y-1/2 w-full h-1 bg-muted rounded-full overflow-hidden z-0">
              <div className="h-full bg-primary transition-all duration-300" style={{ width: `${((currentStep - 1) / 2) * 100}%` }}></div>
            </div>
            {[1, 2, 3].map((step) => (
              <div key={step} className="relative z-10 flex flex-col items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${currentStep > step ? 'bg-primary text-primary-foreground' : currentStep === step ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' : 'bg-muted text-muted-foreground'}`}>
                  {currentStep > step ? <Check className="w-4 h-4" /> : step}
                </div>
                <span className={`text-xs font-semibold w-max ${currentStep >= step ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step === 1 ? 'Basics' : step === 2 ? 'Market & Biz' : 'Product'}
                </span>
              </div>
            ))}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-scroll p-4 md:p-6">
          <form id="startup-submission-form" onSubmit={handleSubmit} className="px-1 md:px-2 py-4">

            {/* STEP 1: Basics */}
            <div className={currentStep === 1 ? "space-y-6 animate-in fade-in slide-in-from-bottom-4" : "hidden"}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField formData={formData} onChange={handleInputChange} label="Startup Name" name="startup_name" required placeholder="e.g. Acme Corp" />
                <InputField formData={formData} onChange={handleInputChange} label="Industry Sector" name="industry_sector" required placeholder="e.g. SaaS, EdTech, FinTech" />
              </div>
              <TextAreaField formData={formData} onChange={handleInputChange} label="Problem Statement" name="problem_statement" required placeholder="What problem are you solving?" />
              <TextAreaField formData={formData} onChange={handleInputChange} label="Solution" name="solution" required placeholder="How does your startup solve this problem?" />
              <TextAreaField formData={formData} onChange={handleInputChange} label="Team Background" name="team_background" required placeholder="Briefly describe your team's background and expertise." />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextAreaField formData={formData} onChange={handleInputChange} label="Mission" name="mission" placeholder="What is your startup's mission?" />
                <TextAreaField formData={formData} onChange={handleInputChange} label="Vision" name="vision" placeholder="What is your long-term vision?" />
              </div>
            </div>

            {/* STEP 2: Market & Business */}
            <div className={currentStep === 2 ? "space-y-6 animate-in fade-in slide-in-from-bottom-4" : "hidden"}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextAreaField formData={formData} onChange={handleInputChange} label="Target Market" name="target_market" required placeholder="Who is your target audience?" />
                <TextAreaField formData={formData} onChange={handleInputChange} label="Competitors" name="competitors" required placeholder="List your main competitors" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField formData={formData} onChange={handleInputChange} label="PAM (Potential Available Market)" name="pam" placeholder="e.g. ₹10B" />
                <InputField formData={formData} onChange={handleInputChange} label="SAM (Serviceable Available Market)" name="sam" placeholder="e.g. ₹2B" />
                <InputField formData={formData} onChange={handleInputChange} label="SOM (Serviceable Obtainable Market)" name="som" placeholder="e.g. ₹50M" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextAreaField formData={formData} onChange={handleInputChange} label="Market Analysis" name="market_analysis" placeholder="Describe current market trends and conditions" />
                <TextAreaField formData={formData} onChange={handleInputChange} label="Market Opportunity" name="market_opportunity" placeholder="Explain the specific gap or opportunity" />
                <TextAreaField formData={formData} onChange={handleInputChange} label="USP (Unique Selling Proposition)" name="usp" placeholder="What makes your product/service unique?" />
                <TextAreaField formData={formData} onChange={handleInputChange} label="Competitor Analysis" name="competitor_analysis" placeholder="How do you compare against competitors?" />
                <TextAreaField formData={formData} onChange={handleInputChange} label="Business Model Canvas (BMC)" name="bmc" placeholder="Summarize key partners, activities, resources, etc." />
                <TextAreaField formData={formData} onChange={handleInputChange} label="Revenue Model" name="revenue_model" placeholder="How will you make money? (e.g. Subscriptions)" />

              </div>
              <TextAreaField formData={formData} onChange={handleInputChange} label="Go-To-Market Strategy" name="go_to_market_strategy" placeholder="How will you reach your first customers?" />
            </div>

            {/* STEP 3: Product & Documents */}
            <div className={currentStep === 3 ? "space-y-6 animate-in fade-in slide-in-from-bottom-4" : "hidden"}>
              <div className="space-y-2 p-4 border-2 border-dashed rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <label className="text-sm font-semibold flex items-center gap-2 mb-2 cursor-pointer">
                  <Upload className="w-4 h-4 text-primary" />
                  Product Demo / Prototype Screenshot
                </label>
                <input
                  type="file" accept="image/*,.pdf" onChange={handleFileChange}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-2">Upload an image or PDF showing your prototype (Optional)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextAreaField formData={formData} onChange={handleInputChange} label="Traction" name="traction" placeholder="Any current users, revenue, or pilots?" />
                <TextAreaField formData={formData} onChange={handleInputChange} label="Roadmap (First 6 Months)" name="roadmap_first_6_months" placeholder="Key milestones for the next 6 months" />
                <TextAreaField formData={formData} onChange={handleInputChange} label="Cap Table" name="cap_table" placeholder="e.g. Founders: 80%, Option Pool: 20%" />
                <InputField formData={formData} onChange={handleInputChange} label="Ask Amount" name="ask_amount" placeholder="e.g. 50000" />
              </div>

              <div className="bg-primary/10 text-primary p-4 rounded-lg text-sm font-medium mt-4">
                Note: Your pitch deck PDF will be automatically generated based on the information provided in these steps.
              </div>
            </div>

          </form>
        </ScrollArea>
        <div className="p-4 md:p-6 pt-3 md:pt-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4 bg-background rounded-b-xl">
          <Button type="button" variant="outline" onClick={handlePrevious} disabled={currentStep === 1} className="gap-2 w-full sm:w-auto">
            <ChevronLeft className="w-4 h-4" /> Previous
          </Button>
          <div className="flex gap-3">
            {currentStep < 3 ? (
              <Button type="button" onClick={handleNext} className="gap-2 bg-[#4a00e0] hover:bg-[#3a00b0]">
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button type="submit" form="startup-submission-form" disabled={isSubmitting || !canSubmit} className="gap-2 bg-green-600 hover:bg-green-700 text-white font-bold">
                {isSubmitting ? "Submitting..." : "Submit Startup Idea"} <Check className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
