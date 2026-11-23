export interface Department {
  name: string;
  cities: string[];
}

export const DEPARTMENTS: Department[] = [
  { name: 'Amazonas', cities: ['Leticia', 'Puerto Nariño'] },
  { name: 'Antioquia', cities: ['Medellín', 'Bello', 'Itagüí', 'Envigado', 'Apartadó', 'Turbo', 'Rionegro', 'Caucasia', 'Copacabana', 'Sabaneta', 'La Estrella', 'Caldas', 'Girardota', 'Barbosa'] },
  { name: 'Arauca', cities: ['Arauca', 'Saravena', 'Tame', 'Fortul'] },
  { name: 'Atlántico', cities: ['Barranquilla', 'Soledad', 'Malambo', 'Sabanalarga', 'Galapa', 'Baranoa', 'Puerto Colombia'] },
  { name: 'Bolívar', cities: ['Cartagena', 'Magangué', 'Turbaco', 'Arjona', 'El Carmen de Bolívar', 'San Juan Nepomuceno'] },
  { name: 'Boyacá', cities: ['Tunja', 'Duitama', 'Sogamoso', 'Chiquinquirá', 'Paipa', 'Puerto Boyacá', 'Villa de Leyva'] },
  { name: 'Caldas', cities: ['Manizales', 'La Dorada', 'Chinchiná', 'Villamaría', 'Anserma', 'Riosucio'] },
  { name: 'Caquetá', cities: ['Florencia', 'San Vicente del Caguán', 'Puerto Rico', 'El Doncello'] },
  { name: 'Casanare', cities: ['Yopal', 'Aguazul', 'Villanueva', 'Tauramena', 'Paz de Ariporo'] },
  { name: 'Cauca', cities: ['Popayán', 'Santander de Quilichao', 'Puerto Tejada', 'Guapi', 'Piendamó'] },
  { name: 'Cesar', cities: ['Valledupar', 'Aguachica', 'Codazzi', 'Bosconia', 'La Jagua de Ibirico', 'Curumaní'] },
  { name: 'Chocó', cities: ['Quibdó', 'Istmina', 'Tadó', 'Condoto', 'Bahía Solano'] },
  { name: 'Córdoba', cities: ['Montería', 'Cereté', 'Lorica', 'Sahagún', 'Montelíbano', 'Tierralta', 'Planeta Rica'] },
  { name: 'Cundinamarca', cities: ['Bogotá D.C.', 'Soacha', 'Facatativá', 'Zipaquirá', 'Chía', 'Fusagasugá', 'Madrid', 'Mosquera', 'Girardot', 'Cajicá', 'Funza', 'Sibaté', 'Tocancipá', 'Sopó', 'La Calera', 'Cota', 'Tabio', 'Tenjo'] },
  { name: 'Guainía', cities: ['Inírida'] },
  { name: 'Guaviare', cities: ['San José del Guaviare', 'El Retorno', 'Calamar'] },
  { name: 'Huila', cities: ['Neiva', 'Pitalito', 'Garzón', 'La Plata', 'Campoalegre', 'San Agustín'] },
  { name: 'La Guajira', cities: ['Riohacha', 'Maicao', 'Uribia', 'San Juan del Cesar', 'Fonseca'] },
  { name: 'Magdalena', cities: ['Santa Marta', 'Ciénaga', 'Fundación', 'El Banco', 'Plato', 'Aracataca'] },
  { name: 'Meta', cities: ['Villavicencio', 'Acacías', 'Granada', 'Puerto López', 'San Martín', 'Restrepo'] },
  { name: 'Nariño', cities: ['Pasto', 'Tumaco', 'Ipiales', 'La Unión', 'Túquerres', 'Samaniego'] },
  { name: 'Norte de Santander', cities: ['Cúcuta', 'Ocaña', 'Pamplona', 'Los Patios', 'Villa del Rosario', 'El Zulia'] },
  { name: 'Putumayo', cities: ['Mocoa', 'Puerto Asís', 'Orito', 'Valle del Guamuez', 'Villagarzón'] },
  { name: 'Quindío', cities: ['Armenia', 'Calarcá', 'La Tebaida', 'Montenegro', 'Quimbaya', 'Circasia'] },
  { name: 'Risaralda', cities: ['Pereira', 'Dosquebradas', 'Santa Rosa de Cabal', 'La Virginia', 'Marsella'] },
  { name: 'San Andrés y Providencia', cities: ['San Andrés', 'Providencia'] },
  { name: 'Santander', cities: ['Bucaramanga', 'Floridablanca', 'Girón', 'Piedecuesta', 'Barrancabermeja', 'San Gil', 'Socorro'] },
  { name: 'Sucre', cities: ['Sincelejo', 'Corozal', 'San Marcos', 'Tolú', 'Sampués', 'San Onofre'] },
  { name: 'Tolima', cities: ['Ibagué', 'Espinal', 'Melgar', 'Honda', 'Mariquita', 'Líbano', 'Chaparral'] },
  { name: 'Valle del Cauca', cities: ['Cali', 'Buenaventura', 'Palmira', 'Tuluá', 'Cartago', 'Buga', 'Yumbo', 'Jamundí', 'Candelaria', 'Florida'] },
  { name: 'Vaupés', cities: ['Mitú', 'Carurú'] },
  { name: 'Vichada', cities: ['Puerto Carreño', 'La Primavera', 'Cumaribo'] },
];
