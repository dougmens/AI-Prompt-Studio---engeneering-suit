
import React, { useState } from 'react';
import { generateImage, generateVideoFromImage } from '../services/geminiService';
import { Button } from './Button';

export const LabTools: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'image' | 'video'>('image');
  const [imagePrompt, setImagePrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [imageSize, setImageSize] = useState('1K');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [videoPrompt, setVideoPrompt] = useState('');
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [videoAR, setVideoAR] = useState<'16:9' | '9:16'>('16:9');

  const handleImageGen = async () => {
    setIsLoading(true);
    try {
      const url = await generateImage(imagePrompt, aspectRatio, imageSize);
      setGeneratedImage(url);
    } catch (e) {
      console.error(e);
      alert("Image generation failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoGen = async () => {
    if (!generatedImage) return;
    setIsLoading(true);
    try {
      const url = await generateVideoFromImage(generatedImage, videoPrompt, videoAR);
      setGeneratedVideo(url);
    } catch (e) {
      console.error(e);
      alert("Video generation failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in zoom-in-95 duration-700">
      <div className="flex gap-4 p-1.5 bg-slate-900/50 rounded-2xl w-fit border border-white/5">
        <button onClick={() => setActiveTool('image')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTool === 'image' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>Image Synth</button>
        <button onClick={() => setActiveTool('video')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTool === 'video' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>Video Motion</button>
      </div>

      {activeTool === 'image' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visual Prompt</label>
              <textarea 
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="Describe your architectural mockup or app interface..."
                className="w-full bg-slate-900 border border-white/10 rounded-2xl p-6 text-white text-sm focus:border-indigo-500 transition-all min-h-[150px] resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aspect Ratio</label>
                <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white">
                  {['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'].map(ar => <option key={ar} value={ar}>{ar}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Resolution</label>
                <select value={imageSize} onChange={(e) => setImageSize(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white">
                  {['1K', '2K', '4K'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <Button onClick={handleImageGen} isLoading={isLoading} className="w-full py-5 rounded-2xl">Generate High-Fidelity Mockup</Button>
          </div>
          <div className="glass rounded-[3rem] aspect-square flex items-center justify-center p-2 border-white/5 overflow-hidden">
            {generatedImage ? (
              <img src={generatedImage} alt="Generated" className="w-full h-full object-contain rounded-[2.8rem]" />
            ) : (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto text-3xl">🖼️</div>
                <p className="text-slate-600 text-xs font-mono uppercase tracking-widest">Waiting for Synthesis...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTool === 'video' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            {!generatedImage ? (
              <div className="p-10 glass rounded-[2.5rem] border-dashed border-slate-700 text-center space-y-4">
                <p className="text-slate-500 text-sm">Please generate an image first to use as a base for video synthesis.</p>
                <Button variant="ghost" onClick={() => setActiveTool('image')}>Go to Image Synth</Button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Motion Dynamics</label>
                  <textarea 
                    value={videoPrompt}
                    onChange={(e) => setVideoPrompt(e.target.value)}
                    placeholder="E.g., camera slowly zooms in, interface glows with neon light..."
                    className="w-full bg-slate-900 border border-white/10 rounded-2xl p-6 text-white text-sm focus:border-indigo-500 transition-all min-h-[120px] resize-none"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Video Aspect Ratio</label>
                  <div className="flex gap-4">
                    {['16:9', '9:16'].map(ar => (
                      <button key={ar} onClick={() => setVideoAR(ar as any)} className={`flex-1 p-3 rounded-xl border text-xs font-black transition-all ${videoAR === ar ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-white/10 text-slate-500'}`}>
                        {ar === '16:9' ? 'Landscape (16:9)' : 'Portrait (9:16)'}
                      </button>
                    ))}
                  </div>
                </div>
                <Button onClick={handleVideoGen} isLoading={isLoading} className="w-full py-5 rounded-2xl">Synthesize 7s Video</Button>
              </>
            )}
          </div>
          <div className="glass rounded-[3rem] aspect-video flex items-center justify-center border-white/5 overflow-hidden">
            {generatedVideo ? (
              <video src={generatedVideo} controls autoPlay loop className="w-full h-full object-cover" />
            ) : (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto text-3xl">🎬</div>
                <p className="text-slate-600 text-xs font-mono uppercase tracking-widest">Veo Engine Ready</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
