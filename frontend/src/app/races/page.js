"use client"
import RacesList from "./components/RacesList";
import { useRouter } from 'next/navigation';

const Races = () => {
  const router = useRouter();

  const onEdit = (id) => {
    router.push(`/races/edit/${id ? id : ''}`);
  }; 

  return (
    <div>
      <RacesList onEdit={onEdit}/>
    </div>
  );
}

export default Races