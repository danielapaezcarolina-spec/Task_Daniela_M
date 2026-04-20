"use client";

import { useState } from "react";
import { BookOpen, RefreshCw, Sparkles } from "lucide-react";

const localQuotes = [
  // Gabriel García Márquez
  { text: "El secreto de una buena vejez no es otra cosa que un pacto honrado con la soledad.", author: "Gabriel García Márquez · El amor en los tiempos del cólera" },
  { text: "No había para él obstáculo más insalvable que el de ser un hombre grande que amaba.", author: "Gabriel García Márquez · El amor en los tiempos del cólera" },
  { text: "Siempre habrá alguien que te ame de una manera que no mereces.", author: "Gabriel García Márquez" },
  { text: "El amor se hace más grande y noble en la calamidad.", author: "Gabriel García Márquez · El amor en los tiempos del cólera" },
  { text: "Florentino Ariza guardó ese recuerdo como si fuera una brasa viva, durante más de medio siglo.", author: "Gabriel García Márquez · El amor en los tiempos del cólera" },
  { text: "Fermina, este no es el momento de arrepentirnos de lo que pudimos haber hecho y no hicimos.", author: "Gabriel García Márquez · El amor en los tiempos del cólera" },
  { text: "Tenía el don de recordar con más acierto los detalles de las ilusiones que los de la realidad.", author: "Gabriel García Márquez · El amor en los tiempos del cólera" },
  { text: "Era como si Dios hubiera decidido poner a prueba toda capacidad de asombro.", author: "Gabriel García Márquez · Cien años de soledad" },
  { text: "No existe medicina que cure lo que no cura la felicidad.", author: "Gabriel García Márquez" },
  { text: "La vejez comienza cuando se tiene el primer recuerdo sin compañero.", author: "Gabriel García Márquez · El amor en los tiempos del cólera" },
  { text: "El amor era un estado de gracia que no era medio para nada, ni nacía de nada, sino que era el principio y el fin de sí mismo.", author: "Gabriel García Márquez · El amor en los tiempos del cólera" },

  // Jane Austen
  { text: "No hay nada que yo desee más que hacer feliz a la persona que amo.", author: "Jane Austen · Orgullo y prejuicio" },
  { text: "Tú eres demasiado generosa para jugar con mis esperanzas.", author: "Jane Austen · Orgullo y prejuicio" },
  { text: "Ninguna lengua puede expresar el poder y la belleza y el heroísmo del amor.", author: "Jane Austen · Persuasión" },
  { text: "Soy la persona más afortunada del mundo, pues aquellos a quienes amo, me aman.", author: "Jane Austen" },
  { text: "La distancia nada significa cuando alguien significa todo.", author: "Jane Austen" },
  { text: "Si hay algo que deseo más que nada en el mundo, es un corazón que no se rinda.", author: "Jane Austen · Sentido y sensibilidad" },
  { text: "Una mujer que siente profundamente, sufre profundamente. Pero también ama profundamente.", author: "Jane Austen · Sentido y sensibilidad" },
  { text: "Usted me ha enseñado a ser más amable conmigo misma.", author: "Jane Austen · Persuasión" },
  { text: "No me importa lo que me depare el futuro, con tal de que no sea indiferencia.", author: "Jane Austen · Emma" },
  { text: "El amor era imposible, imprudente, y lo quería de todas formas.", author: "Jane Austen · Persuasión" },
  { text: "Solo hay un camino hacia la verdadera felicidad, y ese camino eres tú.", author: "Jane Austen" },

  // Pablo Neruda
  { text: "Quiero hacer contigo lo que la primavera hace con los cerezos.", author: "Pablo Neruda" },
  { text: "Puedo escribir los versos más tristes esta noche. La quise, y a veces ella también me quiso.", author: "Pablo Neruda · Veinte poemas de amor" },
  { text: "Amo el amor que se reparte en besos, lecho y pan.", author: "Pablo Neruda" },
  { text: "Te quiero porque tu boca sabe gritar cuando yo canto.", author: "Pablo Neruda" },
  { text: "Puedo escribir los versos más tristes esta noche. Yo la quise y ella no me quiso. O tal vez me quería. Es tan corto el amor y es tan largo el olvido.", author: "Pablo Neruda · Veinte poemas de amor" },
  { text: "Esta noche me conformo con perderte. Oye cómo te amo y no te turbes.", author: "Pablo Neruda" },
  { text: "Desnuda eres tan simple como una de tus manos.", author: "Pablo Neruda · Cien sonetos de amor" },
  { text: "Te quiero sin saber cómo, ni cuándo, ni de dónde. Te quiero directamente sin problemas ni orgullo.", author: "Pablo Neruda · Cien sonetos de amor" },
  { text: "Amor mío, si muero y tú no mueres, amor mío, si mueres y no muero.", author: "Pablo Neruda" },
  { text: "Eres hija del viento, compañera del sueño, extranjera de la lluvia.", author: "Pablo Neruda" },

  // Emily Brontë
  { text: "Soy Heathcliff. Está siempre en mi mente, no como un placer, como yo mismo.", author: "Emily Brontë · Cumbres borrascosas" },
  { text: "No puedo vivir sin mi vida. No puedo vivir sin mi alma.", author: "Emily Brontë · Cumbres borrascosas" },
  { text: "Seas lo que seas, sé lo que seas, pero no me abandones en este abismo donde no puedo encontrarte.", author: "Emily Brontë · Cumbres borrascosas" },
  { text: "Si todo lo demás perece y él permanece, yo seguiría existiendo.", author: "Emily Brontë · Cumbres borrascosas" },
  { text: "Mi amor por Heathcliff se parece a las rocas eternas debajo: una fuente de poco placer visible, pero necesaria.", author: "Emily Brontë · Cumbres borrascosas" },

  // Charlotte Brontë
  { text: "Eres mi simpatía, mi mejor amigo. Soy mejor y más plena con tu amor.", author: "Charlotte Brontë · Jane Eyre" },
  { text: "Piensas que soy un autómata, una máquina sin sentimientos... ¿que porque soy pobre y sin atractivos, no tengo alma ni corazón?", author: "Charlotte Brontë · Jane Eyre" },
  { text: "Donde tú estés, si el mundo es amargo, estaré contigo.", author: "Charlotte Brontë · Jane Eyre" },
  { text: "Nunca me iré de ti. No voy a dejarte. Mi alma no puede dejarte.", author: "Charlotte Brontë · Jane Eyre" },
  { text: "Soy independiente por voluntad y por creencia.", author: "Charlotte Brontë · Jane Eyre" },

  // Isabel Allende
  { text: "El amor es una enfermedad maravillosa. No hay vacuna que lo cure.", author: "Isabel Allende" },
  { text: "Cuando tienes tanto miedo de perder algo que ya no puedes disfrutarlo, lo has perdido.", author: "Isabel Allende · La casa de los espíritus" },
  { text: "Escribo para que me quieran.", author: "Isabel Allende" },
  { text: "Cuanto más amas a alguien, menos sentido tiene separarte de él.", author: "Isabel Allende · Eva Luna" },
  { text: "Sobreviví porque el fuego que ardía en mi interior era más fuerte que el de alrededor.", author: "Isabel Allende" },
  { text: "No hay nada más poderoso que una idea a la que le ha llegado su momento.", author: "Isabel Allende · La casa de los espíritus" },
  { text: "El amor es una emoción difícil de controlar. Es como el viento, llega sin avisar.", author: "Isabel Allende · Eva Luna" },

  // Paulo Coelho
  { text: "Cuando amamos, siempre nos esforzamos por mejorar.", author: "Paulo Coelho · El alquimista" },
  { text: "El amor es una fuerza que transforma y mejora el Alma del Mundo.", author: "Paulo Coelho · El alquimista" },
  { text: "Solo hay una manera de aprender. Es a través de la acción.", author: "Paulo Coelho · El alquimista" },
  { text: "Cuando quieres algo, todo el universo conspira para que lo consigas.", author: "Paulo Coelho · El alquimista" },
  { text: "Hay que correr el riesgo de no ser correspondido para poder amar de verdad.", author: "Paulo Coelho · Brida" },
  { text: "Tú eres el único ser capaz de darme la felicidad. Y eso me aterra.", author: "Paulo Coelho · Once minutos" },
  { text: "El amor nunca mantiene a un hombre alejado de su Leyenda Personal.", author: "Paulo Coelho · El alquimista" },

  // Victor Hugo
  { text: "Amarte fue nacer dos veces.", author: "Victor Hugo · Los miserables" },
  { text: "La vida es la flor de la que el amor es la miel.", author: "Victor Hugo" },
  { text: "Amas a alguien para siempre, si no puedes dejar de amarlo cuando deberías.", author: "Victor Hugo · Los miserables" },
  { text: "Estar loca de amor es el estado más normal del mundo.", author: "Victor Hugo" },
  { text: "El supremo bien es saber amar y ser amado.", author: "Victor Hugo" },

  // León Tolstói
  { text: "No hay belleza en el mundo que valga más que la de una persona amada.", author: "León Tolstói · Anna Karénina" },
  { text: "Todo lo que sé lo aprendí del amor.", author: "León Tolstói · Anna Karénina" },
  { text: "Él la miró como a una flor recién abierta, y ella lo miró como si él fuera toda la primavera.", author: "León Tolstói · Anna Karénina" },
  { text: "Respeta tus propios deseos. Solo ellos son reales.", author: "León Tolstói" },

  // Nicholas Sparks
  { text: "El verdadero amor es amar a alguien incluso cuando lo conoces de verdad.", author: "Nicholas Sparks · El cuaderno de Noah" },
  { text: "Eres cada razón, cada esperanza y cada sueño que he tenido jamás.", author: "Nicholas Sparks · El cuaderno de Noah" },
  { text: "No es el momento lo que importa, sino las personas que llenan esos momentos.", author: "Nicholas Sparks · Mensaje en una botella" },
  { text: "Hay personas que entran en tu vida y te cambian para siempre.", author: "Nicholas Sparks" },
  { text: "La vida es una locura. Pero la locura es mucho mejor que la razón cuando la vives con alguien que amas.", author: "Nicholas Sparks · Un lugar donde refugiarse" },

  // Charles Dickens
  { text: "Eres el primer sueño de mi alma.", author: "Charles Dickens · Historia de dos ciudades" },
  { text: "No existe oscuridad que el amor no pueda iluminar.", author: "Charles Dickens · Canción de Navidad" },
  { text: "Hay un sabor en las palabras que te aman que ningún otro placer puede igualar.", author: "Charles Dickens" },

  // Jojo Moyes
  { text: "Vivir. Vivir ampliamente. Con todo lo que tienes.", author: "Jojo Moyes · Yo antes de ti" },
  { text: "Quería que fuera diferente. Quería que fuera mejor.", author: "Jojo Moyes · Yo antes de ti" },
  { text: "Te hiciste en mi corazón un hueco que nadie más puede llenar.", author: "Jojo Moyes · Yo antes de ti" },
  { text: "El amor no siempre llega en el momento adecuado.", author: "Jojo Moyes · Después de ti" },

  // Otros clásicos románticos
  { text: "Una sola alma habitando dos cuerpos.", author: "Aristóteles" },
  { text: "Amar y ser amado es sentir el sol desde ambos lados.", author: "David Viscott" },
  { text: "Lo que se hace por amor siempre está más allá del bien y del mal.", author: "Friedrich Nietzsche" },
  { text: "El amor no es mirarse el uno al otro, sino mirar juntos en la misma dirección.", author: "Antoine de Saint-Exupéry · El principito" },
  { text: "Eres responsable para siempre de lo que has domesticado.", author: "Antoine de Saint-Exupéry · El principito" },
  { text: "Lo esencial es invisible a los ojos.", author: "Antoine de Saint-Exupéry · El principito" },
  { text: "No hay amor sin corazón roto al menos una vez.", author: "F. Scott Fitzgerald" },
  { text: "Así que seguimos adelante, botes contra la corriente, arrastrados incesantemente hacia el pasado.", author: "F. Scott Fitzgerald · El gran Gatsby" },
  { text: "En todos sus sueños, en todos sus pensamientos, ella volvía a él.", author: "F. Scott Fitzgerald · El gran Gatsby" },
  { text: "Amarte es como respirar. ¿Cómo podría dejar de hacerlo?", author: "Anónimo" },
  { text: "El amor verdadero no tiene final feliz porque el amor verdadero nunca termina.", author: "Anónimo" },
  { text: "Cuando el amor habla, la voz de todos los dioses hace que el cielo se llene de música.", author: "William Shakespeare · Trabajos de amor perdidos" },
  { text: "Mi corazón es tuyo desde que el tiempo existe, y te seguirá siendo fiel hasta que deje de existir.", author: "William Shakespeare" },
  { text: "El amor profundo no tiene otro deseo que el de realizarse.", author: "Kahlil Gibran · El profeta" },
  { text: "Cuando el amor os llame, seguidle, aunque sus caminos sean duros y escarpados.", author: "Kahlil Gibran · El profeta" },
  { text: "No te enamores de las palabras. Enamórate de lo que hay detrás de ellas.", author: "Rupi Kaur · Leche y miel" },
  { text: "Eres tu propio hogar antes de ser el hogar de alguien más.", author: "Rupi Kaur · El sol y sus flores" },
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

  // Uses local quotes only - external API removed

  return (
    <div>
      <div className="flex items-center justify-between mb-0.5">
        <h1 className="text-lg sm:text-xl font-bold text-foreground">
          {getTimeGreeting()}, Daniela
        </h1>
        <button
          onClick={shuffleQuote}
          className="p-1 rounded-lg hover:bg-muted transition-colors"
          title="Otra frase"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${spinning ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="flex items-start gap-1.5 mt-0.5">
        <Sparkles className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="text-[11px] sm:text-xs text-muted-foreground italic leading-snug line-clamp-2">
            &ldquo;{quote.text}&rdquo;
          </p>
          <p className="text-[10px] text-emerald-500 font-medium mt-0.5">
            — {quote.author}
          </p>
        </div>
      </div>
    </div>
  );
}
