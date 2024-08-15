// src/services/pokemonService.ts

import axios, { AxiosError } from 'axios';

const API_URL = 'https://pokeapi.co/api/v2';

export type PokemonType = {
  slot: number;
  type: {
    name: string;
    url: string;
  };
};

export type PokemonAbility = {
  ability: {
    name: string;
    url: string;
  };
};

export type Pokemon = {
  id: number;
  name: string;
  sprites: {
    front_default: string;
  };
  types: PokemonType[];
  height: number;
  weight: number;
  abilities: PokemonAbility[];
  species: {
    url: string;
  };
};

export type DamageRelations = {
  double_damage_from: {
    name: string;
    url: string;
  }[];
};

export type EvolutionChain = {
  chain: {
    species: {
      name: string;
    };
    evolves_to: EvolutionChain[];
  };
};

export type Generation = {
  name: string;
};

export type PokemonSpecies = {
  evolution_chain: {
    url: string;
  };
  generation: Generation;
};

export const getPokemon = async (nameOrId: string): Promise<Pokemon | null> => {
  try {
    const response = await axios.get(`${API_URL}/pokemon/${nameOrId}`);
    return response.data as Pokemon;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Error fetching Pokémon data: ${error.message}`);
    }
    return null;
  }
};

export const getTypeWeaknesses = async (type: string): Promise<DamageRelations | null> => {
  try {
    const response = await axios.get(`${API_URL}/type/${type}`);
    return response.data.damage_relations as DamageRelations;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Error fetching type weaknesses: ${error.message}`);
    }
    return null;
  }
};

export const getPokemonSpecies = async (url: string): Promise<PokemonSpecies | null> => {
  try {
    const response = await axios.get(url);
    return response.data as PokemonSpecies;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Error fetching Pokémon species data: ${error.message}`);
    }
    return null;
  }
};

export const getEvolutionChain = async (url: string): Promise<EvolutionChain | null> => {
  try {
    const response = await axios.get(url);
    return response.data as EvolutionChain;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Error fetching evolution chain data: ${error.message}`);
    }
    return null;
  }
};

export const getRandomPokemon = async (): Promise<Pokemon | null> => {
  const randomId = Math.floor(Math.random() * 898) + 1; // Há 898 Pokémons na Pokédex nacional
  return await getPokemon(randomId.toString());
};
