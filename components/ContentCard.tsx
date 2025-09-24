import React, { useState } from 'react';
import type { VideoIdea } from '../types';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { FilmIcon } from './icons/FilmIcon';

interface ContentCardProps {
  idea: VideoIdea;
  index: number;
  onGenerateScript: () => void;
  onGenerateVideo: (index: number, language: string) => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mt-4">
    <h4 className="font-semibold text-purple-300">{title}</h4>
    <div className="text-gray-300 text-sm mt-1">{children}</div>
  </div>
);

export const ContentCard: React.FC<ContentCardProps> = ({ idea, index, onGenerateScript, onGenerateVideo }) => {
  const [copied, setCopied] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');

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
                
                  <>
                      <h4 className="font-semibold text-green-300 text-center mb-3">Ready to Produce Video with Voiceover?</h4>
                      <div className="flex items-center gap-3">
                          <select
                              value={selectedLanguage}
                              onChange={(e) => setSelectedLanguage(e.target.value)}
                              className="w-full bg-gray-900/70 border border-gray-600 rounded-lg py-2 px-3 focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-all text-sm"
                          >
                              <option value="English">English</option>
                              <option value="Telugu">Telugu</option>
                          </select>
                          <button
                              onClick={() => onGenerateVideo(index, selectedLanguage)}
                              className="flex-shrink-0 flex items-center justify-center gap-2 text-md font-semibold text-white bg-gradient-to-r from-green-600 to-cyan-600 rounded-lg py-2 px-4 hover:from-green-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500"
                          >
                              <FilmIcon className="w-5 h-5" />
                              <span>Generate Video</span>
                          </button>
                      </div>
                      <p className="text-xs text-center text-gray-500 mt-3">This will generate a complete video file with a high-quality AI audio voiceover and realistic, lip-synced animation. The process may take several minutes.</p>
                  </>
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