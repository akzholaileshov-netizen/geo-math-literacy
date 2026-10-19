import { Component, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { failed: boolean };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="surface mx-auto mt-16 max-w-xl rounded-3xl px-6 py-10">
        <h1 className="font-serif text-3xl leading-tight">Математикалық сауаттылық</h1>
        <p className="mt-4 leading-relaxed">Бетті ашу мүмкін болмады. Нәтиже осы құрылғыда сақталады.</p>
        <p className="mt-2 leading-relaxed">Не удалось открыть страницу. Результат сохраняется на этом устройстве.</p>
        <a href="/" className="mt-6 inline-flex min-h-11 items-center text-brass">
          Басты бет · На главную
        </a>
      </main>
    );
  }
}
