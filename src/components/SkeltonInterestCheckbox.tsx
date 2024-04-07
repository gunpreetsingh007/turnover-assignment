import React from 'react';

const SkeletonInterestCheckbox = () => {
  return (
    <div className="flex items-center gap-x-3 self-stretch text-left text-base font-normal leading-[26px] text-black relative pb-5">
      <div className="h-6 w-6 block bg-gray-300 rounded animate-pulse"></div>
      <div className="flex-1 h-4 bg-gray-300 rounded animate-pulse"></div>
    </div>
  );
};

export default SkeletonInterestCheckbox;