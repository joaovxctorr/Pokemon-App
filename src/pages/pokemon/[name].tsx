import { GetServerSideProps } from 'next';
import React from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Header from '@/components/Header'; 

interface PokemonProps {
  pokemon: {
    id: number;
    name: string;
    sprites: {
      front_default: string;
    };
    types: { type: { name: string } }[];
    height: number;
    weight: number;
    abilities: { ability: { name: string } }[];
  } | null;
}

const PokemonDetail: React.FC<PokemonProps> = ({ pokemon }) => {
  const router = useRouter();

  if (!pokemon) {
    return <div className="text-center text-red-500">Pokémon não encontrado</div>;
  }

  const handleNext = () => {
    router.push(`/pokemon/${pokemon.id + 1}`);
  };

  const handlePrevious = () => {
    if (pokemon.id > 1) {
      router.push(`/pokemon/${pokemon.id - 1}`);
    }
  };

  const handleSearchAgain = () => {
    router.push('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
      <Header /> 
      <main className="flex flex-col items-center justify-center flex-1 p-4 md:p-6">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 md:mb-8 text-gray-800 capitalize">
          {pokemon.name}
        </h1>
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg max-w-sm md:max-w-md w-full border border-gray-300 text-center">
          <Image
            src={pokemon.sprites.front_default}
            alt={pokemon.name}
            width={128} 
            height={128} 
            className="mx-auto mb-4"
          />
          <p className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">#{pokemon.id}</p>
          <p className="text-lg md:text-xl text-gray-700 mb-2">
            Types: {pokemon.types.map((type) => type.type.name).join(', ')}
          </p>
          <p className="text-lg md:text-xl text-gray-700 mb-2">Height: {pokemon.height / 10} m</p>
          <p className="text-lg md:text-xl text-gray-700 mb-2">Weight: {pokemon.weight / 10} kg</p>
          <p className="text-lg md:text-xl text-gray-700 mb-4">
            Abilities: {pokemon.abilities.map((ability) => ability.ability.name).join(', ')}
          </p>
          <div className="flex flex-col md:flex-row justify-between mt-4">
            <button
              onClick={handlePrevious}
              disabled={pokemon.id <= 1}
              className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition duration-300 disabled:opacity-50 w-full md:w-auto mb-2 md:mb-0 md:mr-2"
            >
              Anterior
            </button>
            <button
              onClick={handleNext}
              className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition duration-300 w-full md:w-auto"
            >
              Próximo
            </button>
          </div>
          <button
            onClick={handleSearchAgain}
            className="bg-green-500 text-white px-4 py-2 rounded-lg mt-4 hover:bg-green-600 transition duration-300 w-full"
          >
            Buscar novamente
          </button>
        </div>
      </main>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { name } = context.query;

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    const pokemon = await res.json();

    return {
      props: {
        pokemon,
      },
    };
  } catch (error) {
    return {
      props: {
        pokemon: null,
      },
    };
  }
};

// pokemon é definido como null. Isso indica que não foi possível obter os dados do Pokémon, e o componente da página pode exibir uma mensagem de erro ou um estado alternativo

export default PokemonDetail;
