import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { getRandomPokemon, getPokemon, getPokemonSpecies, Pokemon } from '../services/pokemonService';
import Header from '@/components/Header';

const PokeQuiz: React.FC = () => {
  const [randomPokemon, setRandomPokemon] = useState<Pokemon | null>(null);
  const [guess, setGuess] = useState<string>('');
  const [attempts, setAttempts] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ height: string; weight: string; generation: string; types: string } | null>(null);
  const [hint, setHint] = useState<{ generation: string; height: number; weight: number; types: string[] } | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(3600); // 1 hora em segundos
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [pokemonList, setPokemonList] = useState<string[]>([]);

  // Referência para armazenar o identificador do temporizador
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // Referência para armazenar o timestamp de expiração do temporizador
  const timerExpirationRef = useRef<number>(Date.now() + 3600000);

  useEffect(() => {
    // Recuperar o número de tentativas e o timestamp do temporizador do localStorage
    const savedAttempts = localStorage.getItem('attempts');
    const savedTimerExpiration = localStorage.getItem('timerExpiration');
    
    if (savedAttempts) {
      setAttempts(parseInt(savedAttempts));
    }
    if (savedTimerExpiration) {
      timerExpirationRef.current = parseInt(savedTimerExpiration);
      const remainingTime = Math.max(0, Math.floor((timerExpirationRef.current - Date.now()) / 1000));
      setTimeLeft(remainingTime);
    }

    // Função para buscar um Pokémon aleatório
    const fetchRandomPokemon = async () => {
      const pokemon = await getRandomPokemon();
      if (pokemon) {
        setRandomPokemon(pokemon);

        // Buscar dados adicionais do Pokémon para dicas
        const speciesData = await getPokemonSpecies(pokemon.species.url);
        if (speciesData) {
          setHint({
            generation: speciesData.generation.name,
            height: pokemon.height,
            weight: pokemon.weight,
            types: pokemon.types.map((type) => type.type.name),
          });
        }
      }
    };

    // Função para buscar a lista de Pokémon
    const fetchPokemonList = async () => {
      try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
        const data = await response.json();
        setPokemonList(data.results.map((pokemon: { name: string }) => pokemon.name));
      } catch (error) {
        console.error('Error fetching Pokémon list:', error);
      }
    };

    fetchRandomPokemon();
    fetchPokemonList();

    // Configurar o temporizador para atualizar a cada segundo
    const updateTimer = () => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime - 1;
        if (newTime <= 0) {
          clearInterval(timerRef.current as NodeJS.Timeout);
          setGameOver(true);
          return 3600; // Reseta o temporizador para 1 hora
        }
        return newTime;
      });
    };

    timerRef.current = setInterval(updateTimer, 1000);

    return () => {
      clearInterval(timerRef.current as NodeJS.Timeout);
    };
  }, []);

  useEffect(() => {
    // Salvar o número de tentativas e o timestamp do temporizador no localStorage
    localStorage.setItem('attempts', attempts.toString());
    localStorage.setItem('timerExpiration', (Date.now() + timeLeft * 1000).toString());
  }, [attempts, timeLeft]);

  // Função para buscar sugestões de Pokémon com base na entrada do usuário
  const fetchSuggestions = (query: string) => {
    if (query.length === 0) {
      setSuggestions([]);
      return;
    }

    const filteredSuggestions = pokemonList.filter(name => name.startsWith(query.toLowerCase()));
    setSuggestions(filteredSuggestions);
  };

  useEffect(() => {
    fetchSuggestions(guess);
  }, [guess]);

  // Função para processar a tentativa do usuário
  const handleGuess = async () => {
    if (!guess || !randomPokemon || gameOver) return;

    setAttempts(attempts + 1);

    const guessedPokemon = await getPokemon(guess.toLowerCase());
    if (!guessedPokemon) {
      setFeedback({
        height: 'bg-red-500',
        weight: 'bg-red-500',
        generation: 'bg-red-500',
        types: 'bg-red-500',
      });
      return;
    }

    if (guessedPokemon.id === randomPokemon.id) {
      setFeedback({
        height: 'bg-green-500',
        weight: 'bg-green-500',
        generation: 'bg-green-500',
        types: 'bg-green-500',
      });
      setGameOver(true);
      return;
    }

    const heightDiff = Math.abs(guessedPokemon.height - randomPokemon.height);
    const weightDiff = Math.abs(guessedPokemon.weight - randomPokemon.weight);
    const generationDiff = guessedPokemon.species.url === randomPokemon.species.url ? 'bg-green-500' : 'bg-red-500';
    const typesDiff = guessedPokemon.types.map((type) => type.type.name).filter(type => !randomPokemon.types.map((type) => type.type.name).includes(type)).length;

    const heightFeedback = heightDiff > 10 ? 'bg-red-500' : 'bg-green-500';
    const weightFeedback = weightDiff > 100 ? 'bg-red-500' : 'bg-green-500';
    const typesFeedback = typesDiff > 0 ? 'bg-red-500' : 'bg-green-500';

    setFeedback({
      height: heightFeedback,
      weight: weightFeedback,
      generation: generationDiff,
      types: typesFeedback,
    });

    if (attempts >= 4) {
      setGameOver(true);
    }
  };

  // Função para formatar o tempo restante em minutos e segundos
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-green-100 to-green-300">
      <Header />
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-6 text-gray-800">PokéQuiz</h1>
      <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-lg max-w-xs sm:max-w-md lg:max-w-lg w-full border border-gray-300 text-center">
        <div className="text-lg font-bold mb-4">
          Tentativas: {attempts} / 5
        </div>
        <div className="relative w-full">
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Adivinhe o Pokémon"
            className="border border-gray-300 rounded-lg px-3 py-2 mb-4 w-full text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {suggestions.length > 0 && (
            <ul className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
              {suggestions.map((suggestion) => (
                <li
                  key={suggestion}
                  onClick={() => {
                    setGuess(suggestion);
                    setSuggestions([]);
                  }}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          onClick={handleGuess}
          className="bg-blue-500 text-white p-2 rounded-lg w-full hover:bg-blue-600 transition duration-300"
        >
          Adivinhar
        </button>
        {feedback && hint && (
          <div className="mt-4 text-left">
            <div className={`p-2 rounded ${feedback.generation}`}>
              <span className="font-bold">Geração: </span> {hint.generation}
            </div>
            <div className={`p-2 rounded ${feedback.height}`}>
              <span className="font-bold">Altura: </span> {hint.height / 10} m
            </div>
            <div className={`p-2 rounded ${feedback.weight}`}>
              <span className="font-bold">Peso: </span> {hint.weight / 10} kg
            </div>
            <div className={`p-2 rounded ${feedback.types}`}>
              <span className="font-bold">Tipos: </span> {hint.types.join(', ')}
            </div>
          </div>
        )}
        {gameOver && randomPokemon && (
          <div className="mt-4">
            <p className="text-lg font-bold text-red-600">O jogo acabou! O Pokémon era {randomPokemon.name}.</p>
            <Image
              src={randomPokemon.sprites.front_default}
              alt={randomPokemon.name}
              width={80}
              height={80}
              className="mx-auto"
            />
            <div className="text-lg font-bold mt-4">
              Próximo Pokémon em: {formatTime(timeLeft)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PokeQuiz;
