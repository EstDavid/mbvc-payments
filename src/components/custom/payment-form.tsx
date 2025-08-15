"use client";

import React, { useEffect, useRef, useState, useTransition } from "react";
import { submitRedsysPayment } from "@/lib/actions/submit-redsys-payment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { PaymentType } from "@/types/payment";
import { Language } from "@/types/payment";
import translations from "@/lib/translations";
import { getAmount, getDescription, validateSpanishPhone } from "@/lib/utils/payment";
import PersonalInfoForm from "@/components/payment/PersonalInfoForm";
import PaymentDetailsTabs from "@/components/payment/PaymentDetailsTabs";
import MemberModal from "@/components/payment/MemberModal";
import AmountSummary from "@/components/payment/AmountSummary";
import LanguageSelector from "@/components/payment/LanguageSelector";
import Image from "next/image";
import RedsysRequestForm from "./redsys-request-form";
import { RedsysRequestParameters } from "@/types/redsys";
import ErrorModal from "../payment/ErrorModal";
import ProcessingModal from "../payment/ProcessingModal";
import ResultModal from "../payment/ResultModal";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ErrorTypes } from "@/types/error-handling";
import Link from "next/link";

const clubUrl = process.env.NEXT_PUBLIC_CLUB_URL;

const emailFeatureFlag = process.env.NEXT_PUBLIC_EMAIL_FEATURE_FLAG;

const useEmailFeature = emailFeatureFlag === 'TRUE';

