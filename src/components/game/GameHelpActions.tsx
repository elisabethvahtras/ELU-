import { BookOpen, Play } from "lucide-react";
import { Btn } from "./ui";

export function GameHelpActions({ onGuide, onDemo, inverse = false }: { onGuide: () => void; onDemo: () => void; inverse?: boolean }) {
  const appearance = inverse ? "border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10" : "";
  return <div className="flex shrink-0 items-center gap-1.5" role="group" aria-label="Mängu abi">
    <Btn variant="outline" onClick={onGuide} className={`w-auto gap-1.5 rounded-lg px-2.5 text-xs ${appearance}`}><BookOpen className="size-4 shrink-0" />Juhend</Btn>
    <Btn variant="outline" onClick={onDemo} aria-label="2-minuti demo" title="Mängu tutvustus · 2 minutit" className={`w-auto gap-1.5 rounded-lg px-2.5 text-xs ${appearance}`}><Play className="size-4 shrink-0" />Demo<span className="hidden sm:inline">· 2 min</span></Btn>
  </div>;
}