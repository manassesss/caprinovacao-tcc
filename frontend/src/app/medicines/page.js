"use client"
import MedicinesList from "./components/MedicinesList";
import { useRouter } from 'next/navigation';

const Medicines = () => {
  const router = useRouter();

  const onEdit = (id) => {
    router.push(`/medicines/edit/${id ? id : ''}`);
  }; 
  return (
    <div>
      <MedicinesList onEdit={onEdit}/>
    </div>
  );
}

export default Medicines