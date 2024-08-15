import "@/styles/globals.css"; // Importa os estilos globais
import type { AppProps } from "next/app"; // Importa os tipos para as props do App

// Função principal do App
export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
