import React from 'react';

type PropType = {
  selected: boolean;
  index: number;
  onClick: () => void;
  children?: React.ReactNode; // Allow children
};

export const Thumb: React.FC<PropType> = (props) => {
  const { selected, index, onClick, children } = props;

  return (
    <div
      className={'embla-thumbs__slide'.concat(
        selected ? ' embla-thumbs__slide--selected' : ''
      )}
    >
      <button
        onClick={onClick}
        type="button"
        className="embla-thumbs__slide__number"
      >
        {children ? children : index + 1}
      </button>
    </div>
  );
};
