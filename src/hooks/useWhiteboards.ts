import { useEffect, useState } from 'react';
import { Whiteboard, WhiteboardTemplate } from '../types/types';
import { db } from '../services/database';

export function useWhiteboards() {
  const [whiteboards, setWhiteboards] = useState<Whiteboard[]>([]);
  const [templates, setTemplates] = useState<WhiteboardTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTemplates([
      {
        id: 'blank',
        name: 'Blank Canvas',
        description: 'Start from scratch with a blank canvas',
        thumbnail: '/placeholder-blank.png',
        content: {
          elements: [],
          canvasSize: { width: 2000, height: 1500 },
          zoom: 1,
          pan: { x: 0, y: 0 }
        }
      },
      {
        id: 'grid',
        name: 'Grid Template',
        description: 'Structured grid layout for organized content',
        thumbnail: '/placeholder-grid.png',
        content: {
          elements: [],
          canvasSize: { width: 2000, height: 1500 },
          zoom: 1,
          pan: { x: 0, y: 0 }
        }
      },
      {
        id: 'presentation',
        name: 'Presentation',
        description: 'Perfect for presentations and lectures',
        thumbnail: '/placeholder-presentation.png',
        content: {
          elements: [],
          canvasSize: { width: 2000, height: 1500 },
          zoom: 1,
          pan: { x: 0, y: 0 }
        }
      }
    ]);
  }, []);

  const fetchWhiteboards = async () => {
    try {
      const all = await db.getAllWhiteboards();
      setWhiteboards(all);
    } catch (e) {
      console.error('Failed to fetch whiteboards:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    db.init().then(fetchWhiteboards);
  }, []);

  const createWhiteboard = async (
    whiteboard: Omit<Whiteboard, 'id' | 'createdAt' | 'updatedAt' | 'lastViewedAt'>
  ) => {
    const newBoard = await db.createWhiteboard(whiteboard);
    setWhiteboards(prev => [...prev, newBoard]);
    return newBoard;
  };

  const updateWhiteboard = async (whiteboard: Whiteboard) => {
    await db.updateWhiteboard(whiteboard);
    setWhiteboards(prev => prev.map(w => (w.id === whiteboard.id ? whiteboard : w)));
  };

  const deleteWhiteboard = async (id: string) => {
    if (confirm('Are you sure you want to delete this whiteboard?')) {
      await db.deleteWhiteboard(id);
      setWhiteboards(prev => prev.filter(w => w.id !== id));
    }
  };

  const toggleFavorite = async (id: string) => {
    const wb = whiteboards.find(w => w.id === id);
    if (!wb) return;
    const updated = { ...wb, isFavorite: !wb.isFavorite };
    await updateWhiteboard(updated);
  };

  return {
    whiteboards,
    templates,
    loading,
    createWhiteboard,
    updateWhiteboard,
    deleteWhiteboard,
    toggleFavorite
  };
}