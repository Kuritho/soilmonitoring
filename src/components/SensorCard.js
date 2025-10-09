import React from 'react';

const SensorCard = ({ icon: Icon, title, value, unit, color, progress }) => {
  return (
    <div className="card sensor-card">
      <div className="sensor-header">
        <Icon className="sensor-icon" />
        <h3>{title}</h3>
      </div>
      <div className="sensor-value" style={{ color }}>
        {value} {unit}
      </div>
      <div className="sensor-progress">
        <div 
          className="progress-fill"
          style={{ 
            width: `${progress}%`,
            backgroundColor: color
          }}
        ></div>
      </div>
    </div>
  );
};

export default SensorCard;