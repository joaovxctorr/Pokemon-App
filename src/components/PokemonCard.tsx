import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getPokemon, getTypeWeaknesses, getPokemonSpecies, getEvolutionChain, Pokemon, PokemonType } from '../services/pokemonService';

type PokemonCardProps = {
  name: string;
};

const PokemonCard: React.FC<PokemonCardProps> = ({ name }) => {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [weaknesses, setWeaknesses] = useState<string[]>([]);
  const [evolutions, setEvolutions] = useState<{ name: string; sprite: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPokemonData = async () => {
      try {
        const data = await getPokemon(name);

        if (data) {
          setPokemon(data);

          // Busca as fraquezas com base nos tipos do Pokémon
          const typeWeaknessesPromises = data.types.map(async (typeInfo: PokemonType) => {
            const typeData = await getTypeWeaknesses(typeInfo.type.name);
            return typeData ? typeData.double_damage_from.map((weak: { name: string }) => weak.name) : [];
          });

          const weaknessesData: string[][] = await Promise.all(typeWeaknessesPromises);
          const combinedWeaknesses: string[] = weaknessesData.flat();
          setWeaknesses([...new Set(combinedWeaknesses)]);

          // Busca dados da espécie para obter a cadeia de evolução
          const speciesData = await getPokemonSpecies(data.species.url);
          if (speciesData) {
            const evolutionChainUrl = speciesData.evolution_chain.url;
            const evolutionData = await getEvolutionChain(evolutionChainUrl);

            if (evolutionData) {
              const evolutionsList = await extractEvolutions(evolutionData);
              setEvolutions(evolutionsList);
            }
          }
        } else {
          setError('Pokémon não encontrado');
        }
      } catch (err) {
        console.error('Error fetching Pokémon data:', err);
        setError('Error fetching Pokémon data');
      }
    };

    fetchPokemonData();
  }, [name]);

  // Função para extrair evoluções da cadeia de evolução
  const extractEvolutions = async (evolutionData: any): Promise<{ name: string; sprite: string }[]> => {
    const evolutions: { name: string; sprite: string }[] = [];

    const processChain = async (chain: any) => {
      const pokemonName = chain.species.name;
      const sprite = await fetchPokemonSprite(pokemonName);
      evolutions.push({ name: pokemonName, sprite });

      if (chain.evolves_to.length > 0) {
        for (const evolveTo of chain.evolves_to) {
          await processChain(evolveTo);
        }
      }
    };

    await processChain(evolutionData.chain);
    return evolutions;
  };

  // Função para buscar o sprite de um Pokémon pelo nome
  const fetchPokemonSprite = async (name: string): Promise<string> => {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    const data = await response.json();
    return data.sprites.front_default;
  };

  const goToNextPokemon = () => {
    if (pokemon) {
      const nextId = pokemon.id + 1;
      router.push(`/pokemon/${nextId}`);
    }
  };

  const goToPreviousPokemon = () => {
    if (pokemon && pokemon.id > 1) {
      const previousId = pokemon.id - 1;
      router.push(`/pokemon/${previousId}`);
    }
  };

  if (error) return <div className="flex items-center justify-center h-screen text-red-500 text-lg">{error}</div>;
  if (!pokemon) return <div className="flex items-center justify-center h-screen text-lg">Loading...</div>;

  return (
    <div className="flex items-center justify-center h-screen p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full border border-gray-300 transition-transform transform hover:scale-105 hover:shadow-xl">
        <div className="text-center mb-4">
          <p className="text-2xl font-bold mb-2 text-gray-800">#{pokemon.id}</p>
          <img src={pokemon.sprites.front_default} alt={pokemon.name} className="w-32 h-32 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2 capitalize text-gray-800">{pokemon.name}</h2>
          <p className="text-lg text-gray-700 mb-2">Types: {pokemon.types.map((typeInfo: PokemonType) => typeInfo.type.name).join(', ')}</p>
          <p className="text-lg text-gray-700 mb-4">Weaknesses: {weaknesses.join(', ')}</p>
          <p className="text-lg text-gray-700 mb-2">Height: {pokemon.height / 10} m</p>
          <p className="text-lg text-gray-700 mb-2">Weight: {pokemon.weight / 10} kg</p>
          <p className="text-lg text-gray-700 mb-4">Abilities: {pokemon.abilities.map((ability) => ability.ability.name).join(', ')}</p>
          
          {/* Exibe a seção de evoluções apenas se houver mais de uma evolução */}
          {evolutions.length > 1 && (
            <div>
              <h3 className="text-2xl font-bold mb-2">Evolutions:</h3>
              <div className="flex overflow-x-auto space-x-4">
                {evolutions.map((evolution) => (
                  <div key={evolution.name} className="text-center">
                    <img src={evolution.sprite} alt={evolution.name} className="w-24 h-24 mb-2" />
                    <p className="text-lg font-semibold capitalize">{evolution.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-6">
            
            <button
              onClick={goToPreviousPokemon}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Previous
            </button>

            <button
              onClick={goToNextPokemon}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Next
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonCard;
