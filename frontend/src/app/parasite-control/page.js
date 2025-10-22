"use client"
import ParasiteControlList from './components/ParasiteControlList';
import { useRouter } from 'next/navigation';


const Employees = () => {
  const router = useRouter();

  const onEdit = (id) => {
    router.push(`/parasite-control/edit/${id ? id : ''}`);
  }; 

  return (
    <div>
      <ParasiteControlList onEdit={onEdit}/>
    </div>
  );
}

export default  Employees