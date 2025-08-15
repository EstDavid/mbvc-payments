import PaymentForm from "@/components/custom/payment-form";
import { Suspense } from "react";

export default function Home () {
  return <div>
    <Suspense>
      <PaymentForm />
    </Suspense>
  </div>;
}
