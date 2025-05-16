import React from "react";
import "./StreamingOptions.css";

const StreamingOptions = ({ streamingOptions }) => {
  return (
    <div className="streaming-options-container">
      <h2>Opciones de Streaming</h2>
      {streamingOptions?.es?.length > 0 ? (
        streamingOptions.es.map((option, index) => (
          <div key={index}>{option.service.name}</div>
        ))
      ) : (
        <p>No disponible actualmente en plataformas de streaming.</p>
      )}
    </div>
  );
};

export default StreamingOptions;