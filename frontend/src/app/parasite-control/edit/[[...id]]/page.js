"use client"
import ParasiteControlForm from "../components/ParasiteControlForm";
import { useParams } from 'next/navigation';

const ParasiteControlEdit = () => {
    const params = useParams();
    const id = params?.id?.[0];
    
    return (
        <div>
            <ParasiteControlForm id={id} />
        </div>
    );
}

export default ParasiteControlEdit