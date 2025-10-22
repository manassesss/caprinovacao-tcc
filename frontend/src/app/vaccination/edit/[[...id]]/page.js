"use client"
import VaccinationForm from "../components/VaccinationForm";
import { useParams } from 'next/navigation';

const VaccinationEdit = () => {
    const params = useParams();
    const id = params?.id?.[0];
    
    return (
        <div>
            <VaccinationForm id={id} />
        </div>
    );
}

export default VaccinationEdit

