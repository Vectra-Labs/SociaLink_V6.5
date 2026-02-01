import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// Fix Leaflet's default icon path issues in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Coordinates for major Moroccan cities
const CITY_COORDINATES = {
    // Principal Cities
    'Casablanca': [33.5731, -7.5898],
    'Rabat': [34.0209, -6.8416],
    'Marrakech': [31.6295, -7.9811],
    'Fès': [34.0331, -5.0003],
    'Tanger': [35.7595, -5.8340],
    'Agadir': [30.4278, -9.5981],
    'Meknès': [33.8935, -5.5473],
    'Oujda': [34.6814, -1.9076],
    'Kenitra': [34.2610, -6.5802],
    'Tétouan': [35.5785, -5.3684],
    'Safi': [32.3008, -9.2272],
    'Mohammedia': [33.6866, -7.3811],
    'Salé': [34.0413, -6.8166],
    'Temara': [33.9171, -6.9238],

    // North & Rif
    'Nador': [35.1681, -2.9335],
    'Al Hoceïma': [35.2472, -3.9321],
    'Larache': [35.1856, -6.1462],
    'Ksar El Kebir': [35.0017, -5.9018],
    'Fnideq': [35.8459, -5.3533],
    'Martil': [35.6253, -5.2758],
    'M\'diq': [35.6858, -5.3235],
    'Chefchaouen': [35.1688, -5.2636],
    'Berkane': [34.9200, -2.3200],
    'Taourirt': [34.4167, -2.9000],

    // Center & Atlas
    'Béni Mellal': [32.3373, -6.3498],
    'Khouribga': [32.8817, -6.9063],
    'Settat': [33.0010, -7.6166],
    'El Jadida': [33.2316, -8.5007],
    'Khemisset': [33.8293, -6.0667],
    'Khénifra': [32.9333, -5.6667],
    'Ifrane': [33.5228, -5.1102],
    'Azrou': [33.4333, -5.2167],
    'Midelt': [32.6833, -4.7333],
    'Fquih Ben Salah': [32.5000, -6.7000],
    'Azilal': [31.9667, -6.5667],

    // East
    'Errachidia': [31.9316, -4.4244],
    'Guercif': [34.2333, -3.3667],
    'Taza': [34.2125, -4.0104],
    'Jerada': [34.3106, -2.1644],
    'Figuig': [32.1000, -1.2333],

    // South & Souss
    'Ouarzazate': [30.9167, -6.9167],
    'Zagora': [30.3323, -5.8384],
    'Tinghir': [31.5153, -5.5342],
    'Essaouira': [31.5085, -9.7595],
    'Tiznit': [29.6974, -9.7316],
    'Taroudant': [30.4703, -8.8770],
    'Guelmim': [28.9870, -10.0574],
    'Tan-Tan': [28.4380, -11.1032],
    'Sidi Ifni': [29.3797, -10.1730],
    'Tata': [29.7434, -7.9726],

    // Sahara
    'Laâyoune': [27.1253, -13.1625],
    'Dakhla': [23.6848, -15.9576],
    'Boujdour': [26.1264, -14.4843],
    'Smara': [26.7417, -11.6708],

    // Others
    'Sidi Bennour': [32.6500, -8.4167],
    'Sidi Kacem': [34.2167, -5.7000],
    'Sidi Slimane': [34.2667, -5.9167],
    'Youssoufia': [32.2500, -8.5333],
    'El Kelaa des Sraghna': [32.0500, -7.4000],
    'Sefrou': [33.8333, -4.8333],

    // Default center (Morocco)
    'Default': [31.7917, -7.0926]
};

// Component to update map view when center changes
function ChangeView({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

const LocationMap = ({ city, className = "h-64 w-full rounded-xl" }) => {
    // Normalize city name to match keys (case insensitive, basic accent handling)
    const normalizeCity = (name) => {
        if (!name) return 'Default';
        // Simple mapping attempt
        const normalized = Object.keys(CITY_COORDINATES).find(
            key => key.toLowerCase() === name.toLowerCase()
        );
        return normalized || 'Default';
    };

    const cityKey = normalizeCity(city);
    const center = CITY_COORDINATES[cityKey];
    const zoom = cityKey === 'Default' ? 5 : 13;

    return (
        <div className={`overflow-hidden relative z-0 ${className}`}>
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={false}
                className="h-full w-full"
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {cityKey !== 'Default' && (
                    <Marker position={center}>
                        <Popup>
                            <div className="text-center">
                                <span className="font-bold text-blue-600 block mb-1">{city}</span>
                                <span className="text-xs text-slate-500">Localisation approximative</span>
                            </div>
                        </Popup>
                    </Marker>
                )}

                <ChangeView center={center} zoom={zoom} />
            </MapContainer>
        </div>
    );
};

export default LocationMap;
