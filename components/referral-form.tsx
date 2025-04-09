"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, increment, query, where, getDocs, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }),
  feedback: z.string().min(5, {
    message: "Feedback must be at least 5 characters.",
  }),
  rating: z.enum(["1", "2", "3", "4", "5"], {
    message: "Please select a rating.",
  }),
})

interface ReferralFormProps {
  referralId: string
}

export function ReferralForm({ referralId }: ReferralFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      feedback: "",
      rating: undefined,
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    
    try {
      console.log("Submitting form with values:", values)
      console.log("Referral ID:", referralId)

      // Prepare submission data
      const submissionData = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        feedback: values.feedback,
        rating: values.rating,
        referredBy: referralId || null,
        type: "referral",
      }

      console.log("Submitting data to API:", submissionData)

      // Submit via server API
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit form');
      }

      console.log("Form submission successful:", result);

      // Set submitted state to true to show success message
      setIsSubmitted(true)

      toast({
        title: "Form submitted successfully!",
        description: "Thank you for completing the survey.",
      })

      // Add longer delay before redirecting to ensure user sees confirmation
      setTimeout(() => {
        // Redirect to thank you page
        router.push("/form/thank-you");
      }, 3000);
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Error submitting form",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // If form is submitted, show success message
  if (isSubmitted) {
    return (
      <div className="rounded-md border border-green-500 bg-green-50 p-6 text-center">
        <h3 className="text-lg font-medium text-green-800 mb-2">Form Submitted Successfully!</h3>
        <p className="text-green-700 mb-4">Thank you for your valuable feedback.</p>
        <p className="text-sm text-green-600">You will be redirected to our thank you page shortly...</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="john@example.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="(123) 456-7890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>How would you rate our service?</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <FormItem key={rating} className="flex items-center space-x-1 space-y-0">
                      <FormControl>
                        <RadioGroupItem value={rating.toString()} />
                      </FormControl>
                      <FormLabel className="font-normal">{rating}</FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormDescription>1 = Poor, 5 = Excellent</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="feedback"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Feedback</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Please share any additional feedback you have..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {referralId && (
          <div className="rounded-md bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              You were referred by a friend. Thank you for using their referral link!
            </p>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </form>
    </Form>
  )
}
