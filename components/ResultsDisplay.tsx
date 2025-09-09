import React from 'react';
import type { IdentifiedCardInfo, PricingData } from '../types';
import Spinner from './Spinner';
import PricingTable from './PricingTable';

interface ResultsDisplayProps {
  loadingMessage: string | null;
  error: string | null;
  cardInfo: IdentifiedCardInfo | null;
  pricingData: PricingData | null;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ loadingMessage, error, cardInfo, pricingData }) => {

  const renderContent = () => {
    if (loadingMessage) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <Spinner />
          <p className="mt-4 text-lg text-gray-300 animate-pulse">{loadingMessage}</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="w-16 h-16 text-red-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <p className="mt-4 text-lg font-semibold text-red-400">An Error Occurred</p>
          <p className="mt-1 text-gray-400">{error}</p>
        </div>
      );
    }

    if (!cardInfo || !pricingData) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-500">
           <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-400">Awaiting Card Information</h3>
          <p className="mt-1 text-sm">Upload images or enter details to begin.</p>
        </div>
      );
    }
    
    const allPriceInfo = [pricingData.baseCard, ...pricingData.parallels];

    return (
      <div className="p-4 sm:p-6 md:p-8 h-full overflow-y-auto custom-scrollbar">
        {/* Card Info Header */}
        <div className="mb-6 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-bold text-white leading-tight truncate">{cardInfo.player}</h2>
          <p className="text-base text-indigo-300 font-semibold">{`${cardInfo.year} ${cardInfo.set}`}</p>
          <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-2 text-sm text-gray-200">
            {cardInfo.cardNumber && <span>Card #{cardInfo.cardNumber}</span>}
            {cardInfo.parallelDescription && cardInfo.parallelDescription !== "Base Card" && (
              <span className="bg-purple-500/30 text-purple-200 px-2.5 py-1 rounded-full text-xs font-semibold border border-purple-400/50">{cardInfo.parallelDescription}</span>
            )}
          </div>
        </div>
        
        {/* AI Condition Report */}
        {typeof cardInfo.suggestedGrade === 'number' && cardInfo.conditionNotes && cardInfo.conditionNotes.length > 0 && (
            <div className="mb-6 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-gray-200 mb-3">AI Condition Report</h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                <div className="flex-shrink-0 text-center bg-gray-800/50 p-3 rounded-lg">
                    <div className="text-4xl font-bold text-indigo-400 leading-none">{cardInfo.suggestedGrade}</div>
                    <div className="text-xs text-gray-500 font-medium tracking-wider">GRADE</div>
                </div>
                <div className="sm:border-l-2 sm:border-gray-700 sm:pl-4">
                    <p className="text-sm text-gray-400">This is an AI-generated estimate of the card's raw condition based on the provided images. It is not a guarantee of a professional grade.</p>
                </div>
              </div>
              <h4 className="text-sm font-semibold text-gray-300 mb-2">Observations:</h4>
              <ul className="space-y-1.5 list-disc list-inside text-gray-300 text-sm marker:text-indigo-400">
                {cardInfo.conditionNotes.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            </div>
        )}

        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-200 border-b border-gray-700 pb-2">Price Guide & Parallels</h3>
          <PricingTable data={allPriceInfo} />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-800/80 h-full min-h-[400px] lg:min-h-0">
      {renderContent()}
    </div>
  );
};

export default ResultsDisplay;