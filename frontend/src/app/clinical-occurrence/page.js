"use client"
import ClinicalOccurrenceList from "./components/ClinicalOccurrenceList";
import { useRouter } from 'next/navigation';

const Animal = () => {
  const router = useRouter();

  const onEdit = (id) => {
    router.push(`/clinical-occurrence/edit/${id ? id : ''}`);
  }; 

  return (
    <div>
      <ClinicalOccurrenceList onEdit={onEdit}/>
    </div>
  );
}

export default  Animal