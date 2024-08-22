import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PokemonCard from '../components/PokemonCard';
import Header from '../components/Header';

interface Pokemon {
  name: string;
}

const Home: React.FC = () => {
  const [pokemonName, setPokemonName] = useState<string>(''); 
  const [search, setSearch] = useState<string>(''); 
  const [suggestions, setSuggestions] = useState<string[]>([]); 
  const [showSearch, setShowSearch] = useState<boolean>(true); // Estado para controlar a visibilidade do formulário
  const router = useRouter(); 

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    setPokemonName(search.toLowerCase());
    setShowSearch(false); // Oculta o formulário após a pesquisa
  };

  const fetchSuggestions = async (query: string) => {
    if (query.length === 0) {
      setSuggestions([]);
      return;
    }
    
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1000`);
      const data = await response.json();
      const allPokemons: Pokemon[] = data.results;
      
      const filteredSuggestions = allPokemons
        .map(pokemon => pokemon.name)
        .filter(name => name.startsWith(query.toLowerCase()));
      
      setSuggestions(filteredSuggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  useEffect(() => {
    fetchSuggestions(search);
  }, [search]);

  const goToPokedex = () => {
    router.push('/pokedex');
  };

  const goToPokeQuiz = () => {
    router.push('/pokeQuiz');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearch(suggestion);
    setPokemonName(suggestion);
    setSuggestions([]);
    setShowSearch(false); // Oculta o formulário após a pesquisa
  };

  const handleResetSearch = () => {
    setSearch('');
    setPokemonName('');
    setSuggestions([]);
    setShowSearch(true); // Mostra o formulário novamente
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 p-4">
      <Header /> 
      <main className="flex flex-col items-center justify-center flex-1">
        {showSearch && (
          <>
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 md:mb-8 text-gray-800">
              PokéSearch
            </h1>
            <form onSubmit={handleSearch} className="flex flex-col items-center w-full max-w-xs sm:max-w-sm md:max-w-md mb-6 md:mb-8">
              <div className="relative w-full">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Procure por um Pokémon"
                  className="border border-gray-300 rounded-lg px-4 py-2 mb-4 w-full text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {suggestions.length > 0 && (
                  <ul className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    {suggestions.map((suggestion) => (
                      <li
                        key={suggestion}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded-lg w-full hover:bg-blue-600 transition duration-300"
              >
                Buscar
              </button>
            </form>
          </>
        )}
        {pokemonName && (
          <div className="flex flex-col items-center w-full max-w-xs sm:max-w-sm md:max-w-md mb-6 md:mb-8">
            <div className="flex flex-col items-center mb-4">
              <PokemonCard name={pokemonName} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
