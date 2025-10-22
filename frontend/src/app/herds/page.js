"use client"
import HerdsList from './components/HerdsList';
import { useRouter } from 'next/navigation';

const Herds = () => {
  const router = useRouter();

  const onEdit = (id) => {
    router.push(`/herds/edit/${id ? id : ''}`);
  }; 

  return (
    <div>
      <HerdsList onEdit={onEdit}/>
    </div>
  );
}

export default Herds

