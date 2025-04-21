import React, { useState } from 'react';
import axios from 'axios';

const YieldForm = () => {
  const [formData, setFormData] = useState({
    state: '',
    season: '',
    crop_type: '',
    rainfall: '',
    avg_temp: '',
    pesticide_usage: '',
    fertilizer: '',
    area: ''
  });

  const [predictedYield, setPredictedYield] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("🟢 Button clicked");
      console.log("✅ Submitting:", formData);

      const res = await axios.post('http://localhost:8000/predict', formData);
      console.log("✅ Backend response:", res.data);

      if ('predicted_yield' in res.data) {
        const yieldValue = parseFloat(res.data.predicted_yield);
        setPredictedYield(yieldValue);
        console.log("🧠 Predicted yield set to:", yieldValue);
        alert(`Predicted Yield: ${yieldValue.toFixed(2)} hg/ha`);
      } else {
        console.warn("⚠️ Response missing 'predicted_yield':", res.data);
        alert("Prediction failed. Response format unexpected.");
      }
    } catch (err) {
      console.error("❌ Backend error:", err);
      alert("Prediction failed: " + err.message);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 500, margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h2>Crop Yield Predictor</h2>
      <form onSubmit={handleSubmit}>
        <label>State:</label>
        <select name="state" value={formData.state} onChange={handleChange} required>
          <option value="">-- Select --</option>
          <option value="Karnataka">Karnataka</option>
          <option value="Punjab">Punjab</option>
          <option value="Maharashtra">Maharashtra</option>
        </select>

        <label>Season:</label>
        <select name="season" value={formData.season} onChange={handleChange} required>
          <option value="">-- Select --</option>
          <option value="Kharif">Kharif</option>
          <option value="Rabi">Rabi</option>
          <option value="Zaid">Zaid</option>
        </select>

        <label>Crop Type:</label>
        <input type="text" name="crop_type" value={formData.crop_type} onChange={handleChange} required />

        <label>Rainfall (mm):</label>
        <input type="number" name="rainfall" value={formData.rainfall} onChange={handleChange} required />

        <label>Avg Temperature (°C):</label>
        <input type="number" name="avg_temp" value={formData.avg_temp} onChange={handleChange} required />

        <label>Pesticide Usage (tonnes):</label>
        <input type="number" name="pesticide_usage" value={formData.pesticide_usage} onChange={handleChange} required />

        <label>Fertilizer (kg/ha):</label>
        <input type="number" name="fertilizer" value={formData.fertilizer} onChange={handleChange} required />

        <label>Area (ha):</label>
        <input type="number" name="area" value={formData.area} onChange={handleChange} required />

        <button
          type="submit"
          style={{ marginTop: 10, padding: '6px 12px' }}
        >
          Predict Yield
        </button>
      </form>

      {predictedYield !== null && (
        <div style={{ marginTop: 20, padding: 10, background: '#f0f0f0' }}>
          <h3>Predicted Yield: {predictedYield.toFixed(2)} hg/ha</h3>
        </div>
      )}
    </div>
  );
};

export default YieldForm;
