"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { db } from "@/lib/firebase"
import { collection, addDoc, doc, getDoc, updateDoc, increment, serverTimestamp, query, getDocs, where, limit } from "firebase/firestore"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  city: z.string().min(2, {
    message: "City and state must be at least 2 characters.",
  }),
  healthMonitoring: z.enum(["1", "2", "3", "4", "5"], {
    message: "Please select a rating.",
  }),
  locationTracking: z.enum(["1", "2", "3", "4", "5"], {
    message: "Please select a rating.",
  }),
  activityTracking: z.enum(["1", "2", "3", "4", "5"], {
    message: "Please select a rating.",
  }),
  feedingReminders: z.enum(["1", "2", "3", "4", "5"], {
    message: "Please select a rating.",
  }),
  environmentalSensors: z.enum(["1", "2", "3", "4", "5"], {
    message: "Please select a rating.",
  }),
  smartAlerts: z.enum(["1", "2", "3", "4", "5"], {
    message: "Please select a rating.",
  }),
  mobileAppIntegration: z.enum(["1", "2", "3", "4", "5"], {
    message: "Please select a rating.",
  }),
  additionalFeatures: z.string().optional(),
  budget: z.enum(["less-than-6000", "6000-8000", "8000-10000", "more-than-10000"], {
    message: "Please select a budget range.",
  }),
  recurringCosts: z.enum(["one-time", "small-fee", "value-updates"], {
    message: "Please select your preference for recurring costs.",
  }),
  trustLevel: z.enum(["1", "2", "3", "4", "5"], {
    message: "Please select a trust level.",
  }),
  trustFactors: z.array(z.string()).min(1, {
    message: "Please select at least one trust factor.",
  }),
  comments: z.string().optional(),
})

interface PetSurveyFormProps {
  referralId: string
}

