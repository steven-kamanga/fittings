"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { countryCodes } from "@/constants/country-codes";

export interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  defaultCountry?: string;
}

// Function to format phone number with spaces
const formatPhoneNumber = (value: string): string => {
  // Remove all non-digit characters except spaces
  const digits = value.replace(/[^\d]/g, "");

  // Apply spacing: XXX XXX XXXX format (can be adjusted based on needs)
  if (digits.length <= 3) {
    return digits;
  } else if (digits.length <= 6) {
    return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  } else if (digits.length <= 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  } else {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
  }
};

// Function to parse full phone number and extract country and number parts
const parsePhoneNumber = (fullNumber: string) => {
  if (!fullNumber) return { country: null, number: "" };

  // Find matching country code
  const matchingCountry = countryCodes.find((country) =>
    fullNumber.startsWith(country.dial_code)
  );

  if (matchingCountry) {
    const number = fullNumber.slice(matchingCountry.dial_code.length);
    return {
      country: matchingCountry,
      number: number,
    };
  }

  return { country: null, number: fullNumber };
};

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      value = "",
      onChange,
      placeholder = "Enter phone number",
      className,
      disabled,
      defaultCountry = "MW",
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);

    const initialParse = parsePhoneNumber(value);
    const [selectedCountry, setSelectedCountry] = React.useState(() => {
      if (initialParse.country) return initialParse.country;
      return (
        countryCodes.find((country) => country.code === defaultCountry) ||
        countryCodes[0]
      );
    });
    const [phoneNumber, setPhoneNumber] = React.useState(
      initialParse.number ? formatPhoneNumber(initialParse.number) : ""
    );

    // Update component state when value prop changes
    React.useEffect(() => {
      const parsed = parsePhoneNumber(value);
      if (parsed.country) {
        setSelectedCountry(parsed.country);
      }
      setPhoneNumber(parsed.number ? formatPhoneNumber(parsed.number) : "");
    }, [value]);

    const handleCountrySelect = (country: (typeof countryCodes)[0]) => {
      setSelectedCountry(country);

      // Update the full phone number
      const cleanNumber = phoneNumber.replace(/\s/g, "");
      const fullNumber = `${country.dial_code}${cleanNumber}`;
      onChange?.(fullNumber);

      // Close popover after state update
      setOpen(false);
    };

    const handlePhoneNumberChange = (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const inputValue = e.target.value;

      // Format the number with spaces
      const formattedNumber = formatPhoneNumber(inputValue);
      setPhoneNumber(formattedNumber);

      // Create full phone number (without spaces for the value)
      const cleanNumber = formattedNumber.replace(/\s/g, "");
      const fullNumber = `${selectedCountry.dial_code}${cleanNumber}`;
      onChange?.(fullNumber);
    };

    return (
      <div className={cn("flex", className)}>
        <Popover open={open} onOpenChange={setOpen} modal>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-28 h-9 justify-between rounded-r-none border-r-0"
              disabled={disabled}
              type="button"
            >
              <span className="flex items-center gap-2">
                <span className="text-sm font-mono">
                  {selectedCountry.dial_code}
                </span>
                <span className="text-xs mt-0.5 text-muted-foreground">
                  {selectedCountry.code}
                </span>
              </span>
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="z-[800] w-[300px] p-0"
            align="start"
            side="bottom"
          >
            <Command>
              <CommandInput
                placeholder="Search country..."
                className="h-9 z-[999]"
                autoFocus
              />
              <CommandList className="max-h-[200px] overflow-y-auto">
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup>
                  {countryCodes.map((country) => (
                    <CommandItem
                      key={country.code}
                      value={country.name}
                      keywords={[country.code, country.dial_code, country.name]}
                      onSelect={(currentValue) => {
                        const selectedCountry = countryCodes.find(
                          (c) =>
                            c.name.toLowerCase() === currentValue.toLowerCase()
                        );
                        if (selectedCountry) {
                          handleCountrySelect(selectedCountry);
                        }
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCountry.code === country.code
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <span className="font-mono text-sm min-w-[60px]">
                          {country.dial_code}
                        </span>
                        <span className="text-sm truncate">{country.name}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {country.code}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Input
          {...props}
          ref={ref}
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          placeholder={placeholder}
          className={cn("rounded-l-none", className)}
          disabled={disabled}
        />
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
