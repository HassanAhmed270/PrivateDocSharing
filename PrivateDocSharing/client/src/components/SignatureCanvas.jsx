import { useRef, useState } from "react";

export default function SignatureCanvas({ onSave, onCancel }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [hasSignature, setHasSignature] = useState(false);

  const getPosition = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    if (event.touches && event.touches.length > 0) {
      return {
        x: event.touches[0].clientX - rect.left,
        y: event.touches[0].clientY - rect.top,
      };
    }

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const startDrawing = (event) => {
    event.preventDefault();

    drawing.current = true;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const { x, y } = getPosition(event);

    context.beginPath();
    context.moveTo(x, y);
  };

  const draw = (event) => {
    if (!drawing.current) return;

    event.preventDefault();

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const { x, y } = getPosition(event);

    context.lineWidth = 2;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#000000";

    context.lineTo(x, y);
    context.stroke();

    setHasSignature(true);
  };

  const stopDrawing = (event) => {
    if (event) {
      event.preventDefault();
    }

    drawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    context.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const saveSignature = () => {
    if (!hasSignature) {
      return;
    }

    const canvas = canvasRef.current;

    // The canvas creates the signature image in the frontend.
    // Backend signing happens only after onSave is called.
    const signatureImage = canvas.toDataURL("image/png");

    onSave(signatureImage);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl">
        <h2 className="mb-2 text-xl font-bold text-black">
          Sign Document
        </h2>

        <p className="mb-4 text-sm text-gray-600">
          Draw your signature in the box below.
        </p>

        <canvas
          ref={canvasRef}
          width={700}
          height={250}
          className="block w-full cursor-crosshair rounded border-2 border-gray-300 bg-white touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={clearCanvas}
            className="rounded px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Clear
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={saveSignature}
              disabled={!hasSignature}
              className="rounded bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sign Document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}