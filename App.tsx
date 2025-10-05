import React, { useState, useCallback } from 'react';
import { 
  generateYouTubeContent, 
  generateVideoScript, 
  generateThumbnail,
  generateVideoFromScript,
  getVideosOperation,
  fetchAndCreateVideoUrl
} from './services/geminiService';
import type { VideoIdea } from './types';
import { ContentCard } from './components/ContentCard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { YouTubeIcon } from './components/icons/YouTubeIcon';
import { LightbulbIcon } from './components/icons/LightbulbIcon';

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [ideas, setIdeas] = useState<VideoIdea[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateConcepts = useCallback(async () => {
    if (!topic.trim()) {
      setError('Please enter a topic to generate ideas.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setIdeas(null);

    try {
      const result = await generateYouTubeContent(topic);
      if (result && result.videoIdeas) {
        setIdeas(result.videoIdeas);
      } else {
        setError('Failed to generate content. The AI returned an unexpected format.');
      }
    } catch (e) {
      console.error(e);
      setError('An error occurred while generating ideas. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [topic]);

  const handleGenerateScriptAndThumbnail = useCallback(async (ideaIndex: number) => {
    const ideasCopy = [...(ideas || [])];
    const targetIdea = ideasCopy[ideaIndex];
    if (!targetIdea) return;

    ideasCopy[ideaIndex] = { ...targetIdea, isGenerating: true };
    setIdeas(ideasCopy);
    setError(null);

    try {
      const [script, thumbnailUrl] = await Promise.all([
        generateVideoScript(targetIdea),
        generateThumbnail(targetIdea.thumbnailSuggestion)
      ]);

      const finalIdeas = [...(ideas || [])];
      finalIdeas[ideaIndex] = { 
        ...targetIdea, 
        isGenerating: false, 
        generatedScript: script, 
        thumbnailImage: thumbnailUrl 
      };
      setIdeas(finalIdeas);

    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to generate content for "${targetIdea.title}". ${errorMessage}`);
      const finalIdeas = [...(ideas || [])];
      finalIdeas[ideaIndex] = { ...targetIdea, isGenerating: false };
      setIdeas(finalIdeas);
    }
  }, [ideas]);

  const videoGenerationMessages = [
    "Warming up the virtual cameras...",
    "Casting our AI actors...",
    "Teaching the AI to talk...",
    "Syncing dialogue and lip movements...",
    "Rendering the first scenes with voice...",
    "Compositing visual effects and audio...",
    "Adding the final polish to the animation...",
    "Almost there, preparing for premiere...",
  ];

  const handleGenerateVideo = useCallback(async (ideaIndex: number, language: string, avatar: string) => {
    let currentIdeas = [...(ideas || [])];
    const targetIdea = currentIdeas[ideaIndex];
    if (!targetIdea) return;

    currentIdeas[ideaIndex] = { 
      ...targetIdea, 
      isGeneratingVideo: true, 
      videoGenerationProgress: 'Initiating video generation...' 
    };
    setIdeas(currentIdeas);
    setError(null);

    const resetGeneratingState = () => {
        setIdeas(prevIdeas => {
            const newIdeas = [...(prevIdeas || [])];
            if(newIdeas[ideaIndex]) {
              newIdeas[ideaIndex] = { 
                ...newIdeas[ideaIndex], 
                isGeneratingVideo: false, 
                videoGenerationProgress: undefined 
              };
            }
            return newIdeas;
        });
    }

    try {
      let operation = await generateVideoFromScript(targetIdea, language, avatar);

      let messageIndex = 0;
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await getVideosOperation(operation);

        setIdeas(prevIdeas => {
            const newIdeas = [...(prevIdeas || [])];
            if (newIdeas[ideaIndex]) {
                newIdeas[ideaIndex].videoGenerationProgress = videoGenerationMessages[messageIndex % videoGenerationMessages.length];
                messageIndex++;
            }
            return newIdeas;
        });
      }

      const generatedVideo = operation.response?.generatedVideos?.[0];

      if (!generatedVideo?.video?.uri) {
        console.error("Video generation finished without a valid video URI.", operation);
        const failureReason = "the AI was unable to produce a video, possibly due to internal errors or content safety filters.";
        setError(`Video generation failed for "${targetIdea.title}". Reason: ${failureReason} Please try a different script.`);
        resetGeneratingState();
        return;
      }

      const videoUri = generatedVideo.video.uri;

      setIdeas(prevIdeas => {
          const newIdeas = [...(prevIdeas || [])];
          if(newIdeas[ideaIndex]) newIdeas[ideaIndex].videoGenerationProgress = 'Downloading final video...';
          return newIdeas;
      });

      const videoUrl = await fetchAndCreateVideoUrl(videoUri);
      
      setIdeas(prevIdeas => {
          const newIdeas = [...(prevIdeas || [])];
          if(newIdeas[ideaIndex]) {
            newIdeas[ideaIndex] = { 
              ...newIdeas[ideaIndex], 
              isGeneratingVideo: false, 
              videoUrl: videoUrl,
              videoGenerationProgress: undefined,
            };
          }
          return newIdeas;
      });

    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to generate video for "${targetIdea.title}". ${errorMessage}`);
      resetGeneratingState();
    }
  }, [ideas, videoGenerationMessages]);

  return (
    <div className="min-h-screen bg-gray-900 text-white selection:bg-purple-500/30">
      <div className="absolute inset-0 -z-10 h-full w-full bg-gray-900 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <div className="absolute top-0 left-0 -z-10 h-1/2 w-full bg-gradient-to-b from-purple-900/30 to-transparent"></div>

      <main className="container mx-auto px-4 py-8 sm:py-16">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <YouTubeIcon className="w-16 h-16 text-red-500" />
            <h1 className="text-4xl sm:text-6xl font-black tracking-tighter bg-gradient-to-r from-purple-400 to-indigo-400 text-transparent bg-clip-text">
              Viral Views AI
            </h1>
          </div>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Your personal AI agent for scripting and producing realistic, voice-narrated animated videos for YouTube that captivate audiences and skyrocket your subscriber count.
          </p>
        </header>

        <section className="max-w-3xl mx-auto bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-purple-900/10">
          <div className="flex items-center gap-3 mb-4">
             <LightbulbIcon className="w-6 h-6 text-yellow-300" />
             <h2 className="text-2xl font-bold text-gray-100">Enter Your Channel Topic</h2>
          </div>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., 'Funny talking babies', 'Retro Gaming Speedruns', 'AI for Beginners'..."
            className="w-full h-28 p-4 bg-gray-900/70 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 placeholder-gray-500 resize-none"
            disabled={isLoading}
          />
          <button
            onClick={handleGenerateConcepts}
            disabled={isLoading || !topic.trim()}
            className="mt-6 w-full text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg py-3 px-6 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-102 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
          >
            {isLoading ? 'Generating Concepts...' : 'Generate Video Concepts'}
          </button>
        </section>

        <section className="mt-12">
          {isLoading && <LoadingSpinner />}
          {error && <p className="text-center text-red-400 bg-red-900/30 p-4 rounded-lg max-w-2xl mx-auto">{error}</p>}
          
          {ideas && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {ideas.map((idea, index) => (
                <ContentCard 
                  key={index} 
                  idea={idea} 
                  index={index} 
                  onGenerateScript={() => handleGenerateScriptAndThumbnail(index)}
                  onGenerateVideo={handleGenerateVideo}
                />
              ))}
            </div>
          )}

          {!isLoading && !error && !ideas && (
             <div className="text-center text-gray-500 mt-16">
                <p>Your next viral video script is just a click away.</p>
             </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default App;