const logTimeElapsed = (startTime, message) => {
  const endTime = process.hrtime(startTime);
  const timeInMs = endTime[0] * 1000 + endTime[1] / 1000000;
  const timeInSeconds = timeInMs / 1000;
  const timeInMinutes = timeInSeconds / 60;

  console.log(`Tiempo ${message}:`);
  console.log(`  - Milisegundos: ${timeInMs.toFixed(2)}ms`);
  console.log(`  - Segundos: ${timeInSeconds.toFixed(2)}s`);
  console.log(`  - Minutos: ${timeInMinutes.toFixed(2)}min`);
};

module.exports = {
  logTimeElapsed,
};
