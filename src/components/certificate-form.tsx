"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { UserRound, Mail, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GraduationCap } from "lucide-react"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  teamId: z.number().min(1, {
    message: "Team ID is required.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

export function CertificateForm() {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      teamId: 0,
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsGenerating(true);
      
      // Ensure teamId is a number
      const payload = {
        ...values,
        teamId: Number(values.teamId)
      };
      
      console.log("Submitting form with values:", payload);

      const response = await fetch("/api/verify-and-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Show error message
        toast({
          title: "Error",
          description: data.message || "Participant details not found in registered list",
          variant: "destructive",
        });
        return;
      }

      // Success - show success message
      toast({
        title: "Success! 🎉",
        description: "Your certificate has been generated successfully!",
        variant: "default",
      });

      // Download the certificate
      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${data.data}`;
      link.download = `${values.name.replace(/\s+/g, "_")}_Certificate.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Reset form
      form.reset();

    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">Name</FormLabel>
              <FormControl>
                <div className="relative">
                  <UserRound className="absolute left-3 top-3 h-4 w-4 text-black/60" />
                  <Input 
                    placeholder="John Doe" 
                    {...field} 
                    className="w-full pl-10 py-2 bg-transparent border border-black/20 rounded-md text-black placeholder:text-black/50 focus:outline-none focus:border-blue-400 focus:ring-2" 
                  />
                </div>
              </FormControl>
              <FormDescription className="text-black/70 text-xs">
                Enter your name exactly as registered for the event.
              </FormDescription>
              <FormMessage className="text-red-600" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-black/60" />
                  <Input 
                    type="email" 
                    placeholder="john@example.com" 
                    {...field} 
                    className="pl-10 bg-white/10 border-black/20 text-black placeholder:text-black/50 focus:border-blue-400 focus:ring-blue-400/20" 
                  />
                </div>
              </FormControl>
              <FormDescription className="text-black/70 text-xs">
                Enter the email you used during registration.
              </FormDescription>
              <FormMessage className="text-red-600" />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="teamId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">Team ID</FormLabel>
              <FormControl>
                <div className="relative">
                  <UserRound className="absolute left-3 top-3 h-4 w-4 text-black/60" />
                  <Input 
                    type="number"
                    placeholder="Enter your team ID" 
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : 0)}
                    value={field.value || ''}
                    className="pl-10 bg-white/10 border-black/20 text-black placeholder:text-black/50 focus:border-blue-400 focus:ring-blue-400/20" 
                  />
                </div>
              </FormControl>
              <FormDescription className="text-black/70 text-xs">
                Enter your team ID as provided during registration.
              </FormDescription>
              <FormMessage className="text-red-600" />
            </FormItem>
          )}
        /> 

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <button 
            type="submit" 
            className="w-full bg-black hover:from-blue-500 hover:to-violet-600 text-white border-0 py-2.5 rounded-md shadow-lg shadow-blue-500/30 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Verifying & Generating...</span>
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                <span>Verify & Download Certificate</span>
              </>
            )}
          </button>
        </motion.div>
      </form>
    </Form>
  )
}