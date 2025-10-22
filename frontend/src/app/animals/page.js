"use client"
import AnimalList from "./components/AnimalsList";
import { useRouter } from 'next/navigation';

const Animal = () => {
  const router = useRouter();

  const onEdit = (id) => {
    router.push(`/animals/edit/${id ? id : ''}`);
  }; 

  return (
    <div>
      <AnimalList onEdit={onEdit}/>
    </div>
  );
}

export default  Animal