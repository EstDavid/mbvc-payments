'use client';

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

type CheckBoxRowProps = {
  id: string;
  checked: boolean;
  label: string;
  buttonLabel: string;
  setChecked: (value: boolean) => void;
  onButtonClick: () => void;
};

function CheckBoxRow ({ id, checked, label, buttonLabel, setChecked, onButtonClick }: CheckBoxRowProps) {
  return (
    <div className="flex align-middle items-center space-x-2">
      <Checkbox id={id} checked={checked} onCheckedChange={setChecked} />
      <Label htmlFor={id} className="text-sm leading-relaxed">
        {label}{" "}
        <Button
          type="button"
          variant='link'
          onClick={onButtonClick}
          className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1 !px-0 cursor-pointer"
        >
          {buttonLabel}
          <ExternalLink className="w-3 h-3" />
        </Button>
      </Label>
    </div >
  );
}

type LegalCheckboxProps = {
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
  t: Record<string, string>;
  setAcceptedTerms: (value: boolean) => void;
  setAcceptedPrivacy: (value: boolean) => void;
  setShowTermsModal: (value: boolean) => void;
  setShowPrivacyModal: (value: boolean) => void;
};

export default function LegalCheckboxArea ({
  acceptedTerms,
  acceptedPrivacy,
  t,
  setAcceptedTerms,
  setAcceptedPrivacy,
  setShowTermsModal,
  setShowPrivacyModal,
}: LegalCheckboxProps) {
  return (
    <div className="space-y-4 border-t pt-4">
      <CheckBoxRow
        id={'accept-terms'}
        checked={acceptedTerms}
        label={t.acceptTerms}
        buttonLabel={t.termsAndConditions}
        setChecked={setAcceptedTerms}
        onButtonClick={() => setShowTermsModal(true)}
      />
      <CheckBoxRow
        id={'accept-privacy'}
        checked={acceptedPrivacy}
        label={t.acceptPrivacy}
        buttonLabel={t.privacyPolicy}
        setChecked={setAcceptedPrivacy}
        onButtonClick={() => setShowPrivacyModal(true)}
      />
    </div>
  );
}


