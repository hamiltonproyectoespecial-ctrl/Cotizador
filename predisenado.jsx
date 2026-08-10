const { useState, useEffect } = React;

const DEFAULT_AREAS = [
    'Lenguaje', 'Matemáticas', 'Estadística', 'Geometría', 'Sociales', 'Historia',
    'Geografía', 'Filosofía', 'Economía', 'Política', 'Eco política', 'Democracia',
    'Cátedra socio emocional', 'Naturales', 'Biología', 'Medio ambiente', 'Química',
    'Física', 'Inglés', 'Informática', 'Edu física', 'Religión', 'Ética', 'Artística'
];

const DEFAULT_EXAMENES = ['Lenguaje', 'Sociales', 'Matemáticas', 'Naturales', 'Inglés'];

const GRADOS = ["Preescolar", "1°", "2°", "3°", "4°", "5°", "6°", "7°", "8°", "9°", "10°", "11°"];

function CotizadorPredisenadoApp() {
    const [step, setStep] = useState('form');
    const [activeTab, setActiveTab] = useState('mallas');

    // Client Info
    const [institution, setInstitution] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [selectedGrades, setSelectedGrades] = useState([]);

    // Custom Areas
    const [customAreas, setCustomAreas] = useState(() => {
        const saved = localStorage.getItem('predisenado_custom_areas');
        return saved ? JSON.parse(saved) : [];
    });
    const [newAreaName, setNewAreaName] = useState('');

    const allAreas = [...DEFAULT_AREAS, ...customAreas];

    // Mallas Config
    const [mallasPeriods, setMallasPeriods] = useState(4);
    const [mallasPrices, setMallasPrices] = useState({ A: 0, B: 0, Y: 0 });
    const [mallasSelections, setMallasSelections] = useState({});

    // Planes Config
    const [planesPeriods, setPlanesPeriods] = useState(4);
    const [planesPrices, setPlanesPrices] = useState({ A: 0, B: 0, Y: 0 });
    const [planesSelections, setPlanesSelections] = useState({});

    // Exámenes Config
    const [examenes, setExamenes] = useState(() => {
        const obj = {};
        DEFAULT_EXAMENES.forEach(ex => obj[ex] = { active: false, price: 0 });
        return obj;
    });

    const addCustomArea = () => {
        const name = newAreaName.trim();
        if (name && !allAreas.includes(name)) {
            const updated = [...customAreas, name];
            setCustomAreas(updated);
            localStorage.setItem('predisenado_custom_areas', JSON.stringify(updated));
            setNewAreaName('');
        }
    };

    const handleGradeToggle = (g) => {
        setSelectedGrades(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
    };

    const handleMallasToggle = (area) => {
        setMallasSelections(prev => ({
            ...prev,
            [area]: prev[area] ? { ...prev[area], active: !prev[area].active } : { active: true, version: 'A' }
        }));
    };

    const handleMallasVersion = (area, version) => {
        setMallasSelections(prev => ({
            ...prev,
            [area]: { ...prev[area], version }
        }));
    };

    const handlePlanesToggle = (area) => {
        setPlanesSelections(prev => ({
            ...prev,
            [area]: prev[area] ? { ...prev[area], active: !prev[area].active } : { active: true, version: 'A' }
        }));
    };

    const handlePlanesVersion = (area, version) => {
        setPlanesSelections(prev => ({
            ...prev,
            [area]: { ...prev[area], version }
        }));
    };

    const handleExamenToggle = (ex) => {
        setExamenes(prev => ({
            ...prev,
            [ex]: { ...prev[ex], active: !prev[ex].active }
        }));
    };

    const handleExamenPrice = (ex, price) => {
        setExamenes(prev => ({
            ...prev,
            [ex]: { ...prev[ex], price: Number(price) || 0 }
        }));
    };

    const calculateTotals = () => {
        let mallasTotal = 0;
        Object.keys(mallasSelections).forEach(area => {
            if (mallasSelections[area].active) {
                mallasTotal += (mallasPrices[mallasSelections[area].version] || 0) * mallasPeriods;
            }
        });

        let planesTotal = 0;
        Object.keys(planesSelections).forEach(area => {
            if (planesSelections[area].active) {
                planesTotal += (planesPrices[planesSelections[area].version] || 0) * planesPeriods;
            }
        });

        let examenesTotal = 0;
        Object.keys(examenes).forEach(ex => {
            if (examenes[ex].active) {
                examenesTotal += (examenes[ex].price || 0) * selectedGrades.length;
            }
        });

        return { mallasTotal, planesTotal, examenesTotal, grandTotal: mallasTotal + planesTotal + examenesTotal };
    };

    const { mallasTotal, planesTotal, examenesTotal, grandTotal } = calculateTotals();

    const renderForm = () => (
        <div className="space-y-6 text-left pb-12">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-[#172042]">Cotizador Prediseñado</h2>
                <button onClick={() => window.cambiarVista('dashboard')} className="text-[#172042] hover:text-[#F2A900] font-bold flex items-center gap-2">
                    ← Volver al Panel
                </button>
            </div>

            {/* Info Institución */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-[#F2A900]">
                <h3 className="text-lg font-bold text-[#172042] mb-4 border-b pb-2">Información de la Institución</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Nombre Colegio *</label>
                        <input type="text" value={institution} onChange={e => setInstitution(e.target.value)} className="w-full border rounded p-2 focus:ring-[#F2A900] outline-none" placeholder="Nombre de la Institución" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Teléfono</label>
                        <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full border rounded p-2 focus:ring-[#F2A900] outline-none" placeholder="Teléfono de contacto" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Email <span className="text-gray-400 font-normal">(Opcional)</span></label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded p-2 focus:ring-[#F2A900] outline-none" placeholder="Correo electrónico" />
                    </div>
                </div>

                <div className="mt-6">
                    <label className="block text-xs font-bold text-gray-700 mb-2">Grados a Cotizar *</label>
                    <div className="flex flex-wrap gap-2">
                        {GRADOS.map(g => (
                            <button key={g} onClick={() => handleGradeToggle(g)} className={`px-3 py-1 rounded border text-sm font-bold transition-colors ${selectedGrades.includes(g) ? 'bg-[#172042] text-white border-[#172042]' : 'bg-gray-50 text-gray-600 hover:bg-gray-200'}`}>
                                {g}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* TABS */}
            <div className="flex bg-white rounded-t-xl shadow-sm border-b overflow-hidden">
                <button onClick={() => setActiveTab('mallas')} className={`flex-1 py-4 font-bold transition-colors ${activeTab === 'mallas' ? 'border-b-4 border-[#F2A900] text-[#172042] bg-gray-50' : 'text-gray-500 hover:bg-gray-50'}`}>
                    MALLAS CURRICULARES
                </button>
                <button onClick={() => setActiveTab('planes')} className={`flex-1 py-4 font-bold transition-colors ${activeTab === 'planes' ? 'border-b-4 border-blue-500 text-blue-900 bg-blue-50/30' : 'text-gray-500 hover:bg-gray-50'}`}>
                    PLANES
                </button>
                <button onClick={() => setActiveTab('examenes')} className={`flex-1 py-4 font-bold transition-colors ${activeTab === 'examenes' ? 'border-b-4 border-green-500 text-green-900 bg-green-50/30' : 'text-gray-500 hover:bg-gray-50'}`}>
                    EXÁMENES
                </button>
            </div>

            <div className="bg-white p-6 rounded-b-xl shadow-md border-t-0 border border-gray-200">
                
                {/* TAB CONTENIDO: MALLAS */}
                {activeTab === 'mallas' && (
                    <div>
                        <div className="flex justify-between items-center mb-4 border-b pb-2 border-gray-200">
                            <h3 className="text-xl font-bold text-[#172042]">Configuración de Mallas</h3>
                            <div className="flex items-center gap-4">
                                <label className="text-sm font-bold text-gray-700">Periodos:</label>
                                <select value={mallasPeriods} onChange={e => setMallasPeriods(Number(e.target.value))} className="border rounded p-1 font-bold">
                                    <option value={3}>3 Periodos</option>
                                    <option value={4}>4 Periodos</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Valor Versión A ($)</label>
                                <input type="number" value={mallasPrices.A || ''} onChange={e => setMallasPrices({...mallasPrices, A: Number(e.target.value)})} className="w-full border rounded p-2 focus:ring-[#F2A900] outline-none font-mono" placeholder="Ej: 50000" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Valor Versión B ($)</label>
                                <input type="number" value={mallasPrices.B || ''} onChange={e => setMallasPrices({...mallasPrices, B: Number(e.target.value)})} className="w-full border rounded p-2 focus:ring-[#F2A900] outline-none font-mono" placeholder="Ej: 70000" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Valor Versión Y ($)</label>
                                <input type="number" value={mallasPrices.Y || ''} onChange={e => setMallasPrices({...mallasPrices, Y: Number(e.target.value)})} className="w-full border rounded p-2 focus:ring-[#F2A900] outline-none font-mono" placeholder="Ej: 90000" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                            {allAreas.map(area => {
                                const active = mallasSelections[area]?.active || false;
                                const version = mallasSelections[area]?.version || 'A';
                                return (
                                    <div key={`m_${area}`} className={`border rounded p-3 transition-colors ${active ? 'border-[#F2A900] bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <input type="checkbox" checked={active} onChange={() => handleMallasToggle(area)} className="w-4 h-4 text-[#F2A900] focus:ring-[#F2A900]" />
                                            <span className={`text-sm font-bold ${active ? 'text-[#172042]' : 'text-gray-500'}`}>{area}</span>
                                        </div>
                                        {active && (
                                            <div className="pl-6 flex gap-2">
                                                {['A', 'B', 'Y'].map(v => (
                                                    <button key={v} onClick={() => handleMallasVersion(area, v)} className={`px-2 py-0.5 text-xs font-bold rounded ${version === v ? 'bg-[#172042] text-white' : 'bg-white border text-gray-500 hover:bg-gray-100'}`}>
                                                        Ver {v}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* TAB CONTENIDO: PLANES */}
                {activeTab === 'planes' && (
                    <div>
                        <div className="flex justify-between items-center mb-4 border-b pb-2 border-gray-200">
                            <h3 className="text-xl font-bold text-blue-900">Configuración de Planes</h3>
                            <div className="flex items-center gap-4">
                                <label className="text-sm font-bold text-gray-700">Periodos:</label>
                                <select value={planesPeriods} onChange={e => setPlanesPeriods(Number(e.target.value))} className="border rounded p-1 font-bold">
                                    <option value={3}>3 Periodos</option>
                                    <option value={4}>4 Periodos</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-blue-50 p-4 rounded-lg">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Valor Versión A ($)</label>
                                <input type="number" value={planesPrices.A || ''} onChange={e => setPlanesPrices({...planesPrices, A: Number(e.target.value)})} className="w-full border rounded p-2 focus:ring-blue-500 outline-none font-mono" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Valor Versión B ($)</label>
                                <input type="number" value={planesPrices.B || ''} onChange={e => setPlanesPrices({...planesPrices, B: Number(e.target.value)})} className="w-full border rounded p-2 focus:ring-blue-500 outline-none font-mono" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Valor Versión Y ($)</label>
                                <input type="number" value={planesPrices.Y || ''} onChange={e => setPlanesPrices({...planesPrices, Y: Number(e.target.value)})} className="w-full border rounded p-2 focus:ring-blue-500 outline-none font-mono" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                            {allAreas.map(area => {
                                const active = planesSelections[area]?.active || false;
                                const version = planesSelections[area]?.version || 'A';
                                return (
                                    <div key={`p_${area}`} className={`border rounded p-3 transition-colors ${active ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <input type="checkbox" checked={active} onChange={() => handlePlanesToggle(area)} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                                            <span className={`text-sm font-bold ${active ? 'text-blue-900' : 'text-gray-500'}`}>{area}</span>
                                        </div>
                                        {active && (
                                            <div className="pl-6 flex gap-2">
                                                {['A', 'B', 'Y'].map(v => (
                                                    <button key={v} onClick={() => handlePlanesVersion(area, v)} className={`px-2 py-0.5 text-xs font-bold rounded ${version === v ? 'bg-blue-900 text-white' : 'bg-white border text-gray-500 hover:bg-gray-100'}`}>
                                                        Ver {v}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* TAB CONTENIDO: EXÁMENES */}
                {activeTab === 'examenes' && (
                    <div>
                        <h3 className="text-xl font-bold text-green-900 mb-4 border-b pb-2 border-gray-200">Exámenes por Competencias</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                            {DEFAULT_EXAMENES.map(ex => {
                                const active = examenes[ex].active;
                                return (
                                    <div key={`ex_${ex}`} className={`border rounded p-3 transition-colors ${active ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <input type="checkbox" checked={active} onChange={() => handleExamenToggle(ex)} className="w-4 h-4 text-green-600 focus:ring-green-500" />
                                            <span className={`text-sm font-bold ${active ? 'text-green-900' : 'text-gray-500'}`}>{ex}</span>
                                        </div>
                                        {active && (
                                            <div className="pl-6">
                                                <label className="text-xs text-gray-500 block mb-1">Valor por Examen ($)</label>
                                                <input type="number" value={examenes[ex].price || ''} onChange={e => handleExamenPrice(ex, e.target.value)} className="w-full border rounded p-1 text-sm outline-none focus:ring-green-500 font-mono" />
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Agregar Área Personalizada compartida por Mallas y Planes */}
                {(activeTab === 'mallas' || activeTab === 'planes') && (
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row items-end gap-4 mt-6">
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-bold text-gray-700 mb-1">Añadir nueva área a las listas</label>
                            <input type="text" value={newAreaName} onChange={e => setNewAreaName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomArea()} placeholder="Nombre de la nueva área..." className="w-full border rounded p-2 focus:ring-[#F2A900] outline-none" />
                        </div>
                        <button onClick={addCustomArea} className="w-full md:w-auto bg-gray-800 hover:bg-black text-white px-6 py-2 rounded font-bold transition-colors">Añadir Área</button>
                    </div>
                )}
            </div>

            {/* Generar Botón */}
            <div className="flex justify-end gap-4 mt-8 pt-4">
                <button onClick={() => setStep('quote')} disabled={!institution || selectedGrades.length === 0} className="bg-[#172042] hover:bg-[#22305c] text-white font-bold py-3 px-8 rounded-lg shadow-lg disabled:opacity-50 transition-colors text-lg">
                    Generar Resumen de Cotización
                </button>
            </div>
        </div>
    );

    const renderQuote = () => (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-left max-w-4xl mx-auto mt-8">
            <div className="flex justify-between items-center mb-8 border-b pb-4">
                <div>
                    <h2 className="text-3xl font-black text-[#172042]">Cotización Prediseñada</h2>
                    <p className="text-gray-500 mt-1">Institución: <span className="font-bold text-[#172042]">{institution}</span></p>
                    <p className="text-gray-500">Grados: <span className="font-bold text-[#172042]">{selectedGrades.join(', ')}</span> ({selectedGrades.length})</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Fecha: {new Date().toLocaleDateString()}</p>
                    <p className="text-sm text-gray-500">Asesor: <span className="font-bold text-[#172042]">{window.appData?.currentUser || 'Asesor'}</span></p>
                </div>
            </div>

            {mallasTotal > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-800 bg-gray-100 p-2 rounded mb-2">Mallas Curriculares ({mallasPeriods} Periodos)</h3>
                    <ul className="list-disc pl-5 text-sm text-gray-600 mb-2">
                        {Object.keys(mallasSelections).filter(a => mallasSelections[a].active).map(a => (
                            <li key={a}>{a} - Versión {mallasSelections[a].version} ($ {(mallasPrices[mallasSelections[a].version] || 0).toLocaleString()} x {mallasPeriods} per = $ {((mallasPrices[mallasSelections[a].version] || 0) * mallasPeriods).toLocaleString()})</li>
                        ))}
                    </ul>
                    <p className="text-right font-bold text-[#172042]">Subtotal Mallas: $ {mallasTotal.toLocaleString()}</p>
                </div>
            )}

            {planesTotal > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-800 bg-gray-100 p-2 rounded mb-2">Planes ({planesPeriods} Periodos)</h3>
                    <ul className="list-disc pl-5 text-sm text-gray-600 mb-2">
                        {Object.keys(planesSelections).filter(a => planesSelections[a].active).map(a => (
                            <li key={a}>{a} - Versión {planesSelections[a].version} ($ {(planesPrices[planesSelections[a].version] || 0).toLocaleString()} x {planesPeriods} per = $ {((planesPrices[planesSelections[a].version] || 0) * planesPeriods).toLocaleString()})</li>
                        ))}
                    </ul>
                    <p className="text-right font-bold text-[#172042]">Subtotal Planes: $ {planesTotal.toLocaleString()}</p>
                </div>
            )}

            {examenesTotal > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-800 bg-gray-100 p-2 rounded mb-2">Exámenes por Competencias ({selectedGrades.length} Grados)</h3>
                    <ul className="list-disc pl-5 text-sm text-gray-600 mb-2">
                        {Object.keys(examenes).filter(a => examenes[a].active).map(a => (
                            <li key={a}>{a} ($ {(examenes[a].price || 0).toLocaleString()} x {selectedGrades.length} = $ {((examenes[a].price || 0) * selectedGrades.length).toLocaleString()})</li>
                        ))}
                    </ul>
                    <p className="text-right font-bold text-[#172042]">Subtotal Exámenes: $ {examenesTotal.toLocaleString()}</p>
                </div>
            )}

            <div className="border-t-4 border-[#F2A900] pt-4 mt-8">
                <p className="text-3xl font-black text-right text-[#172042]">TOTAL: $ {grandTotal.toLocaleString()}</p>
            </div>

            <div className="flex justify-end gap-4 mt-8 print:hidden">
                <button onClick={() => setStep('form')} className="border border-gray-400 text-gray-600 hover:bg-gray-100 px-6 py-2 rounded font-bold transition-colors">Volver a Editar</button>
                <button onClick={() => window.print()} className="bg-[#172042] text-white hover:bg-[#22305c] px-6 py-2 rounded font-bold transition-colors shadow">Imprimir / PDF</button>
            </div>
        </div>
    );

    return (
        <div className="font-sans max-w-5xl mx-auto">
            {step === 'form' ? renderForm() : renderQuote()}
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('cotizador-predisenado-root')).render(<CotizadorPredisenadoApp />);
