interface Location {
  latitude: number;
  longitude: number;
}

interface WayPoint {
  location: Location;
  description?: string;
}

export const createTravelLink = (
  startLocation: Location,
  endLocation: Location,
  waypoints: WayPoint[] = [],
): string => {
  let waypointsStr = '';

  if (waypoints.length > 0) {
    waypointsStr =
      '&waypoints=' +
      waypoints
        .map(wp => `${wp.location.latitude},${wp.location.longitude}`)
        .join('|');
  }

  return `https://www.google.com/maps/dir/?api=1&origin=${startLocation.latitude},${startLocation.longitude}&destination=${endLocation.latitude},${endLocation.longitude}${waypointsStr}`;
};

// Mesafe hesaplama fonksiyonu (opsiyonel)
export const calculateTotalDistance = (
  startLocation: Location,
  endLocation: Location,
  waypoints: WayPoint[] = [],
): number => {
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number => {
    const R = 6371; // Dünya'nın yarıçapı (km)
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  let totalDistance = 0;
  let prevLocation = startLocation;

  // Ara noktalar arası mesafeleri hesapla
  waypoints.forEach(wp => {
    totalDistance += calculateDistance(
      prevLocation.latitude,
      prevLocation.longitude,
      wp.location.latitude,
      wp.location.longitude,
    );
    prevLocation = wp.location;
  });

  // Son konum ile bitiş noktası arası mesafeyi hesapla
  totalDistance += calculateDistance(
    prevLocation.latitude,
    prevLocation.longitude,
    endLocation.latitude,
    endLocation.longitude,
  );

  return Math.round(totalDistance);
};
