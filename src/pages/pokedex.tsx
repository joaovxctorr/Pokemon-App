import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '@/components/Header'; 
import Image from 'next/image';

interface PokemonSpecies {
  name: string;
  url: string;
}

interface PokemonEntry {
  entry_number: number;
  pokemon_species: PokemonSpecies;
}

interface GenerationData {
  [generation: string]: PokemonSpecies[];
}

const Pokedex: React.FC = () => {
  const [generationData, setGenerationData] = useState<GenerationData>({});
  const router = useRouter();

  useEffect(() => {
    const fetchPokemonList = async () => {
      try {
        const response = await fetch('https://pokeapi.co/api/v2/pokedex/national');
        const data = await response.json();
        const pokemonEntries: PokemonEntry[] = data.pokemon_entries;

        const groupedByGeneration: GenerationData = pokemonEntries.reduce((acc, entry) => {
          const generation = getGeneration(entry.entry_number);
          if (!acc[generation]) acc[generation] = [];
          acc[generation].push(entry.pokemon_species);
          return acc;
        }, {} as GenerationData);

        setGenerationData(groupedByGeneration);
      } catch (error) {
        console.error('Error fetching Pokémon list:', error);
      }
    };

    fetchPokemonList();
  }, []);

  const getGeneration = (entryNumber: number): string => {
    if (entryNumber <= 151) return 'Generation I';
    if (entryNumber <= 251) return 'Generation II';
    if (entryNumber <= 386) return 'Generation III';
    if (entryNumber <= 493) return 'Generation IV';
    if (entryNumber <= 649) return 'Generation V';
    if (entryNumber <= 721) return 'Generation VI';
    if (entryNumber <= 809) return 'Generation VII';
    return 'Generation VIII';
  };

  const handlePokemonClick = (name: string) => {
    router.push(`/pokemon/${name}`);
  };

  const getPokemonId = (url: string) => {
    const parts = url.split('/');
    return parts[parts.length - 2];
  };

  return (
    <div>
      <Header />
      <div className="pt-16 p-4"> 
        <h1 className="text-3xl md:text-4xl font-bold mb-6 flex items-center justify-center">Pokédex</h1>
        {Object.entries(generationData).map(([generation, pokemonEntries]) => (
          <div key={generation} className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 flex items-center justify-center">{generation}</h2>
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {pokemonEntries.map((pokemon) => {
                const pokemonId = getPokemonId(pokemon.url);
                const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;

                return (
                  <li
                    key={pokemon.name}
                    onClick={() => handlePokemonClick(pokemon.name)}
                    className="cursor-pointer border border-gray-300 rounded-lg p-4 text-center transform transition-transform hover:scale-125 hover:bg-gray-100"
                  >
                    <Image
                      src={imageUrl}
                      alt={pokemon.name}
                      width={64} 
                      height={64} 
                      className="mx-auto mb-2"
                    />
                    <p className="font-semibold capitalize">{pokemon.name}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pokedex;
