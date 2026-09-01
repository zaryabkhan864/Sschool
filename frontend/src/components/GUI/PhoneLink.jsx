import React from 'react';

const PhoneLink = ({ number }) => {
  if (!number) return <span className="text-ink-400">N/A</span>;
  return (
    <div className="flex items-center gap-1.5">
      <i className="fa fa-phone text-xs text-ink-400"></i>
      <a href={`tel:${number}`} className="text-sm-custom text-ink-700 font-medium hover:text-brand-600 transition-colors">
        {number}
      </a>
    </div>
  );
};

export default PhoneLink;
