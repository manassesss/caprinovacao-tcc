"use client"
import VaccinationList from "./components/VaccinationList";
import { useRouter } from 'next/navigation';

const Vaccination = () => {
  const router = useRouter();

  const onEdit = (id) => {
    router.push(`/vaccination/edit/${id ? id : ''}`);
  }; 

  return (
    <div>
      <VaccinationList onEdit={onEdit}/>
    </div>
  );
}

export default Vaccination

