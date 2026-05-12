import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Lightbulb, Lock, Unlock, Thermometer, Droplets,
    Wind, Flame, ShieldAlert, Wifi, Zap, Waves, Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const [devices, setDevices] = useState({
        bulb_1: false, bulb_2: false, bulb_3: false, bulb_4: false, bulb_5: false, bulb_6: false,
        door_1: 0, door_2: 0, door_3: 0, door_4: 0, door_5: 0,
        fan: false, water_pump: false
    });

    const [sensors, setSensors] = useState({
        temperature: 0, humidity: 0, gas_level: 0, fire_detected: false, moisture_level: 0
    });

    const [history, setHistory] = useState([]);

    const bulbLabels = ["Garage", "Drawing", "Bathroom", "Hall", "Bedroom", "Kitchen"];
    const gateLabels = ["Garage Gate", "Drawing Gate", "Hall Gate", "Bedroom Gate", "Kitchen Gate"];

    const API_BASE = 'http://192.168.137.1:8000/api';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [devRes, sensRes, histRes] = await Promise.all([
                    axios.get(`${API_BASE}/device/`),
                    axios.get(`${API_BASE}/sensor/`),
                    axios.get(`${API_BASE}/sensor/history/`)
                ]);
                setDevices(devRes.data);
                setSensors(sensRes.data);
                setHistory(histRes.data);
            } catch (err) {
                console.error("Connection failed.");
            }
        };
        const interval = setInterval(fetchData, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleToggle = async (field, value) => {
        try {
            const res = await axios.patch(`${API_BASE}/device/`, { [field]: value });
            setDevices(prev => ({ ...prev, ...res.data.data }));
        } catch (err) {
            console.error("Update failed.");
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#f1f5f9] overflow-y-auto md:overflow-hidden p-4 md:p-6 font-sans text-slate-900 flex flex-col">

            {/* Header */}
            <div className="flex justify-between items-center mb-4 md:h-[8%]">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 tracking-[0.3em] uppercase">IoT Integrated Systems</p>
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Smart Home Dashboard</h1>
                </div>
                <div className="flex items-center gap-3 bg-white text-emerald-600 px-4 py-2 rounded-full font-bold text-[10px] border border-slate-200 shadow-sm">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                    <Wifi size={14} /> Live
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 flex-1 min-h-0">

                {/* Left Column: Fire Alert, Lighting, and Automatic Water Pump Indicator */}
                <div className="md:col-span-3 flex flex-col gap-4 min-h-0">
                    <div className={`p-4 rounded-[2rem] border-2 transition-all ${sensors.fire_detected ? 'bg-red-50 border-red-500 animate-pulse' : 'bg-white border-transparent shadow-sm'}`}>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Safety</span>
                            <span className="font-bold text-[10px]">{sensors.fire_detected ? 'ALARM' : 'CLEAR'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${sensors.fire_detected ? 'bg-red-500 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
                                <ShieldAlert size={18} />
                            </div>
                            <span className="font-black text-lg uppercase">Fire Status</span>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-slate-100 flex-1 flex flex-col overflow-hidden">
                        <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-[0.2em] mb-3 text-center">Lighting</h3>
                        <div className="space-y-2 overflow-y-auto pr-1">
                            {bulbLabels.map((name, index) => (
                                <div key={index} className={`flex items-center justify-between p-3 rounded-2xl transition-all ${devices[`bulb_${index + 1}`] ? 'bg-amber-50/70 border border-amber-100' : 'bg-slate-50 border border-transparent'}`}>
                                    <div className="flex items-center gap-3">
                                        <Lightbulb size={16} className={devices[`bulb_${index + 1}`] ? 'text-amber-500 fill-amber-400' : 'text-slate-300'} />
                                        <span className="text-[11px] font-bold text-slate-700 uppercase">{name}</span>
                                    </div>
                                    <button onClick={() => handleToggle(`bulb_${index + 1}`, !devices[`bulb_${index + 1}`])} className={`w-9 h-5 rounded-full relative transition-all ${devices[`bulb_${index + 1}`] ? 'bg-amber-400' : 'bg-slate-300'}`}>
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${devices[`bulb_${index + 1}`] ? 'left-5' : 'left-1'}`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Automatic Water Pump Indicator (No Buttons) */}
                    <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl transition-colors ${devices.water_pump ? 'bg-blue-500 text-white animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
                                <Waves size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Automatic Pump</p>
                                <p className={`text-sm font-black uppercase ${devices.water_pump ? 'text-blue-600' : 'text-slate-400'}`}>
                                    {devices.water_pump ? 'Running' : 'Standby'}
                                </p>
                            </div>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${devices.water_pump ? 'bg-blue-500' : 'bg-slate-300'}`} />
                    </div>
                </div>

                {/* Middle Column: Charts */}
                <div className="md:col-span-5 bg-slate-900 rounded-[3.5rem] p-6 text-white shadow-2xl flex flex-col border-4 border-slate-800 min-h-0">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">Live Telemetry</h3>
                        <Activity className="text-emerald-500" size={18} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto pr-2">
                        <SensorChartCard label="Temp" value={sensors.temperature} unit="°C" data={history} dataKey="temperature" color="#fb7185" icon={<Thermometer size={14} />} />
                        <SensorChartCard label="Humidity" value={sensors.humidity} unit="%" data={history} dataKey="humidity" color="#38bdf8" icon={<Droplets size={14} />} />
                        <SensorChartCard label="Soil" value={sensors.moisture_level} unit="%" data={history} dataKey="moisture_level" color="#818cf8" icon={<Waves size={14} />} />
                        <SensorChartCard label="Gas" value={sensors.gas_level} unit="%" data={history} dataKey="gas_level" color="#34d399" icon={<Wind size={14} />} />
                    </div>
                    <div className={`mt-4 p-4 rounded-2xl flex items-center justify-between border-2 ${sensors.fire_detected ? 'bg-red-500/20 border-red-500' : 'bg-slate-800 border-slate-700'}`}>
                        <div className="flex items-center gap-3">
                            <Flame className={sensors.fire_detected ? "text-red-500" : "text-slate-600"} size={18} />
                            <p className="text-[10px] font-bold uppercase text-slate-300 tracking-widest">Flame Sensor</p>
                        </div>
                        <span className="text-[9px] font-black uppercase text-slate-500">{sensors.fire_detected ? "Detected" : "Stable"}</span>
                    </div>
                </div>

                {/* Right Column: Gas Alert, Gates, and Automatic Fan Indicator */}
                <div className="md:col-span-4 flex flex-col gap-4 min-h-0">
                    <div className={`p-4 rounded-[2rem] border-2 ${sensors.gas_level > 50 ? 'bg-orange-50 border-orange-500' : 'bg-white border-transparent shadow-sm'}`}>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Air Quality</span>
                            <span className="font-bold text-[10px] text-emerald-500">{sensors.gas_level > 50 ? 'DANGER' : 'SAFE'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${sensors.gas_level > 50 ? 'bg-orange-500 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
                                <Wind size={18} />
                            </div>
                            <span className="font-black text-lg uppercase">Gas Leakage</span>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-slate-100 flex-1 flex flex-col overflow-hidden">
                        <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest mb-4 text-center">Security Gates</h3>
                        <div className="space-y-2 overflow-y-auto pr-1">
                            {gateLabels.map((name, index) => (
                                <div key={index} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-transparent">
                                    <div className="flex items-center gap-3">
                                        {devices[`door_${index + 1}`] > 0 ? <Unlock size={16} className="text-emerald-500" /> : <Lock size={16} className="text-slate-300" />}
                                        <span className="text-[11px] font-bold text-slate-800 uppercase">{name}</span>
                                    </div>
                                    <button onClick={() => handleToggle(`door_${index + 1}`, devices[`door_${index + 1}`] === 0 ? 90 : 0)} className={`px-4 py-1.5 rounded-xl text-[9px] font-black ${devices[`door_${index + 1}`] > 0 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                        {devices[`door_${index + 1}`] > 0 ? 'OPEN' : 'CLOSE'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Automatic Fan Indicator (No Buttons) */}
                    <div className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-slate-100 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl transition-colors ${devices.fan ? 'bg-sky-500 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>
                                <Wind size={24} className={devices.fan ? 'animate-spin' : ''} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Climate Automation</p>
                                <p className={`text-xl font-black uppercase ${devices.fan ? 'text-sky-600' : 'text-slate-800'}`}>
                                    {devices.fan ? 'Fan Active' : 'Fan Off'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Team Footer */}
            <div className="mt-4 bg-white px-6 py-3 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center gap-6 overflow-x-auto">
                {["Bipin Limbu", "Yubraj Khatri", "Nirjala Subedi", "Samiksha Bhandari", "Aasish Karki"].map(name => (
                    <div key={name} className="flex items-center gap-2 whitespace-nowrap">
                        <div className="w-6 h-6 rounded bg-slate-900 flex items-center justify-center text-[8px] font-bold text-white">{name[0]}</div>
                        <span className="text-[10px] font-bold text-slate-600">{name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SensorChartCard = ({ label, value, unit, data, dataKey, color, icon }) => (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-3 flex flex-col h-[150px]">
        <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
                <span className="text-slate-500">{icon}</span>
                <span className="text-slate-500 text-[9px] font-bold uppercase">{label}</span>
            </div>
            <div className="text-right">
                <span className="text-xl font-black block leading-none">{value}{unit}</span>
            </div>
        </div>
        <div className="flex-1 mt-auto">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
);

export default Dashboard;