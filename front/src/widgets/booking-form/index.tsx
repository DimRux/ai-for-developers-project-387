import { useState } from 'react';
import { Button, Input, Label } from '@/shared/ui';
import type { components } from '@/shared/api/types';

type Guest = components['schemas']['Guest'];
type Slot = components['schemas']['Slot'];

interface BookingFormProps {
  slot: Slot | null;
  onSubmit: (guest: Guest) => void;
  isPending?: boolean;
}

export function BookingForm({ slot, onSubmit, isPending }: BookingFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  if (!slot) {
    return <p className="text-sm text-muted-foreground">Выберите слот для бронирования</p>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, email, notes: notes || undefined });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="guest-name">Имя</Label>
        <Input
          id="guest-name"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="guest-email">Email</Label>
        <Input
          id="guest-email"
          type="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="guest-notes">Комментарий</Label>
        <Input
          id="guest-notes"
          value={notes}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotes(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Бронирование...' : 'Забронировать'}
      </Button>
    </form>
  );
}
