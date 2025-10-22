"use client"
import IllnessesList from "./components/IllnessesList";
import { useRouter } from 'next/navigation';

const Illnesses = () => {
  const router = useRouter();

  const onEdit = (id) => {
    router.push(`/illnesses/edit/${id ? id : ''}`);
  }; 

  return (
    <div>
      <IllnessesList onEdit={onEdit}/>
    </div>
  );
}

export default Illnesses