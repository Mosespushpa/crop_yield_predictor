import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPredictedYield(null);

    try {
      const res = await axios.post('http://localhost:8000/predict', formData);
      if ('predicted_yield' in res.data) {
        setPredictedYield(res.data.predicted_yield);
        setRecommendations(res.data.recommendations || []);
      }
      else {
        alert("Prediction failed. Response format unexpected.");
      }
    } catch (err) {
      alert("Prediction failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={styles.card}
      >
        <h2 style={styles.title}>🌾 Crop Yield Predictor</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.grid}>
            <label>State:</label>
            <select name="state" value={formData.state} onChange={handleChange} required style={styles.input}>
              <option value="">-- Select --</option>
              {[
                "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
                "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
                "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
                "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
                "Uttarakhand", "West Bengal"
              ].map((state) => <option key={state} value={state}>{state}</option>)}
            </select>

            <label>Season:</label>
            <select name="season" value={formData.season} onChange={handleChange} required style={styles.input}>
              <option value="">-- Select --</option>
              {["Kharif", "Rabi", "Zaid", "Spring", "Summer", "Monsoon", "Autumn", "Winter"]
                .map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            <label>Crop Type:</label>
<select name="crop_type" value={formData.crop_type} onChange={handleChange} required style={styles.input}>
  <option value="">-- Select --</option>
  <option value="Rice">Rice</option>
  <option value="Wheat">Wheat</option>
  <option value="Maize">Maize</option>
  <option value="Soybean">Soybean</option>
  <option value="Potato">Potato</option>
  <option value="Cotton">Cotton</option>
  <option value="Jute">Jute</option>
  <option value="Sugarcane">Sugarcane</option>
  
</select>

            <label>Rainfall (mm):</label>
            <input type="number" name="rainfall" value={formData.rainfall} onChange={handleChange} required  style={styles.input}/>

            <label>Avg Temp (°C):</label>
            <input type="number" name="avg_temp" value={formData.avg_temp} onChange={handleChange} required style={styles.input} />

            <label>Pesticide Usage (tonnes):</label>
            <input type="number" name="pesticide_usage" value={formData.pesticide_usage} onChange={handleChange} required  style={styles.input}/>

            <label>Fertilizer (kg/ha):</label>
            <input type="number" name="fertilizer" value={formData.fertilizer} onChange={handleChange} required  style={styles.input}/>

            <label>Area (ha):</label>
            <input type="number" name="area" value={formData.area} onChange={handleChange} required  style={styles.input}/>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              backgroundColor: loading ? '#999' : '#1e90ff',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Predicting...' : 'Predict Yield'}
          </button>
        </form>

        <AnimatePresence>
  {(predictedYield !== null || recommendations.length > 0) && (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={styles.resultGrid}
    >
      {predictedYield !== null && (
        <div style={styles.resultBox}>
          <h3>📊 Predicted Yield</h3>
          <p style={{ fontSize: '1.6rem' }}>{predictedYield.toFixed(2)} kg/ha</p>
        </div>
      )}
      {recommendations.length > 0 && (
        <div style={styles.resultBox}>
          <h3>🌱 Smart Recommendations</h3>
          <ul style={{ paddingLeft: '1.2rem' }}>
            {recommendations.map((rec, index) => (
              <li key={index} style={{ marginBottom: '0.5rem' }}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  )}
</AnimatePresence>

      </motion.div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    padding: '40px 10px',
    minHeight: '100vh',
    // background: 'linear-gradient(135deg, #00d2ff,rgb(247, 244, 246))',
    backgroundAttachment: 'fixed',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '30px 25px',
    maxWidth: 700,
    width: '100%',
    color: '#fff',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(8px)' // for glass-like effect
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: '1.8rem',
    color: 'black'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    color: 'black'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    color: 'black'
  },
  input: {
    // background: 'linear-gradient(135deg, #00d2ff,rgb(253, 253, 253))',
    color: '#000',
    border: '1px solid #ccc',
    padding: '10px',
    borderRadius: '8px',
    boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.1)'
  },
  select: {
    background: 'linear-gradient(135deg, #a1ffce,rgb(236, 110, 25))',
    color: '#000',
    border: '1px solid #ccc',
    padding: '10px',
    borderRadius: '8px',
    boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.1)'
  },
  button: {
    marginTop: 20,
    padding: '12px',
    color: 'black',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#1e90ff',
    transition: '0.3s',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
  },
  resultGrid: {
    marginTop: 25,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    alignItems: 'flex-start'
  },
  resultBox: {
    background: 'rgba(255, 255, 255, 0.2)',
    padding: '20px',
    borderRadius: '10px',
    color: 'black',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    minHeight: '120px'
  }
};


export default YieldForm;
