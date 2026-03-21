"use client";

import { useState, useEffect } from "react";
import { BookOpen, RefreshCw, Sparkles } from "lucide-react";

const localQuotes = [
  { text: "Un lector vive mil vidas antes de morir. El que nunca lee vive solo una.", author: "George R.R. Martin" },
  { text: "Los libros son los amigos más silenciosos y constantes, los consejeros más accesibles y los maestros más pacientes.", author: "Charles W. Eliot" },
  { text: "No hay amigo más leal que un libro.", author: "Ernest Hemingway" },
  { text: "La lectura es para la mente lo que el ejercicio es para el cuerpo.", author: "Joseph Addison" },
  { text: "Cada libro es un viaje, cada página una aventura.", author: "Anónimo" },
  { text: "El éxito no es la clave de la felicidad. La felicidad es la clave del éxito.", author: "Albert Schweitzer" },
  { text: "La disciplina es el puente entre las metas y los logros.", author: "Jim Rohn" },
  { text: "Haz de cada día tu obra maestra.", author: "John Wooden" },
  { text: "El único modo de hacer un gran trabajo es amar lo que haces.", author: "Steve Jobs" },
  { text: "No cuentes los días, haz que los días cuenten.", author: "Muhammad Ali" },
  { text: "La mejor inversión que puedes hacer es en ti misma.", author: "Warren Buffett" },
  { text: "Un libro abierto es un cerebro que habla.", author: "Proverbio hindú" },
  { text: "Siembra un acto y cosecharás un hábito. Siembra un hábito y cosecharás un carácter.", author: "Charles Reade" },
  { text: "La vida es lo que pasa mientras estás ocupado haciendo otros planes.", author: "John Lennon" },
  { text: "El conocimiento habla, pero la sabiduría escucha.", author: "Jimi Hendrix" },
  { text: "Lee y conducirás, no leas y serás conducido.", author: "Santa Teresa de Jesús" },
  { text: "Hay más tesoros en los libros que en todo el botín de los piratas.", author: "Walt Disney" },
  { text: "La creatividad es la inteligencia divirtiéndose.", author: "Albert Einstein" },
  { text: "Nunca es tarde para ser lo que podrías haber sido.", author: "George Eliot" },
  { text: "Organizar es el arte de darle a cada cosa su lugar y a cada momento su tarea.", author: "Anónimo" },
];

const greetings = [
  "¿Ya viste tu frase del día?",
  "Tu frase de hoy te va a encantar",
  "Mira lo que te traje hoy",
  "Tu dosis de inspiración diaria",
  "Lee esto antes de empezar el día",
  "Esto es para ti hoy",
];

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 18) return "Buenas tardes";
  return "Buenas noches";
}

function getDailyIndex(arr: unknown[], offset = 0): number {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate() + offset;
  return seed % arr.length;
}

export function Greeting() {
  const [quote, setQuote] = useState(localQuotes[getDailyIndex(localQuotes)]);
  const [greeting] = useState(greetings[getDailyIndex(greetings)]);
  const [spinning, setSpinning] = useState(false);

  const shuffleQuote = () => {
    setSpinning(true);
    const random = Math.floor(Math.random() * localQuotes.length);
    setQuote(localQuotes[random]);
    setTimeout(() => setSpinning(false), 500);
  };

  useEffect(() => {
    async function fetchQuote() {
      try {
        const res = await fetch("https://api.quotable.io/random?maxLength=120", {
          signal: AbortSignal.timeout(3000),
        });
        if (res.ok) {
          const data = await res.json();
          setQuote({ text: data.content, author: data.author });
        }
      } catch {
        // Keep local quote
      }
    }
    fetchQuote();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          {getTimeGreeting()}, Daniela
        </h1>
        <button
          onClick={shuffleQuote}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          title="Otra frase"
        >
          <RefreshCw className={`h-4 w-4 text-muted-foreground ${spinning ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="flex items-start gap-2 mt-1">
        <Sparkles className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="text-xs sm:text-sm text-muted-foreground italic leading-snug">
            &ldquo;{quote.text}&rdquo;
          </p>
          <p className="text-[11px] text-emerald-500 font-medium mt-0.5">
            — {quote.author}
          </p>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">
            Daniela, {greeting}
          </p>
        </div>
      </div>
    </div>
  );
}
