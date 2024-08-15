import React, { useState } from 'react';
import { useRouter } from 'next/router'; 
import PokemonCard from '../components/PokemonCard'; 

const Home: React.FC = () => {
  const [pokemonName, setPokemonName] = useState<string>(''); // Estado para armazenar o nome do Pokémon a ser buscado 
  const [search, setSearch] = useState<string>(''); // Estado para armazenar o valor da busca
  const router = useRouter(); // Instancia o hook useRouter para navegação entre páginas

  // Função para lidar com o envio do formulário
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Previne o comportamento padrão do formulário (recarregar a página)
    setPokemonName(search); // Define o nome do Pokémon com o valor da busca
  };

  // Função para navegar para a página da Pokédex
  const goToPokedex = () => {
    router.push('/pokedex'); // Navega para a página /pokedex
  };

  // Função para navegar para a página do PokeQuiz
  const goToPokeQuiz = () => {
    router.push('/pokeQuiz'); // Navega para a página /pokeQuiz
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 p-4">
      {/* Container principal da página, centraliza o conteúdo e aplica um gradiente de fundo */}
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
        PokéSearch
      </h1>
      {/* Título principal da página */}
      <form onSubmit={handleSearch} className="flex flex-col items-center w-full max-w-md mb-8">
        {/* Formulário para busca de Pokémon */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)} // Atualiza o estado da busca ao digitar
          placeholder="Procure por um pokemon"
          className="border border-gray-300 rounded-lg px-4 py-2 mb-4 w-full text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded-lg w-full hover:bg-blue-600 transition duration-300"
        >
          Buscar
        </button>
      </form>
      <div className="flex flex-col items-center w-full max-w-md mb-8">
        {/* Container para o PokémonCard */}
        {pokemonName && <PokemonCard name={pokemonName} />}
        {/* Exibe o componente PokemonCard se houver um nome de Pokémon */}
      </div>
      <div className="flex space-x-4 mt-8">
        <button
          onClick={goToPokedex}
          className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition duration-300"
        >
          Pokédex
        </button>

        <button
          onClick={goToPokeQuiz}
          className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition duration-300"
        >
          PokeQuiz
        </button>
      </div>
    </div>
  );
};

export default Home;
