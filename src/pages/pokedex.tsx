import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

// Definição das interfaces para tipagem dos dados
interface PokemonSpecies {
  name: string; // Nome do Pokémon
  url: string;  // URL com os detalhes do Pokémon
}

interface PokemonEntry {
  entry_number: number; // Número de entrada do Pokémon na Pokédex
  pokemon_species: PokemonSpecies; // Dados do Pokémon
}

interface GenerationData {
  [generation: string]: PokemonSpecies[]; // Mapeia cada geração para uma lista de Pokémon
}

const Pokedex: React.FC = () => {
  // Estado para armazenar a lista de Pokémon e os dados de geração
  const [pokemonList, setPokemonList] = useState<PokemonEntry[]>([]);
  const [generationData, setGenerationData] = useState<GenerationData>({});
  const router = useRouter(); // Hook para navegação

  // Effect para buscar a lista de Pokémon quando o componente é montado
  useEffect(() => {
    const fetchPokemonList = async () => {
      try {
        // Faz a requisição para obter a lista de Pokémon
        const response = await fetch('https://pokeapi.co/api/v2/pokedex/national');
        const data = await response.json();
        const pokemonEntries: PokemonEntry[] = data.pokemon_entries;

        // Agrupa os Pokémon por geração
        const groupedByGeneration: GenerationData = pokemonEntries.reduce((acc, entry) => {
          const generation = getGeneration(entry.entry_number); // Determina a geração do Pokémon
          if (!acc[generation]) acc[generation] = []; // Cria um array para a geração se não existir
          acc[generation].push(entry.pokemon_species); // Adiciona o Pokémon ao array da geração
          return acc;
        }, {} as GenerationData);

        setGenerationData(groupedByGeneration); // Atualiza o estado com os dados agrupados
      } catch (error) {
        console.error('Error fetching Pokémon list:', error); // Log de erro em caso de falha
      }
    };

    fetchPokemonList(); // Chama a função de busca
  }, []); // Dependência vazia para rodar apenas uma vez quando o componente é montado

  // Função para determinar a geração do Pokémon baseado no número de entrada
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

  // Função para lidar com o clique em um Pokémon
  const handlePokemonClick = (name: string) => {
    router.push(`/pokemon/${name}`); // Navega para a página de detalhes do Pokémon
  };

  // Função para extrair o ID do Pokémon da URL
  const getPokemonId = (url: string) => {
    const parts = url.split('/');
    return parts[parts.length - 2];
  };

  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold mb-4 flex items-center justify-center">Pokédex</h1>
      {Object.entries(generationData).map(([generation, pokemonEntries]) => (
        <div key={generation} className="mb-8">
          <h2 className="text-3xl font-bold mb-4 flex items-center justify-center">{generation}</h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {pokemonEntries.map((pokemon) => {
              const pokemonId = getPokemonId(pokemon.url);
              const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;

              return (
                <li
                  key={pokemon.name}
                  onClick={() => handlePokemonClick(pokemon.name)} // Adiciona a funcionalidade de clique
                  className="cursor-pointer border border-gray-300 rounded-lg p-4 text-center transform transition-transform hover:scale-125 hover:bg-gray-100"
                >
                  {/* Exibe a imagem do Pokémon */}
                  <img
                    src={imageUrl}
                    alt={pokemon.name}
                    className="mx-auto mb-2 w-16 h-16"
                  />
                  <p className="font-semibold capitalize">{pokemon.name}</p>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Pokedex;
