import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white bg-opacity-5 backdrop-blur-lg border-b border-white border-opacity-10 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">💬</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Discord Release Notes
              </h1>
              <p className="text-xs text-gray-400">Conversor Markdown → Discord</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            <a
              href="https://github.com/eduardofaneli/disco-release-notes#readme"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-200 hover:scale-105 transform"
            >
              <span className="text-lg">🔗</span>
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <a
              href="https://discord.gg/Hhp7TE5U"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 transform"
            >
              <span className="text-lg">💜</span>
              <span className="hidden sm:inline">Discord</span>
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};
