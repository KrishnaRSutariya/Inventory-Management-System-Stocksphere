import React, { useEffect, useRef } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Product } from '../../../types/api.types';
import { QRCodeSVG } from 'qrcode.react';
import JsBarcode from 'jsbarcode';
import { Printer, QrCode } from 'lucide-react';

export interface BarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const BarcodeModal: React.FC<BarcodeModalProps> = ({ isOpen, onClose, product }) => {
  const barcodeSvgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (isOpen && product && barcodeSvgRef.current) {
      try {
        const code = product.barcode || product.sku;
        JsBarcode(barcodeSvgRef.current, code, {
          format: 'CODE128',
          lineColor: '#0f172a',
          width: 2,
          height: 50,
          displayValue: true,
          fontSize: 13,
          font: 'monospace'
        });
      } catch (err) {
        console.warn('Barcode render error:', err);
      }
    }
  }, [isOpen, product]);

  if (!product) return null;

  const handlePrint = () => {
    window.print();
  };

  const codeValue = product.barcode || product.sku;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Product Identifier & Label"
      description={`Scannable Barcode & QR code for ${product.name}`}
      maxWidth="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Print Label
          </Button>
        </>
      }
    >
      <div className="space-y-6 text-center">
        {/* Printable Label Preview Card */}
        <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-col items-center space-y-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {product.category?.name || 'Inventory Item'}
            </span>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {product.name}
            </h4>
            <p className="text-xs font-mono text-slate-500 mt-0.5">SKU: {product.sku}</p>
          </div>

          {/* Barcode SVG render */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex justify-center w-full max-w-[280px]">
            <svg ref={barcodeSvgRef} className="w-full max-w-[260px] h-auto" />
          </div>

          {/* QR Code SVG render */}
          <div className="flex flex-col items-center pt-2">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs inline-block">
              <QRCodeSVG
                value={JSON.stringify({
                  id: product._id,
                  sku: product.sku,
                  name: product.name,
                  price: product.unitPrice
                })}
                size={110}
                level="M"
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
              <QrCode className="w-3 h-3" /> Quick Scan Payload
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Scan using any mobile camera or standard optical 1D/2D warehouse scanner
        </p>
      </div>
    </Modal>
  );
};
