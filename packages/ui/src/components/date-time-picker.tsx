import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './button';
import { Input } from './input';
import { cn } from '../lib/utils';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { parseLocalDateTime, toLocalDateTimeValue } from '../lib/local-datetime';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function formatDisplay(value: string): string {
  const date = parseLocalDateTime(value);
  if (!date) return 'Select date and time';
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function monthGrid(view: Date): (Date | null)[] {
  const first = startOfMonth(view);
  const startPad = first.getDay();
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startPad; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(view.getFullYear(), view.getMonth(), day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export type DateTimePickerProps = {
  id?: string;
  value: string;
  onChange: (next: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

export function DateTimePicker({
  id,
  value,
  onChange,
  required,
  disabled,
  className,
}: DateTimePickerProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const selected = parseLocalDateTime(value);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => startOfMonth(selected ?? new Date()));
  const [time, setTime] = useState(() =>
    selected ? `${pad(selected.getHours())}:${pad(selected.getMinutes())}` : '09:00',
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    const next = parseLocalDateTime(value);
    setView(startOfMonth(next ?? new Date()));
    if (next) setTime(`${pad(next.getHours())}:${pad(next.getMinutes())}`);
  }, [open, value]);

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const update = () => {
      const rect = triggerRef.current!.getBoundingClientRect();
      const panelWidth = Math.max(rect.width, 288);
      const left = Math.min(rect.left, window.innerWidth - panelWidth - 8);
      const below = rect.bottom + 8;
      const approxHeight = 360;
      const top =
        below + approxHeight > window.innerHeight
          ? Math.max(8, rect.top - approxHeight - 8)
          : below;
      setCoords({ top, left: Math.max(8, left), width: panelWidth });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
    };
  }, [open]);

  const cells = useMemo(() => monthGrid(view), [view]);
  const monthLabel = new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  }).format(view);

  const applyDay = (day: Date) => {
    const [hours, minutes] = time.split(':').map(Number);
    const next = new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      hours || 0,
      minutes || 0,
    );
    onChange(toLocalDateTimeValue(next));
  };

  const applyTime = (nextTime: string) => {
    setTime(nextTime);
    const base = selected ?? new Date();
    const [hours, minutes] = nextTime.split(':').map(Number);
    const next = new Date(
      base.getFullYear(),
      base.getMonth(),
      base.getDate(),
      hours || 0,
      minutes || 0,
    );
    onChange(toLocalDateTimeValue(next));
  };

  return (
    <div className={cn('relative', className)}>
      <Button
        ref={triggerRef}
        id={fieldId}
        type="button"
        variant="outline"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-required={required}
        className="h-10 w-full justify-start gap-2 font-normal"
        onClick={() => setOpen((prev) => !prev)}
      >
        <CalendarDays className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className={cn(!selected && 'text-muted-foreground')}>{formatDisplay(value)}</span>
      </Button>

      {open && coords
        ? createPortal(
            <div
              ref={panelRef}
              role="dialog"
              aria-label="Choose date and time"
              className="fixed z-[100] rounded-md border bg-background p-3 shadow-lg"
              style={{ top: coords.top, left: coords.left, width: coords.width }}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label="Previous month"
                  onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <p className="text-sm font-medium">{monthLabel}</p>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label="Next month"
                  onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>

              <div className="mb-1 grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
                {WEEKDAYS.map((day) => (
                  <span key={day} className="py-1">
                    {day}
                  </span>
                ))}
              </div>
              <div className="mb-3 grid grid-cols-7 gap-1">
                {cells.map((day, index) =>
                  day ? (
                    <button
                      key={day.toISOString()}
                      type="button"
                      className={cn(
                        'rounded-md py-1.5 text-sm hover:bg-muted',
                        selected &&
                          sameDay(day, selected) &&
                          'bg-primary text-primary-foreground hover:bg-primary',
                        sameDay(day, new Date()) &&
                          !(selected && sameDay(day, selected)) &&
                          'ring-1 ring-border',
                      )}
                      onClick={() => applyDay(day)}
                    >
                      {day.getDate()}
                    </button>
                  ) : (
                    <span key={`empty-${index}`} />
                  ),
                )}
              </div>

              <div className="space-y-1.5 border-t pt-3">
                <label
                  className="text-xs font-medium text-muted-foreground"
                  htmlFor={`${fieldId}-time`}
                >
                  Time
                </label>
                <Input
                  id={`${fieldId}-time`}
                  type="time"
                  value={time}
                  onChange={(e) => applyTime(e.target.value)}
                />
              </div>

              <div className="mt-3 flex justify-end gap-2">
                <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
                  Done
                </Button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
