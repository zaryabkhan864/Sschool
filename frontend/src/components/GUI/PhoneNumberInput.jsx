import React from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useTranslation } from "react-i18next";

const PhoneNumberInput = ({ label, value, onChange, country = "tr", disabled = false, ...rest }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs-custom font-semibold text-ink-700 uppercase tracking-wider">
        {label || t("Phone Number")}
      </label>
      <PhoneInput
        country={country}
        value={value}
        onChange={onChange}
        disabled={disabled}
        inputClass="!w-full !h-[42px] !text-sm-custom !border-surface-200 !rounded-xl"
        buttonClass="!border-surface-200 !rounded-l-xl"
        dropdownClass="!rounded-xl !shadow-premium !border-surface-100"
        containerClass="!w-full"
        {...rest}
      />
    </div>
  );
};

export default PhoneNumberInput;
