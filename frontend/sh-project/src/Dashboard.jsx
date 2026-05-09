import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Lightbulb, Lock, Unlock, Thermometer, Droplets,
    Wind, Flame, ShieldAlert, Wifi, Zap, Waves, Activity
} from 'lucide-react';

const Dashboard = () => {
    const [devices, setDevices] = useState({
        bulb_1: false, bulb_2: false, bulb_3: false, bulb_4: false, bulb_5: false, bulb_6: false,
        door_1: 0, door_2: 0, door_3: 0, door_4: 0, door_5: 0,
        fan: false, water_pump: false
    });

    const [sensors, setSensors] = useState({
        temperature: 0, humidity: 0, gas_level: 0, fire_detected: false, moisture_level: 0
    });

    const API_BASE = 'http://192.168.137.1:8000/api';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [devRes, sensRes] = await Promise.all([
                    axios.get(`${API_BASE}/device/`),
                    axios.get(`${API_BASE}/sensor/`)
                ]);
                setDevices(devRes.data);
                setSensors(sensRes.data);
            } catch (err) {
                console.error("Backend unreachable.");
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
        <div className="h-screen w-screen bg-[#f1f5f9] overflow-hidden p-6 font-sans text-slate-900 flex flex-col">

            {/* Header */}
            <div className="flex justify-between items-center mb-4 h-[8%]">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 tracking-[0.3em] uppercase">IoT Integrated Systems</p>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Smart Home Dashboard</h1>
                </div>
                <div className="flex items-center gap-3 bg-white text-emerald-600 px-5 py-2 rounded-full font-bold text-xs border border-slate-200 shadow-sm">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                    <Wifi size={16} /> Live
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-12 gap-5 flex-1 min-h-0">

                {/* Left Column: Fire Warning, Lights & Pump */}
                <div className="col-span-3 flex flex-col gap-4 min-h-0">
                    <div className={`p-4 rounded-[2rem] border-2 transition-all shrink-0 ${sensors.fire_detected ? 'bg-red-50 border-red-500 animate-pulse' : 'bg-white border-transparent shadow-sm'}`}>
                        <div className="flex justify-between items-center mb-1">
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${sensors.fire_detected ? 'text-red-600' : 'text-emerald-500'}`}>Safety Status</span>
                            <span className="font-bold text-[10px]">{sensors.fire_detected ? 'ALARM' : 'CLEAR'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${sensors.fire_detected ? 'bg-red-500 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
                                {sensors.fire_detected ? <ShieldAlert size={18} /> : <Zap size={18} />}
                            </div>
                            <span className="font-black text-lg tracking-tighter uppercase">
                                {sensors.fire_detected ? "Fire Warning" : "Fire Warning"}
                            </span>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-slate-100 flex-1 flex flex-col min-h-0">
                        <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-[0.2em] mb-3 text-center">Lighting</h3>
                        <div className="space-y-3 overflow-hidden flex-1">
                            {[1, 2, 3, 4, 5, 6].map((num) => (
                                <div key={num} className={`flex items-center justify-between p-3.5 rounded-2xl transition-all ${devices[`bulb_${num}`] ? 'bg-amber-50/70 border border-amber-100' : 'bg-slate-50 border border-transparent'}`}>
                                    <div className="flex items-center gap-3">
                                        <Lightbulb size={18} className={devices[`bulb_${num}`] ? 'text-amber-500 fill-amber-400' : 'text-slate-300'} />
                                        <span className="text-[12px] font-bold text-slate-700 uppercase">Light {num}</span>
                                    </div>
                                    <button
                                        onClick={() => handleToggle(`bulb_${num}`, !devices[`bulb_${num}`])}
                                        className={`w-10 h-5 rounded-full relative transition-all ${devices[`bulb_${num}`] ? 'bg-amber-400' : 'bg-slate-300'}`}
                                    >
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${devices[`bulb_${num}`] ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`p-5 rounded-[2.5rem] border-2 transition-all shrink-0 flex items-center justify-between ${devices.water_pump ? 'bg-sky-50 border-sky-200' : 'bg-white border-transparent shadow-sm'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl ${devices.water_pump ? 'bg-sky-500 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                                <Waves size={20} className={devices.water_pump ? 'animate-bounce' : ''} />
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Water Pump</p>
                                <p className={`text-lg font-black tracking-tighter ${devices.water_pump ? 'text-sky-600' : 'text-slate-800'}`}>
                                    {devices.water_pump ? 'ON' : 'OFF'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Middle Column */}
                <div className="col-span-5 bg-slate-900 rounded-[3.5rem] p-8 text-white shadow-2xl flex flex-col border-4 border-slate-800 min-h-0">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">Telemetry</h3>
                        <Activity className="text-emerald-500" size={18} />
                    </div>

                    <h2 className="text-2xl font-bold mb-6 tracking-tight">Environmental Metrics</h2>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-10 flex-1">
                        <CompactSensor label="Temp" value={sensors.temperature} unit="°C" icon={<Thermometer className="text-rose-400" />} color="bg-rose-400" max={50} />
                        <CompactSensor label="Humidity" value={sensors.humidity} unit="%" icon={<Droplets className="text-sky-400" />} color="bg-sky-400" max={100} />
                        <CompactSensor label="Soil Moisture" value={sensors.moisture_level} unit="%" icon={<Waves className="text-indigo-400" />} color="bg-indigo-400" max={4095} />
                        <CompactSensor label="Gas" value={sensors.gas_level} unit="%" icon={<Wind className="text-emerald-400" />} color="bg-emerald-400" max={4095} />
                    </div>

                    <div className={`mt-6 p-4 rounded-2xl flex items-center justify-between border-2 transition-all shrink-0 ${sensors.fire_detected ? 'bg-red-500/20 border-red-500 animate-pulse' : 'bg-slate-800 border-slate-700'}`}>
                        <div className="flex items-center gap-3">
                            <Flame className={sensors.fire_detected ? "text-red-500" : "text-slate-600"} size={18} />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Infrared Flame Sensor</p>
                        </div>
                        <span className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${sensors.fire_detected ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-500'}`}>
                            {sensors.fire_detected ? "Fire Warning" : "Standby"}
                        </span>
                    </div>
                </div>

                {/* Right Column: Security Gates & Automatic Fan */}
                <div className="col-span-4 flex flex-col gap-4 min-h-0">
                    <div className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-slate-100 flex justify-around items-center shrink-0">
                        <div className="flex gap-3">
                            <button onClick={() => handleToggle('fan', !devices.fan)} className={`p-3 rounded-2xl transition-all ${devices.fan ? 'bg-sky-100 text-sky-600' : 'bg-slate-50 text-slate-400'}`}>
                                <Wind size={20} className={devices.fan ? 'animate-spin' : ''} />
                            </button>
                            <button onClick={() => handleToggle('water_pump', !devices.water_pump)} className={`p-3 rounded-2xl transition-all ${devices.water_pump ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                                <Waves size={20} />
                            </button>
                        </div>
                        <div className="h-8 w-[1px] bg-slate-100" />
                        <div className="text-right">
                            <p className="text-lg font-black text-slate-800 leading-none">{devices.fan ? 'ACTIVE' : 'OFF'}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Living Room Automatic Fan</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-slate-100 flex-1 flex flex-col min-h-0">
                        <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest mb-4 text-center">Security Gates</h3>
                        <div className="space-y-3 flex-1 overflow-hidden">
                            {[1, 2, 3, 4, 5].map((num) => (
                                <div key={num} className={`flex items-center justify-between p-4 rounded-2xl transition-all ${devices[`door_${num}`] > 0 ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-50 border border-transparent'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={devices[`door_${num}`] > 0 ? 'text-emerald-500' : 'text-slate-300'}>
                                            {devices[`door_${num}`] > 0 ? <Unlock size={18} /> : <Lock size={18} />}
                                        </div>
                                        <span className="text-[12px] font-bold text-slate-800 uppercase">Gate {num}</span>
                                    </div>
                                    <button
                                        onClick={() => handleToggle(`door_${num}`, devices[`door_${num}`] === 0 ? 90 : 0)}
                                        className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all ${devices[`door_${num}`] > 0 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}
                                    >
                                        {devices[`door_${num}`] > 0 ? 'OPEN' : 'CLOSE'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-4 h-[10%] flex items-center gap-4 shrink-0">
                <div className="bg-white px-8 py-3 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-8 flex-1 justify-center">
                    <span className="text-slate-400 text-[9px] font-black uppercase tracking-[0.4em]">Project Team</span>
                    {["Bipin Limbu", "Yubraj Khatri", "Nirjala Subedi", "Samiksha Bhandari", "Aasish Karki"].map(name => (
                        <div key={name} className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-[9px] font-bold text-white uppercase">
                                {name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap">{name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const CompactSensor = ({ label, value, unit, icon, color, max }) => {
    const percentage = Math.min(Math.round((value / max) * 100), 100);
    return (
        <div className="flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700 shadow-md">{icon}</div>
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{label}</span>
            </div>
            <div className="flex items-baseline gap-1.5 mb-3">
                <span className="text-4xl font-black tracking-tighter">{value}</span>
                <span className="text-slate-500 font-bold text-xs uppercase">{unit}</span>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
};

export default Dashboard;