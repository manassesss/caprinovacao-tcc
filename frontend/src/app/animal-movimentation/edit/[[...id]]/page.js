"use client"
import AnimalMovimentationForm from "../components/AnimalMovimentationForm";
import { useParams } from 'next/navigation';

const AnimalMovimentationEdit = () => {
    const params = useParams();
    const id = params?.id?.[0];
    
    return (
        <div>
            <AnimalMovimentationForm id={id} />
        </div>
    );
}

export default AnimalMovimentationEdit