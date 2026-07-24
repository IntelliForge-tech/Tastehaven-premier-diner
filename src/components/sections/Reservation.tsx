import type { FormEvent } from "react";
import { toast } from "sonner";

import { Field } from "@/components/common/Field";
import { SectionTitle } from "@/components/common/SectionTitle";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { RESERVE_INFO } from "@/utils/constants";

export function Reservation() {
  const onReserve = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Store the form reference BEFORE any async work
    const form = e.currentTarget;

    const fd = new FormData(form);

    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();

    const guests = Number(fd.get("guests") ?? 2);

    const date = String(fd.get("date") ?? "");
    const time = String(fd.get("time") ?? "");

    const message = String(fd.get("message") ?? "").trim();

    // Validation
    if (!name || name.length > 80) {
      toast.error("Please enter a valid name.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Please enter a valid email.");
      return;
    }

    if (!/^[\d+\-\s()]{7,20}$/.test(phone)) {
      toast.error("Please enter a valid phone.");
      return;
    }

    if (!date || !time) {
      toast.error("Please select a reservation date and time.");
      return;
    }

    if (guests < 1 || guests > 30) {
      toast.error("Guest count must be between 1 and 30.");
      return;
    }

    try {
      const supabase = getSupabaseBrowserClient();

      const { error } = await supabase
        .from("reservations")
        .insert({
          customer_name: name,
          email,
          phone,
          party_size: guests,
          reservation_date: date,
          reservation_time: time,
          special_request: message || null,
        });

      if (error) {
        console.error("Reservation insert failed:", error);

        toast.error(error.message);

        return;
      }

      toast.success(`Table reserved, ${name}. See you soon!`);

      // Safely reset the form
      if (form) {
        form.reset();
      }
    } catch (err) {
      console.error(err);

      toast.error(
        err instanceof Error
          ? err.message
          : "Unable to submit reservation."
      );
    }
  };

  return (<section id="reserve" className="relative py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 md:px-8 lg:grid-cols-2">
        <div className="reveal">
          <SectionTitle>Reservation</SectionTitle>

          <h2 className="mt-3 font-display text-4xl md:text-5xl">
            Book your table.
          </h2>

          <p className="mt-4 text-muted-foreground">
            Reservations open daily from 5 PM. For groups of 8+, please call us
            directly.
          </p>

          <div className="mt-8 space-y-4">
            {RESERVE_INFO.map((r) => (
              <div
                key={r.t}
                className="flex items-start gap-4 rounded-xl border border-border bg-card/40 p-4"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                  <i className={`fa-solid ${r.i}`} />
                </div>

                <div>
                  <div className="font-medium">{r.t}</div>
                  <div className="text-sm text-muted-foreground">
                    {r.d}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={onReserve}
          className="reveal rounded-2xl border border-border bg-card p-6 md:p-8"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Full Name"
              name="name"
              placeholder="Jane Doe"
              required
              maxLength={80}
            />

            <Field
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              maxLength={120}
            />

            <Field
              label="Phone"
              name="phone"
              type="tel"
              placeholder="+1 415 555 0138"
              required
              maxLength={20}
            />

            <Field
              label="Guests"
              name="guests"
              type="number"
              placeholder="2"
              required
              min={1}
              max={30}
              defaultValue={2}
            />

            <Field
              label="Date"
              name="date"
              type="date"
              required
            />

            <Field
              label="Time"
              name="time"
              type="time"
              required
            />

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">
                Message
              </label>

              <textarea
                name="message"
                rows={3}
                maxLength={500}
                placeholder="Any special request..."
                className="w-full resize-none rounded-lg border border-border bg-background/50 px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold btn-gold"
          >
            <i className="fa-solid fa-calendar-check" />
            Reserve Table
          </button>
        </form>
      </div>
    </section>
  );
}