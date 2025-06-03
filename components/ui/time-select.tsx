"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface TimeSelectProps {
  id?: string;
  value: string; // Expected format "HH:mm" (24-hour) or empty string
  onChange: (value: string) => void; // Returns "HH:mm" (24-hour)
  disabled?: boolean;
  minuteStep?: 5 | 10 | 15 | 30;
}

const TimeSelect: React.FC<TimeSelectProps> = ({
  id,
  value,
  onChange,
  disabled = false,
  minuteStep = 5,
}) => {
  const [displayHour, setDisplayHour] = React.useState<string>(""); // 01-12
  const [minute, setMinute] = React.useState<string>("");     // 00-59
  const [period, setPeriod] = React.useState<"AM" | "PM">("AM"); // AM or PM

  React.useEffect(() => {
    if (value && value.includes(":")) {
      let [h, m] = value.split(":").map(Number);
      if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        const currentPeriod = h >= 12 ? "PM" : "AM";
        let currentDisplayHour = h % 12;
        if (currentDisplayHour === 0) currentDisplayHour = 12; // Midnight or Noon is 12

        setDisplayHour(currentDisplayHour.toString().padStart(2, "0"));
        setMinute(m.toString().padStart(2, "0"));
        setPeriod(currentPeriod);
      } else {
        // Invalid initial value, reset
        setDisplayHour(""); setMinute(""); setPeriod("AM");
      }
    } else {
      setDisplayHour(""); // Default to empty or a specific time e.g. "09"
      setMinute("");    // e.g. "00"
      setPeriod("AM");    // e.g. "AM"
    }
  }, [value]);

  const convertTo24Hour = (h12: string, m: string, p: "AM" | "PM"): string => {
    let hour24 = parseInt(h12, 10);
    if (p === "PM" && hour24 !== 12) {
      hour24 += 12;
    } else if (p === "AM" && hour24 === 12) { // Midnight case
      hour24 = 0;
    }
    return `${hour24.toString().padStart(2, "0")}:${m}`;
  };

  const triggerOnChange = (h: string, m: string, p: "AM" | "PM") => {
    if (h && m) {
      onChange(convertTo24Hour(h, m, p));
    }
  };

  const handleDisplayHourChange = (newDisplayHour: string) => {
    setDisplayHour(newDisplayHour);
    triggerOnChange(newDisplayHour, minute, period);
  };

  const handleMinuteChange = (newMinute: string) => {
    setMinute(newMinute);
    triggerOnChange(displayHour, newMinute, period);
  };

  const handlePeriodChange = (newPeriod: "AM" | "PM") => {
    setPeriod(newPeriod);
    triggerOnChange(displayHour, minute, newPeriod);
  };

  const hours12 = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
  const minutes: string[] = [];
  for (let i = 0; i < 60; i += minuteStep) {
    minutes.push(i.toString().padStart(2, "0"));
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-[2]"> {/* Hour takes more space */}
        <Label htmlFor={`${id}-hour`} className="sr-only">Hour (12-hour)</Label>
        <Select value={displayHour} onValueChange={handleDisplayHourChange} disabled={disabled}>
          <SelectTrigger id={`${id}-hour`} aria-label="Hour">
            <SelectValue placeholder="Hora" />
          </SelectTrigger>
          <SelectContent>
            {hours12.map((h) => (
              <SelectItem key={h} value={h}>{h}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <span>:</span>
      <div className="flex-[2]"> {/* Minute takes more space */}
        <Label htmlFor={`${id}-minute`} className="sr-only">Minute</Label>
        <Select value={minute} onValueChange={handleMinuteChange} disabled={disabled}>
          <SelectTrigger id={`${id}-minute`} aria-label="Minute">
            <SelectValue placeholder="Min" />
          </SelectTrigger>
          <SelectContent>
            {minutes.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-[1.5]"> {/* AM/PM takes less space */}
        <Label htmlFor={`${id}-period`} className="sr-only">Period</Label>
        <Select value={period} onValueChange={handlePeriodChange as (value: string) => void} disabled={disabled}>
          <SelectTrigger id={`${id}-period`} aria-label="Period">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AM">AM</SelectItem>
            <SelectItem value="PM">PM</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export { TimeSelect };
