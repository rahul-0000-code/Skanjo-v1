import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Check,
  CreditCard,
  Key,
  Copy,
  CheckCircle,
  Shield,
  Clock,
  Star,
  Users,
  Zap,
  Award,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  updateUserProfile,
  createFeatureKey,
  createSubscription,
  getPaymentStatus,
  // cancelPayment,
  PaymentOrderResponse,
  PaymentStatusResponse,
} from "@/services/apiService";
import { AuthContext } from "@/auth/AuthContext";

const profileSchema = z.object({
  industry: z.string().min(2, "Industry is required"),
  company_size: z.string().min(1, "Company size is required"),
  country: z.string().min(2, "Country is required"),
  job_title: z.string().min(2, "Job title is required"),
  website: z.string().url("Enter a valid website URL"),
  linkedin_url: z.string().url("Enter a valid LinkedIn URL"),
  how_did_you_hear: z.string().min(2, "This field is required"),
  interested_features: z.string().min(2, "This field is required"),
  marketing_opt_in: z.boolean(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrderResponse | null>(
    null
  );
  const [paymentStatus, setPaymentStatus] =
    useState<PaymentStatusResponse | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPollingPayment, setIsPollingPayment] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [isGeneratingApiKey, setIsGeneratingApiKey] = useState(false);
  const { user } = useContext(AuthContext);

  // Get plan details from location state
  const plan = location.state?.plan || {
    name: "Starter",
    price: "Free",
    description: "Perfect for exploring your career potential",
  };

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      industry: "",
      company_size: "",
      country: "",
      job_title: "",
      website: "",
      linkedin_url: "",
      how_did_you_hear: "",
      interested_features: "",
      marketing_opt_in: false,
    },
  });

  // Generate API key function
  const generateApiKey = async (planType: string) => {
    if (!user?.api_key) {
      throw new Error("User API key missing");
    }

    try {
      setIsGeneratingApiKey(true);
      console.log("Generating API key for plan:", planType);
      
      const featureKeyRes = await createFeatureKey(
        user.api_key,
        undefined,
        planType
      );
      
      console.log("Feature key response:", featureKeyRes);
      
      if (featureKeyRes?.feature_key) {
        setApiKey(featureKeyRes.feature_key);
        console.log("API key set successfully:", featureKeyRes.feature_key);
        return featureKeyRes.feature_key;
      } else {
        throw new Error("No feature key received from server");
      }
    } catch (error) {
      console.error("Error generating API key:", error);
      throw error;
    } finally {
      setIsGeneratingApiKey(false);
    }
  };

  // Handle payment status polling
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    let pollCount = 0;
    const maxPolls = 60; // Maximum 3 minutes of polling (60 * 3 seconds)

    if (isPollingPayment && paymentOrder?.order_id && user?.api_key) {
      console.log("Starting payment status polling for order:", paymentOrder.order_id);
      
      pollInterval = setInterval(async () => {
        try {
          pollCount++;
          console.log(`Payment polling attempt ${pollCount}/${maxPolls}`);
          
          const status = await getPaymentStatus(
            user.api_key,
            paymentOrder.order_id
          );
          
          console.log("Payment status response:", status);
          setPaymentStatus(status);

          if (status.status === "success") {
            console.log("Payment successful, stopping polling");
            setIsPollingPayment(false);
            
            // Generate feature key after successful payment
            try {
              let planApiValue = "free";
              if (plan.name === "Professional") planApiValue = "pro";
              else if (plan.name === "Enterprise") planApiValue = "enterprise";

              console.log("Attempting to generate API key for plan:", planApiValue);
              const generatedKey = await generateApiKey(planApiValue);

              toast({
                title: "Payment Successful!",
                description: "Your subscription is now active. API key generated.",
              });

              console.log("Process completed successfully with API key:", generatedKey);
            } catch (err: any) {
              console.error("Feature key generation failed:", err);
              toast({
                title: "Payment Successful, but API Key Error",
                description: "Payment was successful but there was an issue generating your API key. Please contact support.",
                variant: "destructive",
              });
            }
          } else if (
            status.status === "failed" ||
            status.status === "cancelled"
          ) {
            console.log("Payment failed/cancelled, stopping polling");
            setIsPollingPayment(false);
            toast({
              title: "Payment Failed",
              description: "Your payment was not successful. Please try again.",
              variant: "destructive",
            });
          } else if (pollCount >= maxPolls) {
            console.log("Payment polling timeout reached");
            setIsPollingPayment(false);
            toast({
              title: "Payment Status Timeout",
              description: "Unable to confirm payment status. Please contact support if payment was deducted.",
              variant: "destructive",
            });
          }
        } catch (error: any) {
          console.error("Payment status polling error:", error);
          pollCount++;
          
          if (pollCount >= maxPolls) {
            setIsPollingPayment(false);
            toast({
              title: "Payment Status Error",
              description: "Unable to check payment status. Please contact support.",
              variant: "destructive",
            });
          }
        }
      }, 3000); // Poll every 3 seconds
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
}, [
  isPollingPayment,
  paymentOrder?.order_id,
  user?.api_key,
  plan.name,
  toast,
  apiKey 
]);

  const handleProfileSubmit = async (data: ProfileFormData) => {
    setIsProcessing(true);
    try {
      if (!user?.api_key) throw new Error("User API key missing");

      console.log("Updating user profile...");
      await updateUserProfile(user.api_key, data);
      setProfileSaved(true);

      toast({
        title: "Profile Updated",
        description: "Your details have been saved successfully.",
        variant: "default",
      });

      // If it's a free plan, generate API key directly
      if (plan.price === "Free") {
        try {
          console.log("Free plan detected, generating API key directly");
          await generateApiKey("free");

          toast({
            title: "Success!",
            description: "Your free plan is now active. API key generated.",
          });
        } catch (err: any) {
          console.error("Free plan API key generation failed:", err);
          toast({
            title: "API Key Generation Error",
            description: err.message,
            variant: "destructive",
          });
        }
      } else {
        // For paid plans, show payment section
        console.log("Paid plan detected, showing payment section");
        setShowPayment(true);
      }
    } catch (error: any) {
      console.error("Profile update failed:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!user?.api_key) {
      toast({
        title: "Error",
        description: "User API key missing",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      console.log("Starting payment process for plan:", plan.name);

      // Map plan names to API values
      let planApiValue = "free";
      if (plan.name === "Professional") planApiValue = "pro";
      else if (plan.name === "Enterprise") planApiValue = "enterprise";

      const order = await createSubscription(user.api_key, planApiValue);
      console.log("Subscription order created:", order);
      setPaymentOrder(order);

      if (order.skip_payment) {
        // Free trial - no payment needed
        console.log("Free trial activated, generating API key");
        toast({
          title: "Free Trial Activated",
          description: order.message || "Your free trial is now active.",
        });

        // Generate API key
        try {
          await generateApiKey("free");
        } catch (err: any) {
          console.error("Free trial API key generation failed:", err);
          toast({
            title: "API Key Generation Error",
            description: err.message,
            variant: "destructive",
          });
        }
      } else {
        // Paid plan - launch Razorpay Checkout
        if (!order.order_id || !order.order_amount || !order.order_currency) {
          throw new Error("Invalid order details from server");
        }

        console.log("Launching Razorpay checkout with order:", order.order_id);

        const options: any = {
          key: order.key_id, // coming from your backend
          amount: order.order_amount,
          currency: order.order_currency,
          name: "Your Product Name",
          description: `Subscribe to ${plan.name}`,
          order_id: order.order_id,
          handler: function (response: any) {
            console.log("Razorpay payment success response:", response);
            setIsPollingPayment(true);
            toast({
              title: "Payment Processing",
              description: "Payment was successful. Verifying and generating API key...",
            });
          },
          modal: {
            ondismiss: function() {
              console.log("Razorpay modal dismissed");
              // Don't cancel the order here, just log
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
          },
          theme: {
            color: "#3399cc",
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (error: any) {
      console.error("Payment process failed:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create subscription.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelPayment = async () => {
    if (!paymentOrder?.order_id || !user?.api_key) return;

    try {
      console.log("Cancelling payment for order:", paymentOrder.order_id);
      // await cancelPayment(user.api_key, paymentOrder.order_id);
      setPaymentOrder(null);
      setPaymentStatus(null);
      setIsPollingPayment(false);
      setShowPayment(false);

      toast({
        title: "Payment Cancelled",
        description: "Your payment order has been cancelled.",
      });
    } catch (error: any) {
      console.error("Payment cancellation failed:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to cancel payment.",
        variant: "destructive",
      });
    }
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast({
      title: "Copied!",
      description: "API key has been copied to clipboard.",
    });
  };

  const getPlanIcon = () => {
    switch (plan.name.toLowerCase()) {
      case "starter":
        return <Zap className="h-6 w-6" />;
      case "professional":
        return <Star className="h-6 w-6" />;
      case "enterprise":
        return <Award className="h-6 w-6" />;
      default:
        return <Zap className="h-6 w-6" />;
    }
  };

  const getPlanColor = () => {
    switch (plan.name.toLowerCase()) {
      case "starter":
        return "from-green-500 to-emerald-600";
      case "professional":
        return "from-blue-500 to-indigo-600";
      case "enterprise":
        return "from-purple-500 to-violet-600";
      default:
        return "from-green-500 to-emerald-600";
    }
  };

  // Success screen when API key is generated
  if (apiKey) {
    console.log("Rendering success screen with API key:", apiKey);
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <section className="pt-24 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              {/* Success Animation */}
              <div className="text-center mb-8 animate-fade-in">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-accent mb-6 mx-auto shadow-2xl animate-scale-in">
                  <CheckCircle className="h-12 w-12 text-primary" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
                  Success!
                </h1>
                <p className="text-lg text-muted-foreground">
                  Your {plan.name} plan is now active and ready to use
                </p>
              </div>

              <Card className="group relative overflow-hidden bg-card border border-border">
                <CardHeader className="relative z-10">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-r ${getPlanColor()} text-white shadow-lg`}
                    >
                      {getPlanIcon()}
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-foreground">
                        {plan.name} Plan Activated
                      </CardTitle>
                      <CardDescription className="text-base text-muted-foreground">
                        {plan.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="p-6 bg-muted rounded-2xl border border-border">
                    <Label className="text-base font-semibold text-foreground mb-4 block flex items-center">
                      <Key className="h-5 w-5 mr-2 text-primary" />
                      Your API Key
                    </Label>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 p-4 bg-background rounded-xl border border-border font-mono text-sm break-all shadow-inner">
                        {apiKey}
                      </div>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={copyApiKey}
                        className="flex-shrink-0 h-12 px-6 hover:bg-accent/50 transition-all duration-200 hover:scale-105"
                      >
                        <Copy className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  <div className="p-6 bg-accent rounded-2xl border border-border">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-2 text-base">
                          Security Guidelines
                        </h4>
                        <ul className="text-muted-foreground space-y-2 text-sm">
                          <li className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-green-500" />
                            Keep your API key secure and never share it publicly
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-green-500" />
                            Use this key in your API requests for authentication
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-green-500" />
                            Monitor your usage through our analytics dashboard
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Button
                      onClick={() => navigate("/docs")}
                      variant="default"
                      size="lg"
                      className="h-12 text-base font-semibold"
                    >
                      <Key className="h-5 w-5 mr-2" />
                      View Documentation
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/")}
                      size="lg"
                      className="h-12 text-base font-semibold"
                    >
                      Back to Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <Header />

      <section className="pt-24 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="mb-12 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-accent text-foreground shadow-lg">
                      {getPlanIcon()}
                    </div>
                    <span className="font-semibold text-lg text-foreground">
                      {plan.name} Plan
                    </span>
                  </div>
                </div>
                <div className="text-left">
                  <h1 className="text-3xl sm:text-4xl font-bold mb-1 text-foreground">
                    Complete Your{" "}
                    <span className="text-primary">{plan.name}</span> Setup
                  </h1>
                  <p className="text-base text-muted-foreground">
                    {plan.price === "Free"
                      ? "Get instant access to your API key"
                      : "Secure checkout for premium features"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Plan Details */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="bg-card border border-border">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-accent" />
                      <CardTitle className="text-xl text-foreground">
                        {plan.name} Plan
                      </CardTitle>
                    </div>
                    <CardDescription className="text-base text-muted-foreground">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-4">
                      <div className="text-3xl font-bold text-foreground mb-1">
                        {plan.price}
                        {plan.period || ""}
                      </div>
                      {plan.price !== "Free" && (
                        <p className="text-sm text-muted-foreground">
                          per {plan.period?.replace("/", "") || "month"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>API Access</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span>Team Collaboration</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4 text-purple-500" />
                        <span>24/7 Support</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted border border-border">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-2">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-base text-foreground">
                        Secure & Trusted
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Your data is protected with enterprise-grade security
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Form */}
              <div className="lg:col-span-2">
                <Card className="bg-card border border-border">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center text-foreground">
                      <CreditCard className="h-5 w-5 mr-2 text-primary" />
                      {plan.price === "Free"
                        ? "Get Your API Key"
                        : "Billing Information"}
                    </CardTitle>
                    <CardDescription className="text-base text-muted-foreground">
                      Please provide your details to continue
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!profileSaved ? (
                      <Form {...profileForm}>
                        <form
                          onSubmit={profileForm.handleSubmit(
                            handleProfileSubmit
                          )}
                          className="space-y-6"
                        >
                          <div className="grid md:grid-cols-2 gap-6">
                            <FormField
                              control={profileForm.control}
                              name="industry"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Industry</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g. Information Technology"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={profileForm.control}
                              name="company_size"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Company Size</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g. 11-50"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={profileForm.control}
                              name="country"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Country</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g. India"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={profileForm.control}
                              name="job_title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Job Title</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g. Marketing Manager"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={profileForm.control}
                              name="website"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Website</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="https://example.com"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={profileForm.control}
                              name="linkedin_url"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>LinkedIn URL</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="https://linkedin.com/in/example"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={profileForm.control}
                              name="how_did_you_hear"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    How did you hear about us?
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g. Google Search"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={profileForm.control}
                              name="interested_features"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Interested Features</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g. AI Matching, Analytics"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={profileForm.control}
                            name="marketing_opt_in"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                  <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={(e) =>
                                      field.onChange(e.target.checked)
                                    }
                                    className="h-4 w-4"
                                  />
                                </FormControl>
                                <div>
                                  <FormLabel className="text-sm font-normal">
                                    I agree to receive marketing communications
                                  </FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                          <Button
                            type="submit"
                            variant="default"
                            className="w-full h-12 text-base font-semibold"
                            disabled={isProcessing || isGeneratingApiKey}
                          >
                            {isProcessing || isGeneratingApiKey ? (
                              <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>
                                  {plan.price === "Free"
                                    ? "Saving & Generating API Key..."
                                    : "Saving..."}
                                </span>
                              </div>
                            ) : plan.price === "Free" ? (
                              "Save & Get API Key"
                            ) : (
                              "Save & Continue to Payment"
                            )}
                          </Button>
                        </form>
                      </Form>
                    ) : showPayment ? (
                      <div className="mt-8 p-6 bg-muted rounded-xl border border-border animate-fade-in">
                        <div className="text-center mb-4">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent mb-2">
                            <CreditCard className="h-6 w-6 text-primary" />
                          </div>
                          <h3 className="font-bold text-lg mb-1 text-foreground">Secure Payment</h3>
                          <p className="text-sm text-muted-foreground">Complete your payment to activate your {plan.name} plan</p>
                        </div>
                        
                        {/* Payment status indicator */}
                        {isPollingPayment && (
                          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              <span className="text-sm text-blue-600">Waiting for payment confirmation...</span>
                            </div>
                            {paymentStatus && (
                              <p className="text-xs text-blue-500 mt-1">Status: {paymentStatus.status}</p>
                            )}
                          </div>
                        )}
                        
                        <div className="space-y-3">
                          <Button 
                            onClick={handlePayment} 
                            variant="default" 
                            className="w-full h-12 text-base font-semibold" 
                            disabled={isProcessing || isPollingPayment}
                          >
                            {isProcessing ? (
                              <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Processing Payment...</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <CreditCard className="h-5 w-5" />
                                <span>Pay {plan.price}{plan.period || ""}</span>
                              </div>
                            )}
                          </Button>
                          
                          {isPollingPayment && (
                            <Button 
                              onClick={handleCancelPayment} 
                              variant="outline" 
                              className="w-full h-10 text-sm"
                            >
                              Cancel Payment
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-6 bg-green-50 border border-green-200 rounded-xl">
                        <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-green-700 font-medium">Profile saved successfully!</p>
                        <p className="text-green-600 text-sm">Processing your {plan.name} plan...</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Checkout;