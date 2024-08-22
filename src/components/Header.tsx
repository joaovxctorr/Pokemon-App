// components/Header.tsx
import Link from 'next/link';
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-blue-500 text-white py-2 shadow-md fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto max-w-4xl flex items-center justify-between px-4">
        <nav className="flex-grow flex justify-center space-x-4">
          <Link href="/" className="text-lg font-bold hover:underline">
            PokeSearch
          </Link>
          <Link href="/pokedex" className="text-lg font-semibold hover:underline">
            Pokedex
          </Link>
          <Link href="/pokeQuiz" className="text-lg font-semibold hover:underline">
            PokeQuiz
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
