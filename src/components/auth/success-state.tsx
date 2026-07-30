import { CheckCircle2 } from "lucide-react";

interface SuccessStateProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function SuccessState({ title, subtitle, children }: SuccessStateProps) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-8 relative w-fit">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 border border-emerald-500/20 animate-in zoom-in-50 duration-500">
          <CheckCircle2 className="h-10 w-10 text-emerald-600 animate-in fade-in zoom-in-75 duration-700 delay-200" />
        </div>
        <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 border-[3px] border-background animate-in zoom-in-50 duration-500 delay-300">
          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
      </div>

      <h1 className="text-[28px] font-bold text-foreground tracking-tight animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
        {title}
      </h1>
      <p className="mt-3 text-[15px] text-muted-foreground leading-relaxed max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
        {subtitle}
      </p>

      <div className="mt-8 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
        {children}
      </div>
    </div>
  );
}
