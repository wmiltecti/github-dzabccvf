import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import GeoVisualization from './geo/GeoVisualization';
import Modal from './Modal'; // Supondo que você já tenha um componente Modal reutilizável

interface ImovelGeoPanelProps {
  // Adapte as props conforme necessário
}

export default function ImovelGeoPanel(props: ImovelGeoPanelProps) {
  const [showGeoModal, setShowGeoModal] = useState(false);

  return (
    <div className="my-6">
      <div className="flex items-center gap-3 mb-2">
        <Eye className="w-5 h-5 text-blue-600" />
        <span className="font-semibold text-gray-800">Visualização Geo</span>
        <button
          className="ml-4 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={() => setShowGeoModal(true)}
        >
          Abrir Mapa
        </button>
      </div>
      {showGeoModal && (
        <Modal isOpen={showGeoModal} onClose={() => setShowGeoModal(false)} title="Visualização Geo" size="xl" fullscreen>
          <div style={{ height: '100vh', width: '100vw', maxWidth: '100vw', maxHeight: '100vh', margin: 0, padding: 0 }}>
            <GeoVisualization />
          </div>
        </Modal>
      )}
    </div>
  );
}
