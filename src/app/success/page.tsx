import React from "react";
import Link from "next/link";
import Image from "next/image";

const SuccessPage = () => (
  // TODO: Implement proper success page UI
  // TODO: Implement proper translations
  <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
    <div className="flex items-center justify-center mb-4">
      <Image src="/logo.png" alt="Montgó Beach Volley Club Logo" width={200} height={100} className="h-16 w-auto" />
    </div>
    <h1>Payment Successful!</h1>
    <p>Thank you for your payment. Your transaction has been completed successfully.</p>
    <Link href="/">
      <p style={{ marginTop: 24, color: "#0070f3", textDecoration: "underline" }}>Go back to Home</p>
    </Link>
  </div>
);

export default SuccessPage;