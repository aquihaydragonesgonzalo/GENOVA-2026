import React, { useState, useEffect } from 'react';
import { PRONUNCIATIONS } from '../constants';
import { 
  Volume2, Thermometer, PhoneCall, Send, Languages, 
  Sun, Cloud, CloudRain, CloudLightning, Wind
} from 'lucide-react';
import { Coordinates } from '../types';

interface GuideProps {
  userLocation: Coordinates | null;
}

interface WeatherData {
  hourly: {
    time: string[];
    temperature: number[];
    code: number[];
  };
}

const Guide: React.FC<GuideProps> = ({ userLocation }) => {
  const [playing, setPlaying] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=44.41&longitude=8.92&hourly=temperature_2m,weathercode&timezone=Europe%2FRome'
        );
        const data = await response.json();
        setWeather({
          hourly: {
            time: data.hourly.time,
            temperature: data.hourly.temperature_2m,
            code: data.hourly.weathercode
          }
        });
      } catch (error) {
        console.error("Clima error:", error);
      } finally {
        setLoadingWeather(false);
      }
    };
    fetchWeather();
  }, []);

  const getWeatherIcon = (code: number, size = 20) => {
    if (code <= 1) return <Sun size={size} className="text-amber-500" />;
    if (code <= 3) return <Cloud size={size} className="text-slate-400" />;
    if (code <= 67) return <CloudRain size={size} className="text-blue-500" />;
    if (code <= 99) return <CloudLightning size={size} className="text-purple-500" />;
    return <Wind size={size} className="text-slate-400" />;
  };

  const playSimulatedAudio = (word: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'it-IT';
      utterance.rate = 0.85;
      setPlaying(word);
      utterance.onend = () => setPlaying(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSOS = () => {
    const message = userLocation 
      ? `¡SOS! Necesito ayuda en Génova. Mi ubicación actual es: https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}`
      : `¡SOS! Necesito ayuda en Génova. No puedo obtener mi ubicación GPS.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="pb-32 px-4 pt-6 max-w-lg mx-auto h-full overflow-y-auto no-scrollbar">
      <h2 className="text-2xl font-bold text-blue-900 mb-6 uppercase tracking-tight">Guía Génova</h2>

      {/* SOS Section */}
      <div className="mb-8 bg-rose-700 rounded-[2rem] p-6 shadow-xl text-white relative overflow-hidden border-2 border-white/10">
        <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center mb-3">
            <PhoneCall size={24} className="text-white animate-pulse mr-3" />
            <h3 className="font-black text-lg uppercase tracking-widest">ASISTENCIA SOS</h3>
          </div>
          <p className="text-xs text-rose-50 mb-6 leading-relaxed font-medium">
            Si te desorientas en los caruggi, envía tu ubicación GPS exacta al contacto de emergencia por WhatsApp.
          </p>
          <button onClick={handleSOS} className="w-full py-4 bg-white text-rose-800 font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg uppercase tracking-widest text-sm active:scale-95 transition-transform">
            <Send size={18} /> Enviar Localización
          </button>
        </div>
      </div>

      {/* Weather Section */}
      <div className="mb-8">
        <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center uppercase tracking-widest px-1">
          <Thermometer size={18} className="mr-2 text-blue-900"/> Tiempo en "La Superba"
        </h3>
        {loadingWeather ? (
          <div className="h-24 bg-white rounded-3xl animate-pulse border border-blue-50"></div>
        ) : (
          <div className="bg-white p-2 pb-5 rounded-[2.5rem] border border-blue-50 shadow-xl overflow-hidden">
            <div className="flex overflow-x-auto gap-3 px-6 py-4 no-scrollbar">
              {weather?.hourly.time.map((time, i) => {
                const hour = new Date(time).getHours();
                if (hour >= 8 && hour <= 20) return (
                  <div key={time} className="flex flex-col items-center justify-between min-w-[70px] p-3 bg-blue-50/50 rounded-3xl border border-blue-100">
                    <span className="text-[10px] font-black text-blue-400 mb-2">{hour}:00</span>
                    <div className="p-2 bg-white rounded-2xl mb-2 shadow-sm">{getWeatherIcon(weather.hourly.code[i], 24)}</div>
                    <span className="text-sm font-black text-blue-900">{Math.round(weather.hourly.temperature[i])}°</span>
                  </div>
                );
                return null;
              })}
            </div>
          </div>
        )}
      </div>

      {/* Language Section */}
      <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center uppercase tracking-widest px-1">
        <Languages size={18} className="mr-2 text-blue-900"/> Italiano Básico
      </h3>
      <div className="bg-white rounded-3xl shadow-md border border-blue-50 overflow-hidden mb-8">
        {PRONUNCIATIONS.map((item) => (
          <div key={item.word} className="p-5 flex justify-between items-center border-b border-slate-50 last:border-0 hover:bg-blue-50/30 transition-colors group">
            <div>
              <div className="flex items-center gap-3">
                <p className="font-black text-blue-950 text-lg">{item.word}</p>
                <button onClick={() => playSimulatedAudio(item.word)} className={`p-2 rounded-full transition-all ${playing === item.word ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50'}`}>
                  <Volume2 size={16} />
                </button>
              </div>
              <p className="text-xs text-slate-500 italic">"{item.simplified}"</p>
            </div>
            <p className="text-[10px] font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-tighter border border-blue-100">{item.meaning}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Guide;