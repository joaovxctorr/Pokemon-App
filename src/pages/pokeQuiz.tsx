import React, { useEffect, useState, useRef } from 'react';
import { getRandomPokemon, getPokemon, getPokemonSpecies, Pokemon } from '../services/pokemonService';

const PokeQuiz: React.FC = () => {
  // Estado para armazenar o Pokémon aleatório a ser adivinhado
  const [randomPokemon, setRandomPokemon] = useState<Pokemon | null>(null);
  // Estado para armazenar o nome do Pokémon digitado pelo usuário
  const [guess, setGuess] = useState<string>('');
  // Estado para armazenar o número de tentativas restantes
  const [attempts, setAttempts] = useState<number>(0);
  // Estado para armazenar o feedback sobre o palpite do usuário
  const [feedback, setFeedback] = useState<{ height: string; weight: string; generation: string; types: string } | null>(null);
  // Estado para armazenar dicas sobre o Pokémon aleatório
  const [hint, setHint] = useState<{ generation: string; height: number; weight: number; types: string[] } | null>(null);
  // Estado para verificar se o jogo acabou
  const [gameOver, setGameOver] = useState<boolean>(false);
  // Estado para controlar o tempo restante para o próximo Pokémon
  const [timeLeft, setTimeLeft] = useState<number>(3600); // 1 hora em segundos

  // Referência para o temporizador
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Efeito colateral para buscar um Pokémon aleatório e iniciar o temporizador
  useEffect(() => {
    // Função para buscar um Pokémon aleatório
    const fetchRandomPokemon = async () => {
      const pokemon = await getRandomPokemon();
      if (pokemon) {
        setRandomPokemon(pokemon);

        // Busca dados adicionais da espécie do Pokémon
        const speciesData = await getPokemonSpecies(pokemon.species.url);
        if (speciesData) {
          setHint({
            generation: speciesData.generation.name, // Armazena a geração do Pokémon
            height: pokemon.height, // Armazena a altura do Pokémon
            weight: pokemon.weight, // Armazena o peso do Pokémon
            types: pokemon.types.map((type) => type.type.name), // Armazena os tipos do Pokémon
          });
        }
      }
    };

    fetchRandomPokemon();

    // Inicializa o temporizador para contar o tempo restante
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current as NodeJS.Timeout);
          return 3600; // Reseta o temporizador para 1 hora
        }
        return prevTime - 1;
      });
    }, 1000);

    // Limpa o temporizador ao desmontar o componente
    return () => clearInterval(timerRef.current as NodeJS.Timeout);
  }, []);

  // Função para lidar com a tentativa do usuário
  const handleGuess = async () => {
    if (!guess || !randomPokemon || gameOver) return;

    // Incrementa o número de tentativas
    setAttempts(attempts + 1);

    // Busca dados do Pokémon digitado
    const guessedPokemon = await getPokemon(guess.toLowerCase());
    if (!guessedPokemon) {
      // Se o Pokémon não for encontrado, dá feedback negativo
      setFeedback({
        height: 'bg-red-500',
        weight: 'bg-red-500',
        generation: 'bg-red-500',
        types: 'bg-red-500',
      });
      return;
    }

    // Se o Pokémon digitado for o correto
    if (guessedPokemon.id === randomPokemon.id) {
      setFeedback({
        height: 'bg-green-500',
        weight: 'bg-green-500',
        generation: 'bg-green-500',
        types: 'bg-green-500',
      });
      setGameOver(true); // Define o jogo como terminado
      return;
    }

    // Calcula as diferenças para gerar o feedback
    const heightDiff = Math.abs(guessedPokemon.height - randomPokemon.height);
    const weightDiff = Math.abs(guessedPokemon.weight - randomPokemon.weight);
    const generationDiff = guessedPokemon.species.url === randomPokemon.species.url ? 'bg-green-500' : 'bg-red-500';
    const typesDiff = guessedPokemon.types.map((type) => type.type.name).filter(type => !randomPokemon.types.map((type) => type.type.name).includes(type)).length;

    // Define o feedback baseado nas diferenças calculadas
    const heightFeedback = heightDiff > 10 ? 'bg-red-500' : 'bg-green-500';
    const weightFeedback = weightDiff > 100 ? 'bg-red-500' : 'bg-green-500';
    const typesFeedback = typesDiff > 0 ? 'bg-red-500' : 'bg-green-500';

    setFeedback({
      height: heightFeedback,
      weight: weightFeedback,
      generation: generationDiff,
      types: typesFeedback,
    });

    // Se o número de tentativas for igual ou maior que 5, define o jogo como terminado
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
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">PokéQuiz</h1>
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full border border-gray-300 text-center">
        {/* Exibe o número de tentativas restantes */}
        <div className="text-lg font-bold mb-4">
          Tentativas: {attempts} / 5
        </div>
        {/* Campo de entrada para o palpite do usuário */}
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder="Adivinhe o Pokémon"
          className="border border-gray-300 rounded-lg px-4 py-2 mb-4 w-full text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {/* Botão para submeter o palpite */}
        <button
          onClick={handleGuess}
          className="bg-blue-500 text-white p-2 rounded-lg w-full hover:bg-blue-600 transition duration-300"
        >
          Adivinhar
        </button>
        {/* Exibe feedback com base no palpite e nas dicas */}
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
        {/* Exibe mensagem e sprite do Pokémon correto quando o jogo termina */}
        {gameOver && randomPokemon && (
          <div className="mt-4">
            <p className="text-lg font-bold text-red-600">O jogo acabou! O Pokémon era {randomPokemon.name}.</p>
            <img src={randomPokemon.sprites.front_default} alt={randomPokemon.name} className="w-24 h-24 mx-auto" />
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
