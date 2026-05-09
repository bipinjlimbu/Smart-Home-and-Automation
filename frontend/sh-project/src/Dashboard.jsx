import React, { useState, useEffect } from 'react';
import {
    Lightbulb, Lock, Unlock, Thermometer, Droplets,
    Wind, Flame, ShieldAlert, Wifi, Zap
} from 'lucide-react';

const Dashboard = () => {
    const [devices, setDevices] = useState({
        bulb_1: false, bulb_2: false, bulb_3: false, bulb_4: false, bulb_5: false, bulb_6: false,
        door_1: 0, door_2: 0, door_3: 0, door_4: 0, door_5: 0, door_6: 0,
        fan: false, water_pump: false
    });

    const [sensors, setSensors] = useState({
        temperature: 0, humidity: 0, gas_level: 0, fire_detected: false, moisture_level: 0
    });

    const API_BASE = 'http://your-django-ip:8000/api';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [devRes, sensRes] = await Promise.all([
                    fetch(`${API_BASE}/devices/`),
                    fetch(`${API_BASE}/sensors/`)
                ]);
                const devData = await devRes.json();
                const sensData = await sensRes.json();

                setDevices(devData);
                setSensors(sensData);
            } catch (err) {
                console.error("Backend unreachable");
            }
        };
        const interval = setInterval(fetchData, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleToggle = async (field, value) => {
        try {
            const res = await fetch(`${API_BASE}/devices/`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [field]: value })
            });
            const result = await res.json();
            setDevices(prev => ({ ...prev, ...result.data }));
        } catch (err) {
            console.error("Update failed");
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-8">
            {/* Top Navigation Bar */}
            <div className="flex justify-between items-center mb-10">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">ESP32 Automation</p>
                    <h1 className="text-3xl font-black text-slate-900 mt-1">Smart Home Dashboard</h1>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-5 py-2.5 rounded-full font-bold text-sm shadow-sm border border-emerald-100">
                    <Wifi size={18} /> Realtime Connected
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8">

                {/* Left: Alerts & 6 Bulbs */}
                <div className="col-span-3 space-y-6">
                    <div className={`p-6 rounded-[2rem] border transition-all ${sensors.fire_detected ? 'bg-red-50 border-red-200 animate-pulse' : 'bg-white border-transparent shadow-sm'}`}>
                        <div className="flex justify-between items-center mb-3">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${sensors.fire_detected ? 'text-red-600' : 'text-emerald-500'}`}>Fire Warning</span>
                            <span className="font-bold text-xs">{sensors.fire_detected ? '100%' : '0%'}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl ${sensors.fire_detected ? 'bg-red-500 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
                                {sensors.fire_detected ? <ShieldAlert /> : <Zap size={22} />}
                            </div>
                            <span className="font-black text-2xl tracking-tight">{sensors.fire_detected ? "DANGER" : "SAFE"}</span>
                        </div>
                    </div>

                    <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-bold text-slate-400 text-xs uppercase tracking-widest">Room Lights</h3>
                            <button className="bg-slate-900 text-white text-[10px] px-4 py-1.5 rounded-xl font-bold hover:bg-slate-700 transition-colors">On All</button>
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5, 6].map((num) => (
                                <div key={num} className={`flex items-center justify-between p-4 rounded-2xl transition-colors ${devices[`bulb_${num}`] ? 'bg-amber-50/50' : 'bg-slate-50'}`}>
                                    <div className="flex items-center gap-4">
                                        <Lightbulb size={20} className={devices[`bulb_${num}`] ? 'text-amber-500 fill-amber-500' : 'text-slate-300'} />
                                        <div>
                                            <p className="text-xs font-bold text-slate-700">Bulb {num}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">Light is {devices[`bulb_${num}`] ? 'on' : 'off'}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleToggle(`bulb_${num}`, !devices[`bulb_${num}`])}
                                        className={`w-11 h-6 rounded-full relative transition-colors shadow-inner ${devices[`bulb_${num}`] ? 'bg-amber-400' : 'bg-slate-300'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${devices[`bulb_${num}`] ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Center: Main Sensor Telemetry */}
                <div className="col-span-5 bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">Live Home</h3>
                            <div className="bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full text-[10px] font-bold border border-emerald-500/20 flex items-center gap-2 uppercase tracking-widest">
                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" /> Live
                            </div>
                        </div>
                        <h2 className="text-4xl font-bold mb-12 tracking-tight">Sensor Readings</h2>

                        <div className="space-y-12">
                            <SensorItem label="Temperature" value={sensors.temperature} unit="°C" icon={<Thermometer className="text-rose-400" />} color="bg-rose-400" max={50} />
                            <SensorItem label="Humidity" value={sensors.humidity} unit="%" icon={<Droplets className="text-sky-400" />} color="bg-sky-400" max={100} />
                            <SensorItem label="Gas Level" value={sensors.gas_level} unit="ppm" icon={<Wind className="text-emerald-400" />} color="bg-emerald-400" max={1024} />
                        </div>
                    </div>
                </div>

                {/* Right: Fan, Pump & 6 Doors */}
                <div className="col-span-4 space-y-6">
                    <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Environmental Controls</span>
                            <span className={`text-[10px] font-bold uppercase ${devices.fan ? 'text-sky-500' : 'text-slate-300'}`}>{devices.fan ? 'Active' : 'Off'}</span>
                        </div>
                        <div className="flex items-center gap-5">
                            <button
                                onClick={() => handleToggle('fan', !devices.fan)}
                                className={`p-4 rounded-[1.5rem] transition-all ${devices.fan ? 'bg-sky-100 text-sky-600 shadow-md rotate-180' : 'bg-slate-50 text-slate-400'}`}
                            >
                                <Wind size={28} />
                            </button>
                            <div>
                                <h4 className="text-2xl font-black text-slate-800">{devices.fan ? 'FAN ACTIVE' : 'FAN STANDBY'}</h4>
                                <p className="text-xs font-bold text-slate-400">Simulation Motor</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100 flex-1">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-bold text-slate-400 text-xs uppercase tracking-widest">Security Gates</h3>
                            <button className="bg-slate-900 text-white text-[10px] px-4 py-1.5 rounded-xl font-bold">Lock All</button>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {[1, 2, 3, 4, 5, 6].map((num) => (
                                <div key={num} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100/50">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-xl ${devices[`door_${num}`] > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                                            {devices[`door_${num}`] > 0 ? <Unlock size={18} /> : <Lock size={18} />}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">Gate {num}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{devices[`door_${num}`] > 0 ? 'Unlocked' : 'Locked'}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleToggle(`door_${num}`, devices[`door_${num}`] === 0 ? 90 : 0)}
                                        className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-tighter transition-all ${devices[`door_${num}`] > 0 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-slate-200 text-slate-600'}`}
                                    >
                                        {devices[`door_${num}`] > 0 ? 'OPEN' : 'CLOSE'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

const SensorItem = ({ label, value, unit, icon, color, max }) => (
    <div>
        <div className="flex justify-between items-end mb-4">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700/50 shadow-xl">{icon}</div>
                <span className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em]">{label}</span>
            </div>
            <span className="text-xs font-bold text-slate-500">{Math.round((value / max) * 100)}%</span>
        </div>
        <div className="flex items-baseline gap-2 mb-4">
            <span className="text-5xl font-black tracking-tighter">{value}</span>
            <span className="text-slate-500 font-bold text-lg">{unit}</span>
        </div>
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-[1.5px]">
            <div
                className={`h-full ${color} rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(0,0,0,0.5)]`}
                style={{ width: `${(value / max) * 100}%` }}
            />
        </div>
    </div>
);

export default Dashboard;