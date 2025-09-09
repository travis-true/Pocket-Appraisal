import React from 'react';
import type { PriceInfo } from '../types';

interface PricingTableProps {
  data: PriceInfo[];
}

const PricingTable: React.FC<PricingTableProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-gray-400">No pricing information available.</p>;
  }

  const SourceLink: React.FC<{ source: PriceInfo['rawSource'] }> = ({ source }) => {
    if (!source) return null;
    return source.url ? (
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-indigo-400 hover:text-indigo-300 hover:underline"
      >
        {source.name}
      </a>
    ) : (
      <span>{source.name}</span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-800/50">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-200 sm:pl-6">
              Card / Parallel
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-200">
              Raw Price
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-200">
              Graded (PSA 10)
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-200">
              Raw Source
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-200">
              Graded Source
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-200 sm:pr-6">
              Date Range
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800 bg-gray-900/50">
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-gray-800/70 transition-colors">
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">
                {item.name}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{item.rawPrice}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{item.gradedPrice}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                <SourceLink source={item.rawSource} />
              </td>
               <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                <SourceLink source={item.gradedSource} />
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300 sm:pr-6">{item.dateRange}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PricingTable;