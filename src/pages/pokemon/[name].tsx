import { GetServerSideProps } from 'next';
import React from 'react';
import { useRouter } from 'next/router';

// Definição da interface para as props do componente
interface PokemonProps {
  pokemon: {
    id: number; // ID do Pokémon
    name: string; // Nome do Pokémon
    sprites: {
      front_default: string; // URL da imagem frontal do Pokémon
    };
    types: { type: { name: string } }[]; // Tipos do Pokémon
    height: number; // Altura do Pokémon em decímetros
    weight: number; // Peso do Pokémon em hectogramas
    abilities: { ability: { name: string } }[]; // Habilidades do Pokémon
  } | null;
}

const PokemonDetail: React.FC<PokemonProps> = ({ pokemon }) => {
  const router = useRouter(); // Hook do Next.js para navegação

  // Se o Pokémon não for encontrado, exibe uma mensagem de erro
  if (!pokemon) {
    return <div className="text-center text-red-500">Pokémon não encontrado</div>;
  }

  // Função para navegar para o próximo Pokémon
  const handleNext = () => {
    router.push(`/pokemon/${pokemon.id + 1}`);
  };

  // Função para navegar para o Pokémon anterior
  const handlePrevious = () => {
    if (pokemon.id > 1) {
      router.push(`/pokemon/${pokemon.id - 1}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-100 to-blue-300">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">{pokemon.name}</h1>
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full border border-gray-300 text-center">
        <img src={pokemon.sprites.front_default} alt={pokemon.name} className="w-32 h-32 mx-auto mb-4" />
        <p className="text-2xl font-bold mb-2 text-gray-800">#{pokemon.id}</p>
        <p className="text-lg text-gray-700 mb-2">Types: {pokemon.types.map((type) => type.type.name).join(', ')}</p>
        <p className="text-lg text-gray-700 mb-2">Height: {pokemon.height / 10} m</p>
        <p className="text-lg text-gray-700 mb-2">Weight: {pokemon.weight / 10} kg</p>
        <p className="text-lg text-gray-700 mb-4">Abilities: {pokemon.abilities.map((ability) => ability.ability.name).join(', ')}</p>
        <div className="flex justify-between mt-4">
          <button
            onClick={handlePrevious} // Navegar para o Pokémon anterior
            disabled={pokemon.id <= 1} // Desabilitar o botão se o Pokémon for o primeiro
            className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition duration-300 disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            onClick={handleNext} // Navegar para o próximo Pokémon
            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Próximo
          </button>
        </div>
      </div>
    </div>
  );
};

// Função para obter dados do servidor
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { name } = context.query; // Obtém o nome do Pokémon da query da URL

  try {
    // Faz a requisição para obter os dados do Pokémon da API
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    const pokemon = await res.json(); // Converte a resposta em JSON

    return {
      props: {
        pokemon, // Passa os dados do Pokémon como props para o componente
      },
    };
  } catch (error) {
    // Se houver um erro na requisição, passa null como props
    return {
      props: {
        pokemon: null,
      },
    };
  }
};

export default PokemonDetail;
