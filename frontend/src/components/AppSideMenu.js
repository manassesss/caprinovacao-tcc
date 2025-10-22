"use client"
import React, {useState, useEffect} from 'react';
import { Menu } from 'antd';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FaHome, 
  FaBuilding, 
  FaUsers, 
  FaHorse, 
  FaDna, 
  FaVirus, 
  FaPills, 
  FaHeartbeat, 
  FaExchangeAlt, 
  FaStethoscope, 
  FaBug, 
  FaSyringe, 
  FaChartBar, 
  FaHeart,
  FaChartLine,
  FaBaby,
  FaChartArea,
  FaRuler,
  FaEye,
  FaClipboardList,
  FaShieldAlt
} from 'react-icons/fa';

const AppSideMenu = () => {
    const pathName = usePathname()
    const [selectedKey, setSelectedKey] = useState(['1'])

    useEffect(() => {
        if(pathName === "/") {
            setSelectedKey(["0"])
        } else if(pathName.startsWith("/fazendas")) {
            setSelectedKey(["10"])
        } else if(pathName.startsWith("/employees")) {
            setSelectedKey(["11"])
        } else if(pathName.startsWith("/herds")) {
            setSelectedKey(["12"])
        } else if(pathName.startsWith("/animals")) {
            setSelectedKey(["13"])
        } else if(pathName.startsWith("/races")) {
            setSelectedKey(["14"])
        } else if(pathName.startsWith("/illnesses")) {
            setSelectedKey(["15"])
        } else if(pathName.startsWith("/medicines")) {
            setSelectedKey(["16"])
        } else if(pathName.startsWith("/reproductive-management")) {
            setSelectedKey(["21"])
        } else if(pathName.startsWith("/animal-movimentation")) {
            setSelectedKey(["22"])
        } else if(pathName.startsWith("/clinical-occurrence")) {
            setSelectedKey(["23"])
        }  else if(pathName.startsWith("/parasite-control")) {
            setSelectedKey(["24"])
        }  else if(pathName.startsWith("/vaccination")) {
            setSelectedKey(["25"])
        } else if(pathName.startsWith("/mating")) {
            setSelectedKey(["3"])
        } else if(pathName.startsWith("/reports/zootechnical")) {
            setSelectedKey(["41"])
        } else if(pathName.startsWith("/reports/animals-by-entry")) {
            setSelectedKey(["42"])
        } else if(pathName.startsWith("/reports/animal-movements")) {
            setSelectedKey(["43"])
        } else if(pathName.startsWith("/reports/offspring-count")) {
            setSelectedKey(["44"])
        } else if(pathName.startsWith("/reports/cpm")) {
            setSelectedKey(["45"])
        } else if(pathName.startsWith("/reports/fat-thickness")) {
            setSelectedKey(["46"])
        } else if(pathName.startsWith("/reports/loin-eye")) {
            setSelectedKey(["47"])
        } else if(pathName.startsWith("/reports/clinical-occurrences")) {
            setSelectedKey(["48"])
        } else if(pathName.startsWith("/reports/parasite-control-report")) {
            setSelectedKey(["49"])
        } else if(pathName.startsWith("/reports/deworming")) {
            setSelectedKey(["50"])
        }
        
    }, [pathName] )

    const menuItems = [
        {
            label: <Link href='/'><FaHome className="inline mr-2" />Dashboard</Link>, 
            key: 0,
        },
        {
            type: 'divider'
        },
        {
            label: 'Cadastros', 
            key: 1,
            children: [
                { key: '10', label: <Link href='/fazendas'><FaBuilding className="inline mr-2" />Fazendas</Link> },
                { key: '11', label: <Link href='/employees'><FaUsers className="inline mr-2" />Funcionários</Link> },
                { key: '12', label: <Link href='/herds'><FaHorse className="inline mr-2" />Rebanhos</Link> },
                { key: '13', label: <Link href='/animals'><FaHorse className="inline mr-2" />Animais</Link> },
                { key: '14', label: <Link href='/races'><FaDna className="inline mr-2" />Raças</Link> },
                { key: '15', label: <Link href='/illnesses'><FaVirus className="inline mr-2" />Doenças</Link> },
                { key: '16', label: <Link href='/medicines'><FaPills className="inline mr-2" />Medicamentos</Link> }, 
            ],
        },
        {
            label: 'Controle Animal', 
            key: 2,
            children: [
                { key: '21', label: <Link href='/reproductive-management'><FaHeart className="inline mr-2" />Manejo Reprodutivo</Link> },
                { key: '22', label: <Link href='/animal-movimentation'><FaExchangeAlt className="inline mr-2" />Movimentação Animal</Link> },
                { key: '23', label: <Link href='/clinical-occurrence'><FaStethoscope className="inline mr-2" />Ocorrência Clínica</Link> },
                { key: '24', label: <Link href='/parasite-control'><FaBug className="inline mr-2" />Controle Parasitário</Link> },
                { key: '25', label: <Link href='/vaccination'><FaSyringe className="inline mr-2" />Vacinação</Link> },
            ],
        },
        {
            label: 'Relatórios', 
            key: 4,
            children: [
                { key: '41', label: <Link href='/reports/zootechnical'><FaChartLine className="inline mr-2" />Dados Zootécnicos</Link> },
                { key: '42', label: <Link href='/reports/animals-by-entry'><FaHorse className="inline mr-2" />Animais por Entrada</Link> },
                { key: '43', label: <Link href='/reports/animal-movements'><FaExchangeAlt className="inline mr-2" />Movimentação Animal</Link> },
                { key: '44', label: <Link href='/reports/offspring-count'><FaBaby className="inline mr-2" />Número de Crias</Link> },
                { key: '45', label: <Link href='/reports/cpm'><FaChartArea className="inline mr-2" />CPM (C, P, M)</Link> },
                { key: '46', label: <Link href='/reports/fat-thickness'><FaRuler className="inline mr-2" />Espessura de Gordura</Link> },
                { key: '47', label: <Link href='/reports/loin-eye'><FaEye className="inline mr-2" />Olho de Lombo</Link> },
                { key: '48', label: <Link href='/reports/clinical-occurrences'><FaStethoscope className="inline mr-2" />Ocorrências Clínicas</Link> },
                { key: '49', label: <Link href='/reports/parasite-control-report'><FaBug className="inline mr-2" />Controle Parasitário</Link> },
                { key: '50', label: <Link href='/reports/deworming'><FaShieldAlt className="inline mr-2" />Vermifugação</Link> },
            ],
        },
        {
            label: <Link href='/mating'>Acasalamento</Link>,
            key: 3,
        },
    ];

    return (
         <Menu mode='inline' items={menuItems} selectedKeys={selectedKey}></Menu>
    );
}

export default AppSideMenu;