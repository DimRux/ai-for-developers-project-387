import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-muted-foreground">Страница не найдена</p>
      <Link to="/" className="mt-4 text-sm text-primary underline">
        На главную
      </Link>
    </div>
  );
}
