import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Pen, Square, Circle, Triangle, Type, Eraser, Hand, Trash2, Undo, Redo, Save, X, 
  MousePointer, Highlighter, SprayCan as Spray, Zap, StickyNote, ArrowRight, Minus, 
  RectangleHorizontal 
} from 'lucide-react';
import { Whiteboard, WhiteboardElement, Tool } from '../types/types';
import clsx from 'clsx';

interface WhiteboardEditorProps {
  whiteboard: Whiteboard;
  onSave: (whiteboard: Whiteboard) => Promise<void>;
  onClose: () => void;
}

export function WhiteboardEditor({ whiteboard, onSave, onClose }: WhiteboardEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<Tool>('pen');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentSize, setCurrentSize] = useState(3);
  const [elements, setElements] = useState<WhiteboardElement[]>(whiteboard.content.elements);
  const [history, setHistory] = useState<WhiteboardElement[][]>([whiteboard.content.elements]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [zoom, setZoom] = useState(whiteboard.content.zoom);
  const [pan, setPan] = useState(whiteboard.content.pan);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Initialize canvas and context
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Set canvas size to fill the container
    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      canvas.width = width;
      canvas.height = height;
      setCanvasSize({ width, height });
      
      const context = canvas.getContext('2d');
      if (context) {
        context.lineCap = 'round';
        context.lineJoin = 'round';
        setCtx(context);
        redrawCanvas(context);
      }
    };

    updateCanvasSize();
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(container);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Redraw canvas when elements change
  useEffect(() => {
    if (ctx) {
      redrawCanvas(ctx);
    }
  }, [elements, zoom, pan, ctx]);

  const redrawCanvas = useCallback((context: CanvasRenderingContext2D) => {
    if (!context) return;
    
    // Clear canvas
    context.clearRect(0, 0, canvasSize.width, canvasSize.height);
    
    // Set background
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvasSize.width, canvasSize.height);
    
    // Apply zoom and pan
    context.save();
    context.scale(zoom, zoom);
    context.translate(pan.x, pan.y);
    
    // Draw elements
    elements.forEach(element => {
      drawElement(context, element);
    });
    
    context.restore();
  }, [elements, zoom, pan, canvasSize]);

  const drawElement = (context: CanvasRenderingContext2D, element: WhiteboardElement) => {
    context.save();
    
    context.strokeStyle = element.style.color;
    context.fillStyle = element.style.backgroundColor;
    context.lineWidth = element.style.strokeWidth || 2;
    context.globalAlpha = element.style.opacity || 1;
    
    switch (element.type) {
      case 'pen':
      case 'highlighter':
      case 'spray':
      case 'calligraphy':
        drawPath(context, element);
        break;
      case 'text':
        drawText(context, element);
        break;
      case 'sticky':
        drawSticky(context, element);
        break;
      case 'shape':
        drawShape(context, element);
        break;
      case 'laser':
        drawLaser(context, element);
        break;
    }
    
    context.restore();
  };

  const drawPath = (context: CanvasRenderingContext2D, element: WhiteboardElement) => {
    if (!element.content) return;
    
    const points = JSON.parse(element.content);
    if (points.length < 2) return;
    
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      context.lineTo(points[i].x, points[i].y);
    }
    
    context.stroke();
  };

  const drawText = (context: CanvasRenderingContext2D, element: WhiteboardElement) => {
    context.font = `${element.style.fontSize || 16}px ${element.style.fontFamily || 'Arial'}`;
    context.fillStyle = element.style.color;
    context.fillText(element.content, element.position.x, element.position.y);
  };

  const drawSticky = (context: CanvasRenderingContext2D, element: WhiteboardElement) => {
    const { x, y } = element.position;
    const { width, height } = element.size;
    
    // Draw sticky note background
    context.fillStyle = element.style.backgroundColor;
    context.fillRect(x, y, width, height);
    
    // Draw border
    context.strokeStyle = element.style.color;
    context.strokeRect(x, y, width, height);
    
    // Draw text
    context.fillStyle = element.style.color;
    context.font = `${element.style.fontSize || 14}px Arial`;
    
    const lines = element.content.split('\n');
    lines.forEach((line, index) => {
      context.fillText(line, x + 10, y + 20 + (index * 20));
    });
  };

  const drawShape = (context: CanvasRenderingContext2D, element: WhiteboardElement) => {
    const { x, y } = element.position;
    const { width, height } = element.size;
    
    context.beginPath();
    
    switch (element.shapeType) {
      case 'rectangle':
        context.rect(x, y, width, height);
        break;
      case 'roundedRect':
        roundRect(context, x, y, width, height, 10);
        break;
      case 'circle':
        context.arc(x + width/2, y + height/2, Math.min(width, height)/2, 0, 2 * Math.PI);
        break;
      case 'triangle':
        context.moveTo(x + width/2, y);
        context.lineTo(x, y + height);
        context.lineTo(x + width, y + height);
        context.closePath();
        break;
      case 'arrow':
        drawArrow(context, x, y, x + width, y + height);
        break;
      case 'line':
        context.moveTo(x, y);
        context.lineTo(x + width, y + height);
        break;
    }
    
    if (element.style.fill) {
      context.fill();
    }
    context.stroke();
  };

  const drawLaser = (context: CanvasRenderingContext2D, element: WhiteboardElement) => {
    const now = Date.now();
    const age = now - (element.timestamp || now);
    const maxAge = 3000; // 3 seconds
    
    if (age > maxAge) return;
    
    const opacity = Math.max(0, 1 - (age / maxAge));
    context.globalAlpha = opacity;
    
    context.fillStyle = '#ff0000';
    context.beginPath();
    context.arc(element.position.x, element.position.y, 8, 0, 2 * Math.PI);
    context.fill();
  };

  const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) => {
    const headLength = 20;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    
    ctx.lineTo(x2 - headLength * Math.cos(angle - Math.PI / 6), y2 - headLength * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLength * Math.cos(angle + Math.PI / 6), y2 - headLength * Math.sin(angle + Math.PI / 6));
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: ((e.clientX - rect.left) * scaleX - pan.x) / zoom,
      y: ((e.clientY - rect.top) * scaleY - pan.y) / zoom
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    setLastPoint(pos);
    
    if (currentTool === 'hand') {
      setIsPanning(true);
      return;
    }
    
    setIsDrawing(true);
    setCurrentPath([pos]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    
    if (isPanning && lastPoint) {
      const deltaX = (pos.x - lastPoint.x) * zoom;
      const deltaY = (pos.y - lastPoint.y) * zoom;
      setPan(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      return;
    }
    
    if (!isDrawing || !lastPoint) return;
    
    if (currentTool === 'pen' || currentTool === 'highlighter' || currentTool === 'spray' || currentTool === 'calligraphy') {
      setCurrentPath(prev => [...prev, pos]);
      
      // Draw live preview
      if (ctx) {
        ctx.save();
        ctx.scale(zoom, zoom);
        ctx.translate(pan.x, pan.y);
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = currentSize;
        ctx.globalAlpha = currentTool === 'highlighter' ? 0.5 : 1;
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        ctx.restore();
      }
    }
    
    setLastPoint(pos);
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      setLastPoint(null);
      return;
    }
    
    if (!isDrawing) return;
    
    if (currentPath.length > 1) {
      const newElement: WhiteboardElement = {
        id: crypto.randomUUID(),
        type: currentTool as any,
        position: currentPath[0],
        size: { width: 0, height: 0 },
        content: JSON.stringify(currentPath),
        style: {
          color: currentColor,
          backgroundColor: 'transparent',
          strokeWidth: currentSize,
          opacity: currentTool === 'highlighter' ? 0.5 : 1
        },
        zIndex: elements.length
      };
      
      const newElements = [...elements, newElement];
      setElements(newElements);
      addToHistory(newElements);
    }
    
    setIsDrawing(false);
    setCurrentPath([]);
    setLastPoint(null);
  };

  const addToHistory = (newElements: WhiteboardElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newElements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements([...history[historyIndex - 1]]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements([...history[historyIndex + 1]]);
    }
  };

  const clearCanvas = () => {
    setElements([]);
    addToHistory([]);
  };

  const handleSave = async () => {
    const updatedWhiteboard: Whiteboard = {
      ...whiteboard,
      content: {
        ...whiteboard.content,
        elements,
        zoom,
        pan,
        canvasSize
      },
      updatedAt: new Date()
    };
    
    await onSave(updatedWhiteboard);
  };

  const tools = [
    { id: 'cursor', icon: MousePointer, label: 'Cursor' },
    { id: 'pen', icon: Pen, label: 'Pen' },
    { id: 'highlighter', icon: Highlighter, label: 'Highlighter' },
    { id: 'spray', icon: Spray, label: 'Spray' },
    { id: 'calligraphy', icon: Zap, label: 'Calligraphy' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'sticky', icon: StickyNote, label: 'Sticky Note' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'roundedRect', icon: RectangleHorizontal, label: 'Rounded Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'triangle', icon: Triangle, label: 'Triangle' },
    { id: 'arrow', icon: ArrowRight, label: 'Arrow' },
    { id: 'line', icon: Minus, label: 'Line' },
    { id: 'hand', icon: Hand, label: 'Pan' },
    { id: 'laser', icon: Zap, label: 'Laser Pointer' }
  ];

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB'
  ];

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">{whiteboard.name}</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-2 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo"
            >
              <Undo size={20} />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Redo"
            >
              <Redo size={20} />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm">Zoom: {Math.round(zoom * 100)}%</span>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
          >
            <Save size={16} />
            Save
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-gray-700"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Canvas Container - This will take all available space */}
      <div ref={containerRef} className="flex-1 relative bg-gray-100">
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            cursor: currentTool === 'hand' ? 'grab' : 
                   currentTool === 'cursor' ? 'default' : 'crosshair'
          }}
        />
      </div>

      {/* Toolbar */}
      <div className="bg-gray-800 text-white p-2">
        <div className="flex flex-col gap-2">
          {/* Tools row */}
          <div className="flex flex-wrap gap-1">
            {tools.map(tool => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => setCurrentTool(tool.id as Tool)}
                  className={clsx(
                    'p-1.5 rounded transition-colors flex-shrink-0',
                    currentTool === tool.id 
                      ? 'bg-blue-600 text-white' 
                      : 'hover:bg-gray-700'
                  )}
                  title={tool.label}
                >
                  <Icon size={18} />
                </button>
              );
            })}
          </div>

          {/* Controls row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Colors */}
            <div className="flex items-center gap-1 flex-wrap">
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => setCurrentColor(color)}
                  className={clsx(
                    'w-6 h-6 rounded border transition-all flex-shrink-0',
                    currentColor === color 
                      ? 'border-white scale-110' 
                      : 'border-gray-600 hover:border-gray-400'
                  )}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>

            {/* Size */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-sm">Size:</span>
              <input
                type="range"
                min="1"
                max="50"
                value={currentSize}
                onChange={(e) => setCurrentSize(parseInt(e.target.value))}
                className="w-20"
              />
              <span className="text-sm w-8">{currentSize}px</span>
            </div>

            {/* Zoom and clear */}
            <div className="flex items-center gap-2 ml-auto flex-shrink-0">
              <button
                onClick={clearCanvas}
                className="flex items-center gap-1 bg-red-600 hover:bg-red-700 px-2 py-1.5 rounded transition-colors text-sm"
              >
                <Trash2 size={16} />
                Clear
              </button>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
                  className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded"
                >
                  -
                </button>
                <span className="text-sm min-w-[60px] text-center">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                  className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded"
                >
                  +
                </button>
                <button
                  onClick={() => {
                    setZoom(1);
                    setPan({ x: 0, y: 0 });
                  }}
                  className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                >
                  100%
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}