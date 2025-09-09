import React, { useState, useCallback } from 'react';
import type { ManualCardInput, ImageFile } from '../types';
import { TextIcon } from './icons/TextIcon';
import { CameraIcon } from './icons/CameraIcon';

interface CardInputFormProps {
  onManualSubmit: (data: ManualCardInput) => void;
  onImageSubmit: (front: ImageFile, back: ImageFile) => void;
  isLoading: boolean;
}

type InputMode = 'manual' | 'upload';

// Fix: Moved TabButton component outside of CardInputForm to prevent re-creation on every render and fix typing issues.
const TabButton = ({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 ${
      active ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    }`}
  >
    {children}
  </button>
);

// Fix: Moved FileInput component outside of CardInputForm to prevent re-creation on every render.
const FileInput = ({ id, label, file, onChange }: { id: string, label: string, file: ImageFile | null, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <div className="w-full">
    <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md bg-gray-900/50 hover:border-indigo-500 transition-colors">
      {file ? (
        <div className="text-center">
          <img src={file.base64} alt={label} className="mx-auto h-24 w-auto object-contain rounded-md" />
          <p className="text-xs text-gray-400 mt-2 truncate max-w-xs">{file.file.name}</p>
        </div>
      ) : (
        <div className="space-y-1 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="flex text-sm text-gray-500">
            <span className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-indigo-400 hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-indigo-500 px-1">
              Upload a file
            </span>
            <input id={id} name={id} type="file" className="sr-only" onChange={onChange} accept="image/png, image/jpeg, image/webp" />
          </div>
          <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
        </div>
      )}
    </div>
  </div>
);

const CardInputForm: React.FC<CardInputFormProps> = ({ onManualSubmit, onImageSubmit, isLoading }) => {
  const [mode, setMode] = useState<InputMode>('upload');
  const [manualInput, setManualInput] = useState<ManualCardInput>({ player: '', year: '', set: '', cardNumber: '' });
  const [frontImage, setFrontImage] = useState<ImageFile | null>(null);
  const [backImage, setBackImage] = useState<ImageFile | null>(null);

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManualInput({ ...manualInput, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const fileData = { file, base64: reader.result as string };
        if (side === 'front') setFrontImage(fileData);
        else setBackImage(fileData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.player && manualInput.year && manualInput.set) {
      onManualSubmit(manualInput);
    }
  };

  const handleImageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (frontImage && backImage) {
      onImageSubmit(frontImage, backImage);
    }
  };
  
  return (
    <div>
      <div className="flex space-x-2 bg-gray-800 p-1 rounded-lg mb-6">
        <TabButton active={mode === 'upload'} onClick={() => setMode('upload')}>
          <CameraIcon className="w-5 h-5" />
          <span>Upload Photos</span>
        </TabButton>
        <TabButton active={mode === 'manual'} onClick={() => setMode('manual')}>
          <TextIcon className="w-5 h-5" />
          <span>Enter Manually</span>
        </TabButton>
      </div>

      {mode === 'manual' && (
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div>
            <label htmlFor="player" className="block text-sm font-medium text-gray-300">Player</label>
            <input type="text" name="player" id="player" value={manualInput.player} onChange={handleManualChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white h-10 px-3" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-300">Year</label>
              <input type="number" name="year" id="year" value={manualInput.year} onChange={handleManualChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white h-10 px-3" />
            </div>
            <div>
             <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-300">Card #</label>
              <input type="text" name="cardNumber" id="cardNumber" value={manualInput.cardNumber} onChange={handleManualChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white h-10 px-3" />
            </div>
          </div>
          <div>
            <label htmlFor="set" className="block text-sm font-medium text-gray-300">Set/Manufacturer</label>
            <input type="text" name="set" id="set" value={manualInput.set} onChange={handleManualChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white h-10 px-3" />
          </div>
          <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors">
            {isLoading ? 'Searching...' : 'Find Prices'}
          </button>
        </form>
      )}

      {mode === 'upload' && (
        <form onSubmit={handleImageSubmit} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <FileInput id="front-upload" label="Card Front" file={frontImage} onChange={(e) => handleFileChange(e, 'front')} />
            <FileInput id="back-upload" label="Card Back" file={backImage} onChange={(e) => handleFileChange(e, 'back')} />
          </div>
          <button type="submit" disabled={isLoading || !frontImage || !backImage} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors">
            {isLoading ? 'Processing...' : 'Identify & Price Card'}
          </button>
        </form>
      )}
    </div>
  );
};

export default CardInputForm;