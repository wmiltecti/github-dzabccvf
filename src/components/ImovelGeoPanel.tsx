import React, { useState, useRef, useEffect } from 'react';
import { Eye } from 'lucide-react';
import GeoVisualization from './geo/GeoVisualization';
import { GeoVisualizationRefApi } from './geo/GeoVisualizationRefApi';
import Modal from './Modal';


interface ImovelGeoPanelProps {
  carFileName?: string | null;
}

export default function ImovelGeoPanel({ carFileName }: ImovelGeoPanelProps) {
  const [showGeoModal, setShowGeoModal] = useState(false);
  const geoRef = useRef<GeoVisualizationRefApi>(null);
  // Arrays estáveis para evitar re-render desnecessário
  const stableProcesses = React.useMemo(() => [], []);
  const stableCompanies = React.useMemo(() => [], []);


  // Chama importGeoFileFromServer após o modal abrir e o ref estar disponível
  useEffect(() => {
    console.log('[Geo] useEffect: Iniciado...', carFileName);
    if (showGeoModal && carFileName) {
      // Pequeno delay para garantir que o ref esteja disponível após o modal abrir
      const timeout = setTimeout(() => {
        if (geoRef.current) {
          console.log('[Geo] useEffect: Chamando importGeoFileFromServer com', carFileName);
          geoRef.current.importGeoFileFromServer(carFileName);
        } else {
          console.log('[Geo] useEffect: geoRef.current ainda não disponível');
        }
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      console.log('[Geo] useEffect: Condições não atendidas para chamar importGeoFileFromServer');
    }
  }, [showGeoModal, carFileName]);

  return (
    <div className="my-6">
      <div className="flex items-center gap-3 mb-2">
        <Eye className="w-5 h-5 text-blue-600" />
        <span className="font-semibold text-gray-800">Visualização Geo</span>
        <button
          className="ml-4 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={() => {
            console.log('[Geo] Botão Abrir Mapa clicado');
            setShowGeoModal(true);
          }}
        >
          Abrir Mapa
        </button>
      </div>
      {showGeoModal && (
        <Modal isOpen={showGeoModal} onClose={() => setShowGeoModal(false)} title="Visualização Geo" size="xl" fullscreen>
          <GeoVisualization ref={geoRef} processes={stableProcesses} companies={stableCompanies} />
        </Modal>
      )}
    </div>

  );
}
