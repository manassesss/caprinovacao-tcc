"use client"
import AnimalMovimentationList from "./components/AnimalMovimentationList";
import { useRouter } from 'next/navigation';

const Animal = () => {
  const router = useRouter();

  const onEdit = (id) => {
    router.push(`/animal-movimentation/edit/${id ? id : ''}`);
  }; 

  return (
    <div>
      <AnimalMovimentationList onEdit={onEdit}/>
    </div>
  );
}

export default  Animal