export function PetSurveyForm({ referralId }: PetSurveyFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      city: "",
      healthMonitoring: undefined,
      locationTracking: undefined,
      activityTracking: undefined,
      feedingReminders: undefined,
      environmentalSensors: undefined,
      smartAlerts: undefined,
      mobileAppIntegration: undefined,
      additionalFeatures: "",
      budget: undefined,
      recurringCosts: undefined,
      trustLevel: undefined,
      trustFactors: [],
      comments: "",
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
        city: values.city || "",
        referredBy: referralId || null,
        type: "pet-survey",
        healthMonitoring: values.healthMonitoring || "3",
        locationTracking: values.locationTracking || "3",
        activityTracking: values.activityTracking || "3",
        feedingReminders: values.feedingReminders || "3",
        environmentalSensors: values.environmentalSensors || "3",
        smartAlerts: values.smartAlerts || "3",
        mobileAppIntegration: values.mobileAppIntegration || "3",
        additionalFeatures: values.additionalFeatures || "",
        budget: values.budget || "less-than-6000",
        recurringCosts: values.recurringCosts || "one-time",
        trustLevel: values.trustLevel || "3",
        trustFactors: values.trustFactors || [],
        comments: values.comments || "",
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
        console.error("API error:", result);
        throw new Error(result.error || 'Failed to submit survey');
      }

      console.log("Form submission successful:", result);

      // Set submitted state to true to show success message
      setIsSubmitted(true)

      toast({
        title: "Survey submitted successfully!",
        description: "Thank you for completing the survey.",
      })

      // Add longer delay before redirecting to ensure user sees confirmation
      setTimeout(() => {
        // Redirect to thank you page
        router.push("/form/thank-you");
      }, 3000);
    } catch (error) {
      console.error("Error in form submission process:", error)
      toast({
        title: "Error submitting survey",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const trustFactorsOptions = [
    { id: "reviews", label: "Positive reviews and testimonials" },
    { id: "transparency", label: "Transparent product information and safety certifications" },
    { id: "guarantee", label: "Money-back guarantee or trial period" },
    { id: "endorsements", label: "Endorsements from veterinarians" },
    { id: "roadmap", label: "A clear and well-defined product roadmap" },
  ]

  // If form is submitted, show success message
  if (isSubmitted) {
    return (
      <div className="rounded-md border border-green-500 bg-green-50 p-6 text-center">
        <h3 className="text-lg font-medium text-green-800 mb-2">Survey Submitted Successfully!</h3>
        <p className="text-green-700 mb-4">Thank you for your valuable feedback.</p>
        <p className="text-sm text-green-600">You will be redirected to our thank you page shortly...</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City and State</FormLabel>
              <FormControl>
                <Input placeholder="New York, NY" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Feature Importance</h3>
          <p className="text-sm text-muted-foreground">
            Rate how important each feature is to you (1 = Not Important, 5 = Very Important)
          </p>

          <FormField
            control={form.control}
            name="healthMonitoring"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>Health Monitoring</FormLabel>
                  <span className="text-sm">{field.value || "3"}/5</span>
                </div>
                <FormControl>
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    defaultValue={[3]}
                    onValueChange={(value) => field.onChange(value[0].toString())}
                    value={field.value ? [Number.parseInt(field.value)] : [3]}
                  />
                </FormControl>
                <FormDescription>Real-time tracking of vital signs and health metrics</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="locationTracking"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>Location Tracking</FormLabel>
                  <span className="text-sm">{field.value || "3"}/5</span>
                </div>
                <FormControl>
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    defaultValue={[3]}
                    onValueChange={(value) => field.onChange(value[0].toString())}
                    value={field.value ? [Number.parseInt(field.value)] : [3]}
                  />
                </FormControl>
                <FormDescription>GPS tracking and safe zone alerts</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="activityTracking"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>Activity Tracking</FormLabel>
                  <span className="text-sm">{field.value || "3"}/5</span>
                </div>
                <FormControl>
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    defaultValue={[3]}
                    onValueChange={(value) => field.onChange(value[0].toString())}
                    value={field.value ? [Number.parseInt(field.value)] : [3]}
                  />
                </FormControl>
                <FormDescription>Monitoring exercise, sleep, and daily activity</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="feedingReminders"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>Feeding Reminders</FormLabel>
                  <span className="text-sm">{field.value || "3"}/5</span>
                </div>
                <FormControl>
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    defaultValue={[3]}
                    onValueChange={(value) => field.onChange(value[0].toString())}
                    value={field.value ? [Number.parseInt(field.value)] : [3]}
                  />
                </FormControl>
                <FormDescription>Scheduled feeding alerts and nutrition tracking</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="environmentalSensors"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>Environmental Sensors</FormLabel>
                  <span className="text-sm">{field.value || "3"}/5</span>
                </div>
                <FormControl>
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    defaultValue={[3]}
                    onValueChange={(value) => field.onChange(value[0].toString())}
                    value={field.value ? [Number.parseInt(field.value)] : [3]}
                  />
                </FormControl>
                <FormDescription>Temperature, humidity, and air quality monitoring</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="smartAlerts"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>Smart Alerts</FormLabel>
                  <span className="text-sm">{field.value || "3"}/5</span>
                </div>
                <FormControl>
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    defaultValue={[3]}
                    onValueChange={(value) => field.onChange(value[0].toString())}
                    value={field.value ? [Number.parseInt(field.value)] : [3]}
                  />
                </FormControl>
                <FormDescription>Notifications for unusual behavior or emergencies</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mobileAppIntegration"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>Mobile App Integration</FormLabel>
                  <span className="text-sm">{field.value || "3"}/5</span>
                </div>
                <FormControl>
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    defaultValue={[3]}
                    onValueChange={(value) => field.onChange(value[0].toString())}
                    value={field.value ? [Number.parseInt(field.value)] : [3]}
                  />
                </FormControl>
                <FormDescription>Smartphone app with analytics and remote control</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="additionalFeatures"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Features</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Please share any other features you'd like to see..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Budget and Preferences</h3>

          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>What is your budget for a pet care device?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="less-than-6000" />
                      </FormControl>
                      <FormLabel className="font-normal">Less than ₹6,000</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="6000-8000" />
                      </FormControl>
                      <FormLabel className="font-normal">₹6,000 - ₹8,000</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="8000-10000" />
                      </FormControl>
                      <FormLabel className="font-normal">₹8,000 - ₹10,000</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="more-than-10000" />
                      </FormControl>
                      <FormLabel className="font-normal">More than ₹10,000</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="recurringCosts"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>How do you feel about recurring costs for additional features?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="one-time" />
                      </FormControl>
                      <FormLabel className="font-normal">I prefer a one-time payment only</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="small-fee" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        I'm willing to pay a small monthly fee for premium features
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="value-updates" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        I value ongoing updates and am willing to pay a recurring fee
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="trustLevel"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>How much do you trust new pet technology products?</FormLabel>
                  <span className="text-sm">{field.value || "3"}/5</span>
                </div>
                <FormControl>
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    defaultValue={[3]}
                    onValueChange={(value) => field.onChange(value[0].toString())}
                    value={field.value ? [Number.parseInt(field.value)] : [3]}
                  />
                </FormControl>
                <FormDescription>1 = Very skeptical, 5 = Very trusting</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="trustFactors"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base">What would increase your trust in a pet device?</FormLabel>
                  <FormDescription>Select all that apply</FormDescription>
                </div>
                {trustFactorsOptions.map((item) => (
                  <FormField
                    key={item.id}
                    control={form.control}
                    name="trustFactors"
                    render={({ field }) => {
                      return (
                        <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, item.id])
                                  : field.onChange(field.value?.filter((value) => value !== item.id))
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">{item.label}</FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="comments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Comments</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Please share any additional thoughts or feedback..."
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
            "Submit Survey"
          )}
        </Button>
      </form>
    </Form>
  )
}
