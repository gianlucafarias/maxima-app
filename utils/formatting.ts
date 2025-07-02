// Función para formatear duración de YouTube (PT4M13S -> 4:13)
export const formatDuration = (duration: string): string => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 'N/A';
  
  const hours = (match[1] || '').replace('H', '');
  const minutes = (match[2] || '').replace('M', '');
  const seconds = (match[3] || '').replace('S', '');
  
  let result = '';
  if (hours) result += `${hours}:`;
  result += `${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
  
  return result;
};

// Función para formatear fecha
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
};

// Función para obtener la próxima hora de actualización
export const getNextUpdateTime = (updateTimes: string[]): string => {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  for (const updateTime of updateTimes) {
    if (currentTime < updateTime) {
      return updateTime;
    }
  }
  
  // Si ya pasaron todas las horas de hoy, mostrar la primera del día siguiente
  return `${updateTimes[0]} (mañana)`;
};

// Función para verificar si es hora de actualizar
export const shouldUpdateNow = (updateTimes: string[]): boolean => {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  // Verificar si estamos en una ventana de 30 minutos después de los horarios programados
  const isUpdateWindow = updateTimes.some(time => {
    const [hour, minute] = time.split(':').map(Number);
    const updateTime = new Date();
    updateTime.setHours(hour, minute, 0, 0);
    
    const windowEnd = new Date(updateTime);
    windowEnd.setMinutes(windowEnd.getMinutes() + 30); // Ventana de 30 minutos
    
    return now >= updateTime && now <= windowEnd;
  });

  return isUpdateWindow;
}; 