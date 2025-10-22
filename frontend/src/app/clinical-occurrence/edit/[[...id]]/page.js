"use client"
import ClinicalOccurrenceForm from "../components/ClinicalOccurrenceForm";
import { useParams } from 'next/navigation';

const ClinicalOccurrenceEdit = () => {
    const params = useParams();
    const id = params?.id?.[0];
    
    return (
        <div>
            <ClinicalOccurrenceForm id={id} />
        </div>
    );
}

export default ClinicalOccurrenceEdit