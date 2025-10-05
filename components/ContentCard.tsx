import React, { useState, useRef, useEffect } from 'react';
import type { VideoIdea } from '../types';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { FilmIcon } from './icons/FilmIcon';

interface ContentCardProps {
  idea: VideoIdea;
  index: number;
  onGenerateScript: () => void;
  onGenerateVideo: (index: number, language: string, avatar: string) => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mt-4">
    <h4 className="font-semibold text-purple-300">{title}</h4>
    <div className="text-gray-300 text-sm mt-1">{children}</div>
  </div>
);

const Dropdown: React.FC<{
  label: string;
  options: { id: string; name: string; emoji?: string }[];
  selected: { id: string; name: string; emoji?: string };
  onSelect: (option: { id: string; name: string; emoji?: string }) => void;
}> = ({ label, options, selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
      <button
        type="button"
        className="w-full bg-gray-700/50 border border-gray-600 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center">
          {selected.emoji && <span className="mr-2">{selected.emoji}</span>}
          <span className="block truncate text-white">{selected.name}</span>
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 bottom-full mb-2 w-full rounded-md shadow-lg bg-gray-800 border border-gray-600 ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1">
            {options.map(option => (
              <a
                href="#"
                key={option.id}
                onClick={(e) => {
                  e.preventDefault();
                  onSelect(option);
                  setIsOpen(false);
                }}
                className={`flex items-center px-4 py-2 text-sm transition-colors duration-150 ${selected.id === option.id ? 'font-semibold text-white bg-purple-600' : 'text-gray-200 hover:bg-purple-500/50 hover:text-white'}`}
              >
                {option.emoji && <span className="mr-2">{option.emoji}</span>}
                {option.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


export const ContentCard: React.FC<ContentCardProps> = ({ idea, index, onGenerateScript, onGenerateVideo }) => {
  const [copied, setCopied] = useState(false);
  
  const languages = [
    { id: 'English', name: 'English' }, 
    { id: 'Telugu', name: 'Telugu' },
    { id: 'Spanish', name: 'Spanish' },
    { id: 'Hindi', name: 'Hindi' },
    { id: 'French', name: 'French' },
    { id: 'German', name: 'German' }
  ];

  const avatars = [
    { id: 'baby', name: 'Cute Baby', emoji: '👶' },
    { id: 'nova', name: 'Nova (Pro)', emoji: '👩‍💼' },
    { id: 'zen', name: 'Zen (Cartoon)', emoji: '🧘' },
    { id: 'anya', name: 'Dr. Anya (Expert)', emoji: '👩‍🔬' }
  ];
  
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);

  const handleCopy = () => {
    if (!idea.generatedScript) return;
    const scriptText = idea.generatedScript.script
      .map(scene => `Scene ${scene.scene}\nVisual: ${scene.visualDescription}\nVoiceover: ${scene.voiceover}`)
      .join('\n\n');
    navigator.clipboard.writeText(scriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasGeneratedContent = idea.generatedScript && idea.thumbnailImage;

  return (
    <div 
      className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-xl p-6 flex flex-col transition-all duration-300 hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-900/20"
      style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.1}s forwards`, opacity: 0 }}
    >
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #585561; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #706d7a; }
      `}</style>
      
      {hasGeneratedContent ? (
          <div className="flex flex-col h-full">
            {idea.videoUrl ? (
                <video src={idea.videoUrl} controls playsInline className="w-full rounded-lg mb-4 aspect-video object-cover border border-gray-600 bg-black">
                    Your browser does not support the video tag.
                </video>
            ) : (
                <div className="relative w-full aspect-video">
                  {idea.isGeneratingVideo ? (
                      <div className="absolute inset-0 bg-black rounded-lg flex flex-col items-center justify-center border border-gray-600">
                          <div className="w-8 h-8 border-2 border-t-green-400 border-r-green-400 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                          <p className="text-md font-semibold text-green-300 mt-4">Generating Video</p>
                          <p className="text-sm text-gray-400 mt-2 animate-pulse h-4 max-w-xs text-center px-2">{idea.videoGenerationProgress || 'Please wait...'}</p>
                      </div>
                  ) : (
                    <img src={idea.thumbnailImage} alt={`Generated thumbnail for ${idea.title}`} className="w-full h-full rounded-lg object-cover border border-gray-600"/>
                  )}
                </div>
            )}
            
            <div className="flex justify-between items-center mt-4 mb-2">
              <h3 className="text-xl font-bold text-gray-50 bg-gradient-to-r from-purple-400 to-indigo-400 text-transparent bg-clip-text">
                {idea.generatedScript.title}
              </h3>
              <button onClick={handleCopy} title="Copy Full Script" className="text-gray-400 hover:text-white transition-colors duration-200 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                <ClipboardIcon className="w-5 h-5"/>
                <span className="sr-only">Copy Full Script</span>
              </button>
            </div>
            
            <div className="mt-2 flex-grow overflow-y-auto max-h-80 pr-2 custom-scrollbar">
              <h4 className="font-semibold text-purple-300 mb-2">Full Video Script</h4>
              <div className="space-y-3 text-sm">
                {idea.generatedScript.script.map(scene => (
                  <div key={scene.scene} className="p-3 bg-gray-900/50 rounded-md border border-gray-700">
                    <p className="font-bold text-gray-300">Scene {scene.scene}</p>
                    <p className="mt-1 text-gray-400"><strong className="text-purple-400">Visual:</strong> {scene.visualDescription}</p>
                    <p className="mt-1 text-gray-400"><strong className="text-indigo-400">Voiceover:</strong> "{scene.voiceover}"</p>
                  </div>
                ))}
              </div>
            </div>

            {!idea.videoUrl && !idea.isGeneratingVideo && (
              <div className="mt-auto pt-6 border-t border-gray-700">
                  <h4 className="font-semibold text-green-300 text-center mb-3">Ready to Produce Video?</h4>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <Dropdown
                        label="Language"
                        options={languages}
                        selected={selectedLanguage}
                        onSelect={setSelectedLanguage}
                    />
                    <Dropdown
                        label="Avatar"
                        options={avatars}
                        selected={selectedAvatar}
                        onSelect={setSelectedAvatar}
                    />
                  </div>

                  <button
                    onClick={() => onGenerateVideo(index, selectedLanguage.id, selectedAvatar.id)}
                    className="w-full flex items-center justify-center gap-2 text-md font-semibold text-white bg-gradient-to-r from-green-600 to-cyan-600 rounded-lg py-2.5 px-4 hover:from-green-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500"
                  >
                    <FilmIcon className="w-5 h-5" />
                    <span>Generate Video</span>
                  </button>

                  <p className="text-xs text-center text-gray-500 mt-3">Select a language and avatar, then generate a complete 1080p HD video. The process may take several minutes.</p>
              </div>
            )}

            {copied && (
              <div className="mt-4 text-center text-sm text-green-400 bg-green-900/30 p-2 rounded-md">
                Full script copied to clipboard!
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <h3 className="text-xl font-bold text-gray-50 bg-gradient-to-r from-purple-400 to-indigo-400 text-transparent bg-clip-text">
              {idea.title}
            </h3>
            <Section title="Attention-Grabbing Hook">
              <p className="italic">"{idea.hook}"</p>
            </Section>
            <Section title="Target Audience">
              <p>{idea.targetAudience}</p>
            </section>
            <Section title="Thumbnail Idea">
              <p>{idea.thumbnailSuggestion}</p>
            </section>
            <div className="mt-auto pt-6 flex-grow flex flex-col justify-end">
                <button
                    onClick={onGenerateScript}
                    disabled={idea.isGenerating}
                    className="w-full flex items-center justify-center gap-2 text-md font-semibold text-white bg-gradient-to-r from-green-500 to-teal-500 rounded-lg py-2.5 px-5 hover:from-green-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-102 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-teal-400"
                >
                    {idea.isGenerating ? (
                        <>
                            <div className="w-5 h-5 border-2 border-t-white border-r-white border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                            <span>Creating Content...</span>
                        </>
                    ) : (
                        <>
                            <SparklesIcon className="w-5 h-5" />
                            <span>Create Script & Thumbnail</span>
                        </>
                    )}
                </button>
            </div>
          </div>
        )}
    </div>
  );
};