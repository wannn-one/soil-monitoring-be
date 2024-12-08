class SensorData {
    constructor(nitrogen, phosphorus, potassium, ph) {
      this.nitrogen = parseFloat(nitrogen);
      this.phosphorus = parseFloat(phosphorus);
      this.potassium = parseFloat(potassium);
      this.ph = parseFloat(ph);
    }
  
    isValid() {
      return (
        !isNaN(this.nitrogen) &&
        !isNaN(this.phosphorus) &&
        !isNaN(this.potassium) &&
        !isNaN(this.ph)
      );
    }
  }
  
  export default SensorData;  