import { useState } from 'react';
import { useAdminEventTypes } from '@/entities/event-type';
import { useCreateEventType } from '@/features/create-event-type';
import { EventTypesList } from '@/widgets/event-types-list';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from '@/shared/ui';
import { ApiRequestError } from '@/shared/api/client';

export function AdminEventTypes() {
  const { data, isLoading } = useAdminEventTypes();
  const createEventType = useCreateEventType();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState({
    id: '',
    title: '',
    description: '',
    durationMinutes: 30,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Загрузка...</div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    createEventType.mutate(form, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setForm({ id: '', title: '', description: '', durationMinutes: 30 });
      },
      onError: (error) => {
        if (error instanceof ApiRequestError) {
          switch (error.code) {
            case 'EVENT_TYPE_ID_CONFLICT':
              setFieldErrors({ id: 'Тип события с таким ID уже существует' });
              break;
            case 'VALIDATION_ERROR':
              setFormError(error.message);
              break;
            default:
              setFormError('Произошла ошибка при создании типа события.');
          }
        } else {
          setFormError('Произошла ошибка при создании типа события.');
        }
      },
    });
  };

  return (
    <div className="p-8">
      <EventTypesList eventTypes={data?.items ?? []} onAdd={() => setIsDialogOpen(true)} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новый тип события</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {formError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="et-id">ID</Label>
              <Input
                id="et-id"
                value={form.id}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, id: e.target.value })
                }
                required
              />
              {fieldErrors.id && (
                <p className="text-sm text-destructive">{fieldErrors.id}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="et-title">Название</Label>
              <Input
                id="et-title"
                value={form.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, title: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="et-desc">Описание</Label>
              <Input
                id="et-desc"
                value={form.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, description: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="et-duration">Длительность (мин)</Label>
              <Input
                id="et-duration"
                type="number"
                min={1}
                max={1440}
                value={form.durationMinutes}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm({
                    ...form,
                    durationMinutes: Number(e.target.value),
                  })
                }
                required
              />
            </div>
            <Button type="submit" disabled={createEventType.isPending} className="w-full">
              {createEventType.isPending ? 'Создание...' : 'Создать'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
