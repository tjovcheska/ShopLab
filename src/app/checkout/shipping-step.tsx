"use client";

import { FormField } from "@/components/form-field";
import { RegionSelect } from "@/components/region-select";
import { COUNTRIES, getCountry } from "@/lib/regions";
import type { ShippingField, ShippingInput } from "@/lib/validation/checkout";

export function ShippingStep({
  values,
  errors,
  onChange,
}: {
  values: ShippingInput;
  errors: Partial<Record<ShippingField, string>>;
  onChange: (values: ShippingInput) => void;
}) {
  const set = (field: ShippingField, value: string) =>
    onChange({ ...values, [field]: value });
  const regions = getCountry(values.country)?.regions ?? [];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <FormField
          id="ship-full-name"
          label="Full name"
          autoComplete="name"
          value={values.fullName}
          onChange={(e) => set("fullName", e.target.value)}
          error={errors.fullName}
        />
      </div>
      <div className="sm:col-span-2">
        <FormField
          id="ship-line1"
          label="Address"
          autoComplete="address-line1"
          data-testid="ship-address"
          value={values.line1}
          onChange={(e) => set("line1", e.target.value)}
          error={errors.line1}
        />
      </div>
      <div className="sm:col-span-2">
        <FormField
          id="ship-line2"
          label="Apartment, suite, etc. (optional)"
          autoComplete="address-line2"
          value={values.line2}
          onChange={(e) => set("line2", e.target.value)}
        />
      </div>
      <FormField
        id="ship-city"
        label="City"
        autoComplete="address-level2"
        value={values.city}
        onChange={(e) => set("city", e.target.value)}
        error={errors.city}
      />
      <FormField
        id="ship-postal-code"
        label="Postal code"
        autoComplete="postal-code"
        data-testid="ship-postal-code"
        value={values.postalCode}
        onChange={(e) => set("postalCode", e.target.value)}
        error={errors.postalCode}
      />

      {/* A native <select>: use selectOption() in tests. */}
      <div className="flex flex-col gap-1">
        <label htmlFor="ship-country" className="text-sm font-medium">
          Country
        </label>
        <select
          id="ship-country"
          autoComplete="country"
          data-testid="ship-country"
          value={values.country}
          // A new country has different regions, so the region is cleared.
          onChange={(e) =>
            onChange({ ...values, country: e.target.value, region: "" })
          }
          className="rounded-md border border-gray-300 bg-white px-3 py-2"
        >
          {COUNTRIES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

      {/* A custom, div-based dropdown: click it, then click an option. */}
      <RegionSelect
        id="ship-region"
        label="State / region"
        placeholder="Select a state or region"
        options={regions}
        value={values.region}
        onChange={(code) => set("region", code)}
        error={errors.region}
      />
    </div>
  );
}
