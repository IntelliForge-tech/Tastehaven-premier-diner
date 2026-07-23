import { useFormContext } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ORDERED_DAYS, DAY_NAMES } from "@/services/restaurant-information.service";
import type { DayOfWeek } from "@/services/restaurant-information.service";
import type { RestaurantInformationFormInput } from "./restaurant-information-schema";

/**
 * Opening hours editor — Phase 12C.
 *
 * Renders a row per day with open/close time pickers and a Closed toggle.
 * When Closed is checked the time pickers are disabled and their values
 * are cleared on submit (handled in the service layer).
 *
 * Uses `useFormContext` to stay inside the parent RestaurantInformationForm
 * without prop-drilling the entire form object.
 */
export function OpeningHoursEditor() {
  const form = useFormContext<RestaurantInformationFormInput>();
  const hours = form.watch("hours") ?? [];

  return (
    <div className="space-y-3">
      {ORDERED_DAYS.map((day) => {
        const idx = hours.findIndex((h) => h.dayOfWeek === day);
        if (idx === -1) return null;
        const isClosed = hours[idx]?.isClosed ?? false;

        return (
          <div
            key={day}
            className="grid grid-cols-[100px_1fr_1fr_auto] items-center gap-3 rounded-xl border border-border bg-card/40 px-4 py-3"
          >
            {/* Day name */}
            <span className="text-sm font-medium">{DAY_NAMES[day as DayOfWeek]}</span>

            {/* Open time */}
            <FormField
              control={form.control}
              name={`hours.${idx}.openTime`}
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <FormLabel className="sr-only">Open time</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      {...field}
                      disabled={isClosed}
                      className="h-9 text-sm disabled:opacity-40"
                      aria-label={`${DAY_NAMES[day as DayOfWeek]} open time`}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Close time */}
            <FormField
              control={form.control}
              name={`hours.${idx}.closeTime`}
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <FormLabel className="sr-only">Close time</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      {...field}
                      disabled={isClosed}
                      className="h-9 text-sm disabled:opacity-40"
                      aria-label={`${DAY_NAMES[day as DayOfWeek]} close time`}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Closed toggle */}
            <FormField
              control={form.control}
              name={`hours.${idx}.isClosed`}
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value as boolean}
                      onCheckedChange={field.onChange}
                      aria-label={`${DAY_NAMES[day as DayOfWeek]} closed`}
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer text-xs text-muted-foreground">
                    Closed
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>
        );
      })}
    </div>
  );
}
