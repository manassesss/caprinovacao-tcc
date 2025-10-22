"use client"
import FlocksList from './components/FlocksList';
import { useRouter } from 'next/navigation';

const Flocks = () => {
  const router = useRouter();

  const onEdit = (id) => {
    router.push(`/flocks/edit/${id ? id : ''}`);
  }; 

  return (
    <div>
      <FlocksList onEdit={onEdit}/>
    </div>
  );
}

export default  Flocks