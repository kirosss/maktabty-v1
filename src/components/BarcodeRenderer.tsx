import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeRendererProps {
  value: string;
  width?: number;
  height?: number;
  fontSize?: number;
  displayValue?: boolean;
  className?: string;
}

export const BarcodeRenderer: React.FC<BarcodeRendererProps> = ({
  value,
  width = 1.8,
  height = 45,
  fontSize = 13,
  displayValue = true,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !value) return;

    try {
      JsBarcode(svgRef.current, value, {
        format: 'CODE128',
        lineColor: '#111827',
        width,
        height,
        displayValue,
        fontSize,
        font: 'Cairo, monospace',
        textMargin: 2,
        margin: 4,
        background: 'transparent',
      });
    } catch {
      // Fallback if barcode cannot be formatted
    }
  }, [value, width, height, fontSize, displayValue]);

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg ref={svgRef} className="max-w-full" />
    </div>
  );
};
