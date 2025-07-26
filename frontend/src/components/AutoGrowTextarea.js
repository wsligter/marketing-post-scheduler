import React, { useEffect, useRef, useCallback } from 'react';

const AutoGrowTextarea = ({ 
  value, 
  onChange, 
  placeholder, 
  className = '', 
  id,
  name,
  required = false,
  minRows = 3,
  maxRows = 15,
  ...props 
}) => {
  const textareaRef = useRef(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Calculate the number of rows based on content
    const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight);
    const minHeight = lineHeight * minRows;
    const maxHeight = lineHeight * maxRows;
    
    // Set height based on scrollHeight, but within min/max bounds
    const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
    textarea.style.height = `${newHeight}px`;
    
    // Show scrollbar if content exceeds maxRows
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [minRows, maxRows]);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  useEffect(() => {
    // Adjust height on mount
    adjustHeight();
    
    // Add resize observer to handle window resizing
    const resizeObserver = new ResizeObserver(() => {
      adjustHeight();
    });
    
    if (textareaRef.current) {
      resizeObserver.observe(textareaRef.current);
    }
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [adjustHeight]);

  const handleChange = (e) => {
    onChange(e);
    // Adjust height after state update
    setTimeout(adjustHeight, 0);
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={`auto-grow-textarea ${className}`}
      id={id}
      name={name}
      required={required}
      rows={minRows}
      style={{
        resize: 'none',
        overflow: 'hidden',
        transition: 'height 0.1s ease',
        lineHeight: '1.5'
      }}
      {...props}
    />
  );
};

export default AutoGrowTextarea;
