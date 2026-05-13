import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Lightbulb, Lock, Unlock, Thermometer, Droplets,
    Wind, Flame, ShieldAlert, Wifi, Zap, Waves, Activity, Users
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

    const bulbLabels = ["Garage Light", "Drawing Light", "Hall Light", "Bathroom Light", "Bedroom Light", "Kitchen Light"];
    const gateLabels = ["Hall Gate", "Drawing Gate", "Kitchen Gate", "Bedroom Gate", "Garage Gate"];

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
                console.error("Django connection dead.");
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
            console.error("Toggle failed.");
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#f1f5f9] p-4 md:p-6 font-sans text-slate-900 flex flex-col gap-5">

            {/* Header */}
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 tracking-[0.3em] uppercase">IoT Integrated Systems</p>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Smart Home Dashboard</h1>
                </div>
                <div className="flex items-center gap-3 bg-white text-emerald-600 px-4 py-2 rounded-full font-bold text-xs border border-slate-200 shadow-sm">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                    <Wifi size={14} /> Live
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 flex-1 min-h-0">

                {/* Left: Fire Alert, Lights & Water Pump */}
                <div className="md:col-span-3 flex flex-col gap-4 overflow-hidden">
                    <div className={`p-4 rounded-[2rem] border-2 transition-all shrink-0 ${sensors.fire_detected ? 'bg-red-50 border-red-500 animate-pulse' : 'bg-white border-transparent shadow-sm'}`}>
                        <div className="flex justify-between items-center mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            <span>Safety</span>
                            <span>{sensors.fire_detected ? 'ALARM' : 'CLEAR'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${sensors.fire_detected ? 'bg-red-500 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
                                <ShieldAlert size={18} />
                            </div>
                            <span className="font-black text-lg uppercase tracking-tighter">Fire Status</span>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-slate-100 flex-1 flex flex-col overflow-hidden">
                        <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-[0.2em] mb-4 text-center">Lighting</h3>
                        <div className="space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                            {bulbLabels.map((name, index) => (
                                <div key={index} className={`flex items-center justify-between p-3.5 rounded-2xl transition-all ${devices[`bulb_${index + 1}`] ? 'bg-amber-50/70 border border-amber-100' : 'bg-slate-50 border border-transparent'}`}>
                                    <div className="flex items-center gap-3">
                                        <Lightbulb size={18} className={devices[`bulb_${index + 1}`] ? 'text-amber-500 fill-amber-400' : 'text-slate-300'} />
                                        <span className="text-[11px] font-bold text-slate-700 uppercase">{name}</span>
                                    </div>
                                    <button onClick={() => handleToggle(`bulb_${index + 1}`, !devices[`bulb_${index + 1}`])} className={`w-9 h-5 rounded-full relative transition-all ${devices[`bulb_${index + 1}`] ? 'bg-amber-400' : 'bg-slate-300'}`}>
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${devices[`bulb_${index + 1}`] ? 'left-5' : 'left-1'}`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Center: Charts */}
                <div className="md:col-span-5 bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl flex flex-col border-4 border-slate-800">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">Telemetry Data</h3>
                        <Activity className="text-emerald-500" size={18} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <SensorChartCard label="Temp" value={sensors.temperature} unit="°C" data={history} dataKey="temperature" color="#fb7185" icon={<Thermometer size={14} />} />
                        <SensorChartCard label="Humidity" value={sensors.humidity} unit="%" data={history} dataKey="humidity" color="#38bdf8" icon={<Droplets size={14} />} />
                        <SensorChartCard label="Soil" value={sensors.moisture_level} unit="%" data={history} dataKey="moisture_level" color="#818cf8" icon={<Waves size={14} />} />
                        <SensorChartCard label="Gas" value={sensors.gas_level} unit="%" data={history} dataKey="gas_level" color="#34d399" icon={<Wind size={14} />} />
                    </div>
                </div>

                {/* Right: Gas Alert, Gates & Fan */}
                <div className="md:col-span-4 flex flex-col gap-4 overflow-hidden">
                    <div className={`p-4 rounded-[2rem] border-2 transition-all shrink-0 ${sensors.gas_level > 50 ? 'bg-orange-50 border-orange-500 animate-pulse' : 'bg-white border-transparent shadow-sm'}`}>
                        <div className="flex justify-between items-center mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            <span>Air Quality</span>
                            <span>{sensors.gas_level > 50 ? 'DANGER' : 'STABLE'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${sensors.gas_level > 50 ? 'bg-orange-500 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
                                <Wind size={18} />
                            </div>
                            <span className="font-black text-lg uppercase tracking-tighter">Gas Leakage</span>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-slate-100 flex-1 flex flex-col overflow-hidden">
                        <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest mb-4 text-center">Security Gates</h3>
                        <div className="space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                            {gateLabels.map((name, index) => (
                                <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-transparent">
                                    <div className="flex items-center gap-3">
                                        {devices[`door_${index + 1}`] > 0 ? <Unlock size={18} className="text-emerald-500" /> : <Lock size={18} className="text-slate-300" />}
                                        <span className="text-[12px] font-bold text-slate-800 uppercase">{name}</span>
                                    </div>
                                    <button onClick={() => handleToggle(`door_${index + 1}`, devices[`door_${index + 1}`] === 0 ? 90 : 0)} className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all ${devices[`door_${index + 1}`] > 0 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                        {devices[`door_${index + 1}`] > 0 ? 'OPEN' : 'CLOSE'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Project Team Footer - FULLY RESPONSIVE & CENTERED */}
            <div className="bg-white px-6 py-5 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 shrink-0">
                <div className="flex items-center gap-2 shrink-0">
                    <Users size={18} className="text-slate-300" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Project Team:</span>
                </div>

                {/* Grid setup for mobile, Flex for desktop */}
                <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 md:gap-10">
                    {["Bipin Limbu", "Yubraj Khatri", "Nirjala Subedi", "Samiksha Bhandari", "Aasish Karki"].map(name => (
                        <div key={name} className="flex items-center gap-3 whitespace-nowrap">
                            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-[11px] font-bold text-white shadow-sm shrink-0">
                                {name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <span className="text-[12px] font-bold text-slate-700">{name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const SensorChartCard = ({ label, value, unit, data, dataKey, color, icon }) => (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-4 flex flex-col h-[180px] transition-all hover:bg-slate-800/60">
        <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-900 rounded-lg text-slate-400">{icon}</div>
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{label}</span>
            </div>
            <div className="text-right">
                <span className="text-2xl font-black tracking-tighter leading-none block">{value}</span>
                <span className="text-slate-500 font-bold text-[9px] uppercase">{unit}</span>
            </div>
        </div>
        <div className="flex-1 mt-auto">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    {/* Yo Tooltip thapepachi hover garda data auncha */}
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#0f172a',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '10px',
                            fontWeight: 'bold'
                        }}
                        itemStyle={{ color: color }}
                        labelStyle={{ display: 'none' }}
                        cursor={{ stroke: '#334155', strokeWidth: 1 }}
                    />
                    <Line
                        type="monotone"
                        dataKey={dataKey}
                        stroke={color}
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 0 }} // Hover garda dot dekhine
                        isAnimationActive={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
);

export default Dashboard;