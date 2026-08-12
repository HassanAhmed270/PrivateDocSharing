import { useRef, useState, useEffect } from 'react';
import { HiCheck, HiRefresh } from 'react-icons/hi';

function SignatureCanvas({ onSave, onCancel }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  // Set up canvas styling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#38bdf8'; // Sky blue color matching sky-400
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  function getCoordinates(event) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Support touch and mouse events
    if (event.touches && event.touches[0]) {
      return {
        x: event.touches[0].clientX - rect.left,
        y: event.touches[0].clientY - rect.top,
      };
    }
    
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function startDrawing(event) {
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(event);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
  }

  function draw(event) {
    if (!isDrawing) return;
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(event);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    setIsEmpty(false);
  }

  function stopDrawing() {
    setIsDrawing(false);
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    setIsEmpty(true);
  }

  function handleConfirm() {
    if (isEmpty) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  }

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-slate-950">
        <canvas
          ref={canvasRef}
          width={400}
          height={180}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full cursor-crosshair bg-slate-950 block"
        />
        {isEmpty && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-center text-xs text-slate-600">
            Draw your signature here using mouse or touch
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={clearCanvas}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10 transition"
        >
          <HiRefresh className="h-4 w-4" />
          Clear
        </button>
        <div className="flex gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isEmpty}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-semibold text-white hover:bg-brand-600 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-brand-500/10"
          >
            <HiCheck className="h-4 w-4" />
            Confirm Signature
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignatureCanvas;
