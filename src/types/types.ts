// types.ts

export interface Whiteboard {
  id: string;
  name: string;
  location: string;
  template?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastViewedAt: Date;
  isFavorite: boolean;
  content: WhiteboardContent;
}

export interface WhiteboardContent {
  elements: WhiteboardElement[];
  canvasSize: { width: number; height: number };
  zoom: number;
  pan: { x: number; y: number };
}

export interface WhiteboardElement {
  id: string;
  type: 'text' | 'sticky' | 'shape' | 'pen' | 'highlighter' | 'spray' | 'calligraphy' | 'laser';
  shapeType?: ShapeType;
  position: { x: number; y: number };
  size: { width: number; height: number };
  content: string;
  style: {
    color: string;
    backgroundColor: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: FontWeight;
    fontStyle?: FontStyle;
    textDecoration?: TextDecoration;
    textAlign?: TextAlign;
    strokeWidth?: number;
    opacity?: number;
    fill?: boolean;
  };
  rotation?: number;
  zIndex: number;
  timestamp?: number; // For laser tool fade effect
}

export interface WhiteboardTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  content: WhiteboardContent;
}

export type Tool = 
  | 'cursor' 
  | 'pen' 
  | 'highlighter' 
  | 'spray' 
  | 'calligraphy' 
  | 'eraser' 
  | 'text' 
  | 'sticky' 
  | 'fill' 
  | 'hand' 
  | 'delete' 
  | 'laser'
  | ShapeType;

export type ShapeType = 
  | 'rectangle' 
  | 'roundedRect' 
  | 'circle' 
  | 'triangle' 
  | 'arrow' 
  | 'line';

export type MarkerType = 'pen' | 'highlighter' | 'spray' | 'calligraphy';

export type TextAlign = 'left' | 'center' | 'right';
export type FontWeight = 'normal' | 'bold';
export type FontStyle = 'normal' | 'italic';
export type TextDecoration = 'none' | 'underline';