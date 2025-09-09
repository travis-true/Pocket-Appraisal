import React, { useState, useCallback } from 'react';
import type { ManualCardInput, ImageFile, PricingData, IdentifiedCardInfo } from './types';
import { identifyCardFromImages, getPricingAndParallels } from './services/geminiService';
import CardInputForm from './components/CardInputForm';
import ResultsDisplay from './components/ResultsDisplay';

const App: React.FC = () => {
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [frontImage, setFrontImage] = useState<ImageFile | null>(null);
  const [backImage, setBackImage] = useState<ImageFile | null>(null);
  
  const [identifiedCardInfo, setIdentifiedCardInfo] = useState<IdentifiedCardInfo | null>(null);
  const [pricingData, setPricingData] = useState<PricingData | null>(null);

  const resetState = () => {
    setError(null);
    setIdentifiedCardInfo(null);
    setPricingData(null);
    setFrontImage(null);
    setBackImage(null);
  }

  const handleManualSearch = useCallback(async (data: ManualCardInput) => {
    resetState();
    setLoadingMessage("Fetching prices and parallels...");
    try {
      const prices = await getPricingAndParallels(data);
      setIdentifiedCardInfo({ ...data, parallelDescription: 'Base Card' });
      setPricingData(prices);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoadingMessage(null);
    }
  }, []);

  const handleImageSearch = useCallback(async (front: ImageFile, back: ImageFile) => {
    resetState();
    setFrontImage(front);
    setBackImage(back);
    setLoadingMessage("Identifying card from images...");

    try {
      const cardInfo = await identifyCardFromImages(
        { base64: front.base64, mimeType: front.file.type },
        { base64: back.base64, mimeType: back.file.type }
      );
      
      if (!cardInfo.player || !cardInfo.year || !cardInfo.set) {
        throw new Error("Could not identify the card's essential details. Please use clearer images.");
      }

      setIdentifiedCardInfo(cardInfo);
      setLoadingMessage(`Card identified! Fetching prices for ${cardInfo.year} ${cardInfo.set} ${cardInfo.player}...`);

      const prices = await getPricingAndParallels(cardInfo);
      setPricingData(prices);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoadingMessage(null);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <main className="container mx-auto p-4 md:p-8">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
            Pocket Appraisal
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Appraise your sports cards with the power of AI.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          <div className="bg-gray-800/50 rounded-xl shadow-2xl p-6 md:p-8 border border-gray-700">
            <CardInputForm
              onManualSubmit={handleManualSearch}
              onImageSubmit={handleImageSearch}
              isLoading={!!loadingMessage}
            />
          </div>
          <div className="bg-gray-800/50 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
            <ResultsDisplay
              loadingMessage={loadingMessage}
              error={error}
              cardInfo={identifiedCardInfo}
              pricingData={pricingData}
            />
          </div>
        </div>
        
        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>Powered by Google Gemini. Pricing data is estimated and for informational purposes only.</p>
        </footer>
      </main>
    </div>
  );
};

export default App;