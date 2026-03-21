"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Lock, Delete, Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) router.replace("/");
  }, [isAuthenticated, router]);

  const handleDigit = async (digit: string) => {
    if (pin.length >= 4 || success) return;
    setError(false);
    const newPin = pin + digit;
    setPin(newPin);

    if (newPin.length === 4) {
      const ok = await login(newPin);
      if (ok) {
        setSuccess(true);
        setTimeout(() => router.replace("/"), 600);
      } else {
        setError(true);
        setTimeout(() => setPin(""), 400);
      }
    }
  };

  const handleDelete = () => {
    setError(false);
    setPin(pin.slice(0, -1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-background to-purple-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-600 to-purple-700 mx-auto mb-4 shadow-lg shadow-violet-300/50">
            <Fingerprint className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">TaskConta</h1>
          <p className="text-sm text-muted-foreground mt-1">Ingresa tu PIN para continuar</p>
        </div>

        {/* PIN Card */}
        <div className="rounded-3xl bg-card border border-border/50 shadow-xl shadow-violet-100/50 p-6">
          {/* PIN dots */}
          <div className="flex justify-center gap-4 mb-8">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "h-4 w-4 rounded-full transition-all duration-200",
                  i < pin.length
                    ? success
                      ? "bg-emerald-500 scale-110"
                      : error
                      ? "bg-red-500 animate-shake"
                      : "bg-violet-600 scale-110"
                    : "bg-muted border-2 border-border"
                )}
              />
            ))}
          </div>

          {error && (
            <p className="text-center text-xs text-red-500 font-medium mb-4 animate-in fade-in duration-200">
              PIN incorrecto, intenta de nuevo
            </p>
          )}

          {success && (
            <p className="text-center text-xs text-emerald-600 font-medium mb-4 animate-in fade-in duration-200">
              Bienvenida, Daniela
            </p>
          )}

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-3">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
              <button
                key={digit}
                onClick={() => handleDigit(digit)}
                className="h-14 rounded-2xl bg-muted/50 hover:bg-violet-100 active:bg-violet-200 text-lg font-semibold text-foreground transition-all duration-150 active:scale-95"
              >
                {digit}
              </button>
            ))}
            <div />
            <button
              onClick={() => handleDigit("0")}
              className="h-14 rounded-2xl bg-muted/50 hover:bg-violet-100 active:bg-violet-200 text-lg font-semibold text-foreground transition-all duration-150 active:scale-95"
            >
              0
            </button>
            <button
              onClick={handleDelete}
              className="h-14 rounded-2xl hover:bg-red-50 active:bg-red-100 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-all duration-150 active:scale-95"
            >
              <Delete className="h-5 w-5" />
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground/50 mt-6">
          PIN por defecto: 1234
        </p>
      </div>
    </div>
  );
}