export default function PaymentForm () {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();
  const [language, setLanguage] = useState<Language>(Language.es);
  const [paymentType, setPaymentType] = useState<PaymentType>("monthly-plans");
  const [isMember, setIsMember] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [saveData, setSaveData] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [followInstructions, setFollowInstructions] = useState(false);
  const [pollTransaction, setPollTransaction] = useState<null | number>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [bizumRequest, setBizumRequest] = useState<null | RedsysRequestParameters>(null);
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    phone: "",
    email: "",
  });
  const [phoneError, setPhoneError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const bizumRequestFormRef = useRef<null | HTMLFormElement>(null);

  const [isPending, startTransition] = useTransition();
  const [bizumResult, setBizumResult] = useState<null | { success: boolean; message: string; }>(null);

  const t = translations[language];
  const flatT = t as Record<string, string>;

  // Extract 'status' query parameter from URL (if present)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const status = params.get("status");
      const languageParam = params.get("language");
      if (languageParam && Object.values(Language).includes(languageParam as Language)) {
        if (languageParam !== language)
          setLanguage(languageParam as Language);
      }

      if (status) {
        setBizumResult({
          success: status === "success",
          message: status === "success" ? flatT.paymentSuccess : flatT.paymentRejectedByUser,
        });

        // Remove 'status' from the URL without reloading the page
        const newSearchParams = new URLSearchParams(params.toString());
        newSearchParams.delete("status");
        newSearchParams.delete("language");
        const newUrl =
          pathname +
          (newSearchParams.toString() ? `?${newSearchParams.toString()}` : "");
        router.replace(newUrl);
      }
    }
  }, [language, params, pathname, router, flatT]);

  // Populate formData from localStorage on first render
  useEffect(() => {
    try {
      const saved = localStorage.getItem("mbvcUserData");
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({
          ...prev,
          ...parsed,
        }));
        if (parsed.language) {
          setLanguage(parsed.language);
        }
        setSaveData(true);
      }
    } catch (err) {
      // Optionally handle localStorage errors
      console.error("Failed to read user data from localStorage", err);
    }
  }, []);

  useEffect(() => {
    if (bizumRequest && bizumRequestFormRef.current) {
      bizumRequestFormRef.current.submit();
    }
  }, [bizumRequest]);


  useEffect(() => {
    if (pollTransaction) {
      const startTime = Date.now();
      const TIMEOUT = 1000 * 60 * 10; // 10 minute timeout

      const interval = setInterval(async () => {
        // Check if time limit exceeded
        if (Date.now() - startTime > TIMEOUT) {
          clearInterval(interval);
          // Optionally notify user about timeout
          setShowErrorModal(true);
          return;
        }

        const res = await fetch(`/api/payment-status?orderNumber=${pollTransaction}`);
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data === 'object' && 'status' in data) {
            if (data.status === 'Paid') {
              // Notify user
              setIsProcessing(false);
              setBizumResult({ success: true, message: flatT.paymentSuccess });
              clearInterval(interval);
            } else if (data.status === 'Cancelled') {
              // Notify user
              setIsProcessing(false);
              setBizumResult({ success: false, message: flatT.paymentRejectedByUser });
              clearInterval(interval);
            }
          }
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [pollTransaction, flatT]);

  useEffect(() => {
    if (bizumResult) {
      const timeout = setTimeout(() => {
        setBizumResult(null);
      }, 10000);
      return () => clearTimeout(timeout);
    }
  }, [bizumResult]);

  // UseEffect to display modals depending on the result of the transacion
  useEffect(() => {
    if (bizumResult && bizumResult.success) {
      setShowResultModal(true);
    } else if (bizumResult && !bizumResult.success) {
      setShowErrorModal(true);
    } else if (!bizumResult) {
      if (showErrorModal) {
        setShowErrorModal(false);
      }
      if (showResultModal) {
        setShowResultModal(false);
      }
    }
  }, [bizumResult, showErrorModal, showResultModal]);


  // Reset the followInstructions boolean when isProcessing becomes false
  useEffect(() => {
    if (!isProcessing && followInstructions) {
      setFollowInstructions(false);
    }
  }, [isProcessing, followInstructions, setFollowInstructions]);

  const handleMemberToggle = (checked: boolean) => {
    if (checked) {
      setShowMemberModal(true);
    } else {
      setIsMember(false);
    }
  };

  const confirmMemberPrices = () => {
    setIsMember(true);
    setShowMemberModal(false);
  };

  const handlePhoneChange = (value: string) => {
    // Remove any non-digit characters
    const cleanPhone = value.replace(/\D/g, "");

    // Limit to 9 digits
    if (cleanPhone.length <= 9) {
      setFormData({ ...formData, phone: cleanPhone });

      // Clear field errors for phone when user starts typing
      if (fieldErrors.phoneNumber) {
        setFieldErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.phoneNumber;
          return newErrors;
        });
      }

      // Validate if phone has content
      if (cleanPhone.length > 0) {
        if (validateSpanishPhone(cleanPhone)) {
          setPhoneError("");
        } else {
          setPhoneError(flatT.phoneValidation);
        }
      } else {
        setPhoneError("");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setIsProcessing(true);

    // Clear previous field errors
    setFieldErrors({});

    // Validate phone before submission
    if (!validateSpanishPhone(formData.phone)) {
      setPhoneError(
        formData.phone.trim() === ""
          ? flatT.phoneRequired
          : flatT.phoneValidation
      );
      setIsProcessing(false);
      return;
    }

    // Validate that a monthly plan has been selected
    if (paymentType === 'monthly-plans' && !selectedService) {
      setIsProcessing(false);
      setBizumResult({
        success: false,
        message: "Select a monthly plan"
      });
      return;
    }

    // Save user data to localStorage if requested
    if (saveData) {
      try {
        localStorage.setItem(
          "mbvcUserData",
          JSON.stringify({
            name: formData.name,
            surname: formData.surname,
            phone: formData.phone,
            email: formData.email,
            language: language,
          })
        );
      } catch (err) {
        // Optionally handle localStorage errors
        console.error("Failed to save user data to localStorage", err);
      }
    }

    // Prepare data for Bizum payment as FormData
    const paymentData = new FormData();
    paymentData.append("name", formData.name);
    paymentData.append("surname", formData.surname);
    paymentData.append("phoneNumber", `${formData.phone}`);
    if (useEmailFeature) {
      paymentData.append("email", formData.email);
    }
    paymentData.append("paymentType", paymentType);
    paymentData.append("amount", String(getAmount(paymentType, customAmount, selectedService, isMember)));
    paymentData.append("productDescription", getDescription(paymentType, customDescription, selectedService, language));
    paymentData.append("isMember", String(isMember));
    paymentData.append("language", language);

    startTransition(async () => {
      try {
        const result = await submitRedsysPayment(paymentData);

        const isRtpTransaction = result.valid && result.rtpRequestData !== undefined;
        const isRedirectTransaction = result.valid && result.redirectParameters !== undefined;
        const isNotValidTransaction = !result.valid;

        if (isRtpTransaction) {
          const { rtpRequestData } = result;
          setFollowInstructions(true);
          setPollTransaction(rtpRequestData.Ds_Order);
        } else {
          setIsProcessing(false);

          if (isRedirectTransaction) {
            setBizumRequest(result.redirectParameters);
          } else if (isNotValidTransaction) {
            const { errorType } = result;
            if (errorType === ErrorTypes.FormValidationError) {
              // Handle field-specific validation errors
              setBizumResult({
                success: false,
                message: flatT.validationError
              });
              if (result.errors) {
                setFieldErrors(result.errors);
              }
            } else if (errorType === ErrorTypes.NoBizumError) {
              setBizumResult({
                success: false,
                message: flatT.userHasNoBizum
              });
            } else if (errorType === ErrorTypes.PaymentGatewayError) {
              setBizumResult({
                success: false,
                message: `${flatT.errorGateway}\n${result.message}`
              });
            } else {
              // Handle any other validation errors
              setBizumResult({
                success: false,
                message: result.message?.toString() || flatT.errorGateway
              });
            }
          } else {
            // Handle any other errors with the catch
            throw new Error(result.message?.toString());
          }
        }
      } catch (err) {
        if (isProcessing) {
          setIsProcessing(false);
        }
        console.error({ err });
        setBizumResult({
          success: false,
          message: "Error connecting to Bizum server."
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-white sm:px-4 py-2 sm:py-10">
      <div className="max-w-2xl mx-auto sm:static pr-4 sm:pr-0 sticky top-2 sm:top-0 z-20 bg-white pt-2 pb-1">
        <LanguageSelector language={language} setLanguage={setLanguage} />
      </div>
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-none sm:shadow-2xl border-0">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              {clubUrl ?
                <Link
                  href={clubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src="/logo.png"
                    alt="Montgó Beach Volley Club Logo"
                    width={200}
                    height={100}
                    className="h-16 w-auto"
                  />
                </Link>
                :
                <Image
                  src="/logo.png"
                  alt="Montgó Beach Volley Club Logo"
                  width={200}
                  height={100}
                  className="h-16 w-auto"
                />
              }

            </div>
            {clubUrl ?
              <Link
                href={clubUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <CardTitle className="text-2xl font-bold text-[#156082]">{flatT.title}</CardTitle>
              </Link>
              :
              <CardTitle className="text-2xl font-bold text-[#156082]">{flatT.title}</CardTitle>
            }
            <CardDescription>{flatT.description}</CardDescription>
          </CardHeader>
          <CardContent className="px-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <PersonalInfoForm
                formData={formData}
                phoneError={phoneError}
                fieldErrors={fieldErrors}
                onChange={(field, value) => {
                  setFormData({ ...formData, [field]: value });
                  // Clear field error when user starts typing
                  if (fieldErrors[field]) {
                    setFieldErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors[field];
                      return newErrors;
                    });
                  }
                }}
                onPhoneChange={handlePhoneChange}
                translations={{
                  personalInfo: flatT.personalInfo,
                  name: flatT.name,
                  surname: flatT.surname,
                  phone: flatT.phone,
                  email: flatT.email,
                  phoneFormat: flatT.phoneFormat,
                }}
                includeEmail={useEmailFeature}
              />
              <div className="flex items-center space-x-2">
                <Checkbox id="save-data" checked={saveData} onCheckedChange={checked => setSaveData(checked === true)} />
                <Label htmlFor="save-data" className="text-sm">
                  {flatT.saveData}
                </Label>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">{flatT.paymentDetails}</h3>
                <PaymentDetailsTabs
                  paymentType={paymentType}
                  isMember={isMember}
                  selectedService={selectedService}
                  customAmount={customAmount}
                  customDescription={customDescription}
                  isCustomAmount={isCustomAmount}
                  fieldErrors={fieldErrors}
                  setPaymentType={setPaymentType}
                  handleMemberToggle={handleMemberToggle}
                  setSelectedService={setSelectedService}
                  setCustomAmount={(amount) => {
                    setCustomAmount(amount);
                    // Clear field error when user starts typing
                    if (fieldErrors.amount) {
                      setFieldErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.amount;
                        return newErrors;
                      });
                    }
                  }}
                  setCustomDescription={(description) => {
                    setCustomDescription(description);
                    // Clear field error when user starts typing
                    if (fieldErrors.productDescription) {
                      setFieldErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.productDescription;
                        return newErrors;
                      });
                    }
                  }}
                  setIsCustomAmount={setIsCustomAmount}
                  t={t}
                />
                <AmountSummary
                  amount={getAmount(paymentType, customAmount, selectedService, isMember)}
                  description={getDescription(paymentType, customDescription, selectedService, language)}
                  t={flatT}
                />
              </div>
              <Button type="submit" className="w-full bg-[#156082] hover:bg-[#10496a] h-auto py-3" disabled={isPending}>
                <Image src="/bizum-logo.svg" alt="Bizum Logo" width={200} height={60} className="h-8 w-auto mr-4" />
                {isPending ? flatT.processingPayment || "Processing..." : `${flatT.processPayment} - ${getAmount(paymentType, customAmount, selectedService, isMember)}€`}
              </Button>
              {bizumResult && (
                <div className={`mt-2 text-center ${bizumResult.success ? "text-green-600" : "text-red-600"}`}>
                  {bizumResult.message}
                </div>
              )}
            </form>
          </CardContent>
        </Card>
        <RedsysRequestForm request={bizumRequest} formRef={bizumRequestFormRef} />
        <MemberModal
          open={showMemberModal}
          onOpenChange={setShowMemberModal}
          onConfirm={confirmMemberPrices}
          onCancel={() => setShowMemberModal(false)}
          t={flatT}
        />
        <ErrorModal
          open={showErrorModal}
          onOpenChange={(open) => {
            setShowErrorModal(open);
          }}
          onConfirm={() => {
            setShowErrorModal(false);
          }}
          t={flatT}
          message={bizumResult?.message}
        />
        <ProcessingModal isProcessing={isProcessing} followInstructions={followInstructions} t={flatT} />
        <ResultModal
          open={showResultModal}
          success={bizumResult?.success}
          onOpenChange={setShowResultModal}
          onConfirm={() => setShowResultModal(false)}
          t={flatT}
        />
      </div>
    </div>
  );
}